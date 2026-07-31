/**
 * Video tools — FFmpeg WASM
 *
 * Three of the four operations here are stream copies: trimming, muting and
 * (where the container allows) remuxing move compressed packets around
 * without touching the codec. They finish in seconds and lose nothing.
 *
 * Converting is the exception. A real re-encode in WebAssembly runs roughly
 * an order of magnitude slower than native FFmpeg, so a five-minute clip is a
 * multi-minute wait. The UI says so before you start rather than after.
 */

import {
  runFFmpegJob,
  withFFmpeg,
  readOutput,
  fetchFile,
  hasAudioStream,
  type ProgressFn,
} from "./ffmpeg";
import { toTimestamp } from "./media-info";
import { createZip, type ZipEntry } from "./zip";
import { atempoChain } from "./audio-speed";

function sourceExtension(file: File): string {
  return file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase() ?? "mp4";
}

export interface VideoResult {
  blob: Blob;
  filename: string;
  originalSize: number;
}

/* ─── Trim ─────────────────────────────────────────────────────────────── */

/**
 * Cut a range out of a video without re-encoding.
 *
 * `-ss` before `-i` seeks by keyframe, which is fast but can only land on a
 * keyframe — so the cut may start up to a couple of seconds early. That is
 * the price of not re-encoding, and the UI explains it.
 */
export async function trimVideo(
  file: File,
  startSeconds: number,
  endSeconds: number,
  onProgress?: ProgressFn
): Promise<VideoResult> {
  if (endSeconds <= startSeconds) {
    throw new Error("The end time must be after the start time.");
  }

  const ext = sourceExtension(file);

  const blob = await runFFmpegJob(
    {
      file,
      inputName: `input.${ext}`,
      outputName: `output.${ext}`,
      args: [
        "-ss", toTimestamp(startSeconds),
        "-to", toTimestamp(endSeconds),
        "-c", "copy",
        // Without this, a cut that starts mid-GOP leaves timestamps that
        // begin at the source offset and many players show a long black lead-in.
        "-avoid_negative_ts", "make_zero",
      ],
      outputMime: file.type || "video/mp4",
      label: "Trimming…",
      band: [30, 90],
      failureMessage:
        "FFmpeg couldn't trim this file. The container may not support copying streams — try converting it to MP4 first.",
    },
    onProgress
  );

  onProgress?.("Done", 100);

  return {
    blob,
    filename: file.name.replace(/\.[^.]+$/, "") + `_trimmed.${ext}`,
    originalSize: file.size,
  };
}

/* ─── Mute ─────────────────────────────────────────────────────────────── */

export async function muteVideo(file: File, onProgress?: ProgressFn): Promise<VideoResult> {
  const ext = sourceExtension(file);

  const blob = await runFFmpegJob(
    {
      file,
      inputName: `input.${ext}`,
      outputName: `output.${ext}`,
      // -an drops audio, -c:v copy leaves the picture completely untouched.
      args: ["-an", "-c:v", "copy"],
      outputMime: file.type || "video/mp4",
      label: "Removing audio…",
      band: [30, 90],
      failureMessage:
        "FFmpeg couldn't process this file. It may be corrupted, or use a container that can't be rewritten without re-encoding.",
    },
    onProgress
  );

  onProgress?.("Done", 100);

  return {
    blob,
    filename: file.name.replace(/\.[^.]+$/, "") + `_muted.${ext}`,
    originalSize: file.size,
  };
}

/* ─── Convert ──────────────────────────────────────────────────────────── */

export type VideoFormat = "mp4" | "webm" | "mkv";

interface VideoFormatSpec {
  label: string;
  extension: string;
  mime: string;
  videoCodec: string[];
  audioCodec: string[];
  note: string;
}

export const VIDEO_FORMATS: Record<VideoFormat, VideoFormatSpec> = {
  mp4: {
    label: "MP4",
    extension: "mp4",
    mime: "video/mp4",
    videoCodec: ["-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p"],
    audioCodec: ["-c:a", "aac", "-b:a", "128k"],
    note: "H.264 in MP4. Plays on effectively every device made this century.",
  },
  webm: {
    label: "WebM",
    extension: "webm",
    mime: "video/webm",
    videoCodec: ["-c:v", "libvpx", "-deadline", "realtime", "-cpu-used", "8"],
    audioCodec: ["-c:a", "libvorbis"],
    note: "VP8 in WebM. Open and royalty-free, and noticeably slower to encode here.",
  },
  mkv: {
    label: "MKV",
    extension: "mkv",
    mime: "video/x-matroska",
    videoCodec: ["-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p"],
    audioCodec: ["-c:a", "aac", "-b:a", "128k"],
    note: "H.264 in Matroska. A flexible container, but not accepted by many web players.",
  },
};

/** Constant Rate Factor: lower is better quality and a larger file. */
export const CRF_PRESETS = [
  { value: 20, label: "High", note: "Near-transparent. Large files." },
  { value: 26, label: "Balanced", note: "The usual choice." },
  { value: 32, label: "Small", note: "Visible softening on detailed footage." },
] as const;

export async function convertVideo(
  file: File,
  format: VideoFormat,
  crf: number,
  onProgress?: ProgressFn
): Promise<VideoResult> {
  const spec = VIDEO_FORMATS[format];
  const ext = sourceExtension(file);

  const blob = await runFFmpegJob(
    {
      file,
      inputName: `input.${ext}`,
      outputName: `output.${spec.extension}`,
      args: [...spec.videoCodec, "-crf", String(crf), ...spec.audioCodec],
      outputMime: spec.mime,
      label: `Encoding ${spec.label}… this takes a while`,
      band: [25, 92],
      failureMessage:
        `FFmpeg couldn't convert this file to ${spec.label}. It may be corrupted, or use a codec this build can't decode.`,
    },
    onProgress
  );

  onProgress?.("Done", 100);

  return {
    blob,
    filename: file.name.replace(/\.[^.]+$/, "") + `.${spec.extension}`,
    originalSize: file.size,
  };
}

/* ─── GIF ──────────────────────────────────────────────────────────────── */

export interface GifOptions {
  startSeconds: number;
  endSeconds: number;
  fps: number;
  /** Output width in pixels; height follows the aspect ratio. */
  width: number;
}

export const GIF_MAX_SECONDS = 30;

export async function videoToGif(
  file: File,
  options: GifOptions,
  onProgress?: ProgressFn
): Promise<VideoResult> {
  const duration = options.endSeconds - options.startSeconds;

  if (duration <= 0) {
    throw new Error("The end time must be after the start time.");
  }
  if (duration > GIF_MAX_SECONDS) {
    throw new Error(
      `A GIF longer than ${GIF_MAX_SECONDS} seconds would be enormous and slow to build. ` +
        `Pick a shorter range.`
    );
  }

  const ext = sourceExtension(file);

  return withFFmpeg(async (ffmpeg, track) => {
    const inputName = track(`input.${ext}`);
    const paletteName = track("palette.png");
    const outputName = track("output.gif");

    const handleProgress = ({ progress }: { progress: number }) => {
      const clamped = Math.max(0, Math.min(1, progress));
      onProgress?.("Encoding GIF…", 55 + Math.round(clamped * 35));
    };

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    onProgress?.("Building colour palette…", 35);

    // GIF is limited to 256 colours. Letting the encoder pick them per-frame
    // from a fixed web palette is what produces the muddy, banded look; a
    // palette generated from the actual footage first is the whole difference.
    const filters = `fps=${options.fps},scale=${options.width}:-1:flags=lanczos`;

    const paletteExit = await ffmpeg.exec([
      "-ss", toTimestamp(options.startSeconds),
      "-t", toTimestamp(duration),
      "-i", inputName,
      "-vf", `${filters},palettegen=stats_mode=diff`,
      "-y", paletteName,
    ]);

    if (paletteExit !== 0) {
      throw new Error(
        "FFmpeg couldn't read this video. It may be corrupted, or use a codec this build can't decode."
      );
    }

    onProgress?.("Encoding GIF…", 55);
    ffmpeg.on("progress", handleProgress);

    try {
      const gifExit = await ffmpeg.exec([
        "-ss", toTimestamp(options.startSeconds),
        "-t", toTimestamp(duration),
        "-i", inputName,
        "-i", paletteName,
        "-lavfi", `${filters}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5`,
        "-loop", "0",
        "-y", outputName,
      ]);

      if (gifExit !== 0) {
        throw new Error("FFmpeg couldn't build the GIF from this video.");
      }
    } finally {
      ffmpeg.off("progress", handleProgress);
    }

    onProgress?.("Packing output…", 95);

    const blob = await readOutput(
      ffmpeg,
      outputName,
      "image/gif",
      "The GIF came out empty. Try a different range."
    );

    onProgress?.("Done", 100);

    return {
      blob,
      filename: file.name.replace(/\.[^.]+$/, "") + ".gif",
      originalSize: file.size,
    };
  }, onProgress);
}

/* ─── Compress ─────────────────────────────────────────────────────────── */

export interface CompressResult extends VideoResult {
  outputSize: number;
  /** Fraction saved, 0–1. Negative when the re-encode came out larger. */
  saved: number;
}

/**
 * Re-encode a video at a chosen quality to make it smaller.
 *
 * CRF is the right knob rather than a target bitrate: it holds *quality*
 * constant and lets the bitrate vary with how hard each scene is to encode,
 * which is why a static screen recording collapses to almost nothing while
 * hand-held footage barely moves. A target-size mode would have to guess a
 * bitrate and then miss it on one of those two cases.
 */
export async function compressVideo(
  file: File,
  crf: number,
  onProgress?: ProgressFn
): Promise<CompressResult> {
  const ext = sourceExtension(file);

  const blob = await runFFmpegJob(
    {
      file,
      inputName: `input.${ext}`,
      outputName: "output.mp4",
      args: [
        "-c:v", "libx264",
        "-crf", String(crf),
        "-preset", "ultrafast",
        // Some phone footage is 4:2:2 or 10-bit, which H.264 baseline players
        // refuse. Forcing 8-bit 4:2:0 keeps the output universally playable.
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "128k",
        // The moov atom defaults to the end of the file, which means a player
        // cannot start until the whole thing has downloaded.
        "-movflags", "+faststart",
      ],
      outputMime: "video/mp4",
      label: "Compressing… this takes a while",
      band: [25, 92],
      failureMessage:
        "FFmpeg couldn't compress this file. It may be corrupted, or use a codec this build can't decode.",
    },
    onProgress
  );

  onProgress?.("Done", 100);

  return {
    blob,
    filename: file.name.replace(/\.[^.]+$/, "") + "_compressed.mp4",
    originalSize: file.size,
    outputSize: blob.size,
    saved: (file.size - blob.size) / file.size,
  };
}

/* ─── Speed ────────────────────────────────────────────────────────────── */

export const MIN_VIDEO_SPEED = 0.25;
export const MAX_VIDEO_SPEED = 4;

/**
 * Change playback speed, keeping audio in sync.
 *
 * `setpts` rewrites video presentation timestamps and `atempo` retimes the
 * audio. They have to be applied as a pair — doing only the first is the
 * classic mistake that leaves a 2× video with audio still running at 1× and
 * drifting further out of sync every second.
 */
export async function changeVideoSpeed(
  file: File,
  speed: number,
  onProgress?: ProgressFn
): Promise<VideoResult> {
  if (!Number.isFinite(speed) || speed < MIN_VIDEO_SPEED || speed > MAX_VIDEO_SPEED) {
    throw new Error(`Speed must be between ${MIN_VIDEO_SPEED}× and ${MAX_VIDEO_SPEED}×.`);
  }
  if (speed === 1) {
    throw new Error("That is the original speed — pick a different value.");
  }

  const ext = sourceExtension(file);

  return withFFmpeg(async (ffmpeg, track) => {
    const inputName = track(`input.${ext}`);
    const outputName = track("output.mp4");

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    const hasAudio = await hasAudioStream(ffmpeg, inputName);

    onProgress?.(`Retiming to ${speed}×…`, 30);

    const handleProgress = ({ progress }: { progress: number }) => {
      const clamped = Math.max(0, Math.min(1, progress));
      onProgress?.(`Retiming to ${speed}×…`, 30 + Math.round(clamped * 60));
    };
    ffmpeg.on("progress", handleProgress);

    try {
      const args = hasAudio
        ? [
            "-i", inputName,
            "-filter_complex",
            `[0:v]setpts=${(1 / speed).toFixed(6)}*PTS[v];[0:a]${atempoChain(speed)}[a]`,
            "-map", "[v]", "-map", "[a]",
            "-c:a", "aac", "-b:a", "128k",
          ]
        : [
            "-i", inputName,
            "-filter:v", `setpts=${(1 / speed).toFixed(6)}*PTS`,
            "-an",
          ];

      const exit = await ffmpeg.exec([
        ...args,
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-pix_fmt", "yuv420p",
        "-y", outputName,
      ]);

      if (exit !== 0) {
        throw new Error(
          "FFmpeg couldn't retime this video. It may be corrupted, or use a codec this build can't decode."
        );
      }
    } finally {
      ffmpeg.off("progress", handleProgress);
    }

    const blob = await readOutput(
      ffmpeg,
      outputName,
      "video/mp4",
      "The retimed video came out empty."
    );

    onProgress?.("Done", 100);

    const suffix = String(speed).replace(".", "-");

    return {
      blob,
      filename: `${file.name.replace(/\.[^.]+$/, "")}_${suffix}x.mp4`,
      originalSize: file.size,
    };
  }, onProgress);
}

/* ─── Merge ────────────────────────────────────────────────────────────── */

export interface MergeVideoResult extends VideoResult {
  fileCount: number;
  /** Set when clips without an audio track were padded with silence. */
  notice: string | null;
}

export const MERGE_MAX_FILES = 10;

/** Output geometry every clip is normalised to before concatenation. */
export const MERGE_RESOLUTIONS = [
  { value: 1920, label: "1080p", note: "1920×1080. The safe default." },
  { value: 1280, label: "720p", note: "1280×720. Smaller and faster." },
  { value: 854, label: "480p", note: "854×480. For quick drafts." },
] as const;

/**
 * Join clips end to end.
 *
 * The fast path — the concat *demuxer* with `-c copy` — needs every input to
 * share a codec, resolution, frame rate and timebase. Clips that came from
 * different phones essentially never do, and when they don't the output is
 * not an error but a file whose second half is garbage. So each clip is
 * normalised to a common geometry first and concatenation happens on the
 * results. It costs a full re-encode, which is why the UI warns about time.
 */
export async function mergeVideos(
  files: File[],
  width: number,
  onProgress?: ProgressFn
): Promise<MergeVideoResult> {
  if (files.length < 2) {
    throw new Error("Pick at least two videos to merge.");
  }
  if (files.length > MERGE_MAX_FILES) {
    throw new Error(`Merge at most ${MERGE_MAX_FILES} videos at a time.`);
  }

  const height = Math.round((width * 9) / 16 / 2) * 2;
  let paddedSilence = false;

  return withFFmpeg(async (ffmpeg, track) => {
    const normalised: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = sourceExtension(file);
      const inputName = track(`in${i}.${ext}`);
      // MPEG-TS rather than MP4 for the intermediates: it is designed to be
      // concatenated by byte, so the final join can be a stream copy.
      const outName = track(`norm${i}.ts`);

      onProgress?.(
        `Preparing clip ${i + 1} of ${files.length}…`,
        20 + Math.round((i / files.length) * 60)
      );

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const hasAudio = await hasAudioStream(ffmpeg, inputName);
      if (!hasAudio) paddedSilence = true;

      // Letterbox rather than stretch — a portrait phone clip next to a
      // landscape one should keep its proportions, not be squashed.
      const videoFilter =
        `scale=${width}:${height}:force_original_aspect_ratio=decrease,` +
        `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30`;

      const audioInput = hasAudio
        ? ["-i", inputName]
        : ["-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100"];

      const exit = await ffmpeg.exec([
        "-i", inputName,
        ...(hasAudio ? [] : audioInput),
        "-filter:v", videoFilter,
        "-map", "0:v:0",
        "-map", hasAudio ? "0:a:0" : "1:a:0",
        ...(hasAudio ? [] : ["-shortest"]),
        "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2",
        "-f", "mpegts",
        "-y", outName,
      ]);

      if (exit !== 0) {
        throw new Error(
          `FFmpeg couldn't read "${file.name}". It may be corrupted, or use a codec this build can't decode.`
        );
      }

      normalised.push(outName);
      await ffmpeg.deleteFile(inputName).catch(() => {});
    }

    onProgress?.("Joining clips…", 85);

    const outputName = track("output.mp4");

    const exit = await ffmpeg.exec([
      "-i", `concat:${normalised.join("|")}`,
      "-c", "copy",
      "-bsf:a", "aac_adtstoasc",
      "-movflags", "+faststart",
      "-y", outputName,
    ]);

    if (exit !== 0) {
      throw new Error("FFmpeg couldn't join the normalised clips.");
    }

    const blob = await readOutput(
      ffmpeg,
      outputName,
      "video/mp4",
      "The merged video came out empty."
    );

    onProgress?.("Done", 100);

    return {
      blob,
      filename: "merged.mp4",
      originalSize: files.reduce((sum, f) => sum + f.size, 0),
      fileCount: files.length,
      notice: paddedSilence
        ? "One or more clips had no audio track, so silence was inserted to keep the timeline aligned."
        : null,
    };
  }, onProgress);
}

/* ─── Extract frames ───────────────────────────────────────────────────── */

export interface FramesResult {
  blob: Blob;
  filename: string;
  frameCount: number;
}

export const MAX_FRAMES = 300;

/**
 * Pull stills out of a video and bundle them as a ZIP.
 *
 * Capped at MAX_FRAMES because the cost here is not the decode but the
 * bundling — 3000 PNGs is several gigabytes of ArrayBuffer held in the tab at
 * once, which kills it rather than producing a download.
 */
export async function extractFrames(
  file: File,
  fps: number,
  format: "png" | "jpg",
  onProgress?: ProgressFn
): Promise<FramesResult> {
  const ext = sourceExtension(file);
  const mime = format === "png" ? "image/png" : "image/jpeg";

  return withFFmpeg(async (ffmpeg, track) => {
    const inputName = track(`input.${ext}`);

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    onProgress?.("Extracting frames…", 30);

    const handleProgress = ({ progress }: { progress: number }) => {
      const clamped = Math.max(0, Math.min(1, progress));
      onProgress?.("Extracting frames…", 30 + Math.round(clamped * 40));
    };
    ffmpeg.on("progress", handleProgress);

    try {
      const exit = await ffmpeg.exec([
        "-i", inputName,
        "-vf", `fps=${fps}`,
        "-frames:v", String(MAX_FRAMES),
        ...(format === "jpg" ? ["-q:v", "3"] : []),
        "-y", `frame_%04d.${format}`,
      ]);

      if (exit !== 0) {
        throw new Error(
          "FFmpeg couldn't read this video. It may be corrupted, or use a codec this build can't decode."
        );
      }
    } finally {
      ffmpeg.off("progress", handleProgress);
    }

    onProgress?.("Collecting frames…", 72);

    const nodes = await ffmpeg.listDir("/");
    const frameNames = nodes
      .filter((n) => !n.isDir && n.name.startsWith("frame_") && n.name.endsWith(`.${format}`))
      .map((n) => n.name)
      .sort();

    if (frameNames.length === 0) {
      throw new Error(
        "No frames came out. The video may be shorter than one frame at the interval you picked."
      );
    }

    const entries: ZipEntry[] = [];
    try {
      for (const name of frameNames) {
        entries.push({
          filename: name,
          blob: await readOutput(ffmpeg, name, mime, "A frame came out empty."),
        });
      }
    } finally {
      for (const name of frameNames) {
        await ffmpeg.deleteFile(name).catch(() => {});
      }
    }

    onProgress?.("Bundling…", 82);

    const blob = await createZip(entries, (step, pct) =>
      onProgress?.(step, 82 + Math.round(pct * 0.17))
    );

    onProgress?.("Done", 100);

    return {
      blob,
      filename: file.name.replace(/\.[^.]+$/, "") + "_frames.zip",
      frameCount: frameNames.length,
    };
  }, onProgress);
}

/* ─── Shared ───────────────────────────────────────────────────────────── */

/** Rough GIF size estimate, for warning before a 60MB surprise. */
export function estimateGifBytes(
  seconds: number,
  fps: number,
  width: number,
  aspectRatio: number
): number {
  const height = width / aspectRatio;
  // GIF frames land around 0.12 bytes per pixel after LZW on typical footage.
  // Wildly approximate, which is why the UI presents it as "roughly".
  return Math.round(seconds * fps * width * height * 0.12);
}
