/**
 * Animated image ↔ video conversion — GIF to MP4, APNG to GIF.
 *
 * These could not go through the existing video tools, and the reason is worth
 * writing down. Both `VideoConverterTool` and `VideoToGifTool` call
 * `readMediaInfo()` before anything else, which reads duration out of a hidden
 * `<video>` element. A `<video>` cannot load a GIF and cannot load an APNG —
 * browsers treat both as images — so those tools reject the file before FFmpeg
 * is ever reached, even though FFmpeg handles both perfectly well.
 *
 * So this module skips the probe entirely. Neither conversion needs a duration:
 * there is no trim range to offer, the whole animation is converted, and
 * FFmpeg works out the frame count for itself.
 */

import { withFFmpeg, readOutput, fetchFile, type ProgressFn } from "./ffmpeg";

export interface AnimatedResult {
  blob: Blob;
  filename: string;
  originalSize: number;
}

/**
 * Animated GIF → MP4.
 *
 * Usually a dramatic saving: GIF stores every frame as its own palettised
 * image with no motion compensation, so a clip that H.264 encodes in a few
 * hundred kilobytes routinely costs several megabytes as a GIF.
 */
export async function gifToMp4(
  file: File,
  onProgress?: ProgressFn
): Promise<AnimatedResult> {
  return withFFmpeg(async (ffmpeg, track) => {
    const inputName = track("input.gif");
    const outputName = track("output.mp4");

    onProgress?.("Reading file…", 20);
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    onProgress?.("Encoding MP4…", 35);

    const handleProgress = ({ progress }: { progress: number }) => {
      const clamped = Math.max(0, Math.min(1, progress));
      onProgress?.("Encoding MP4…", 35 + Math.round(clamped * 55));
    };
    ffmpeg.on("progress", handleProgress);

    try {
      const exit = await ffmpeg.exec([
        "-i", inputName,
        // H.264 with yuv420p refuses any dimension that is not even, and GIFs
        // are frequently an odd number of pixels wide. Rounding both down to
        // the nearest even number costs at most one row or column and is the
        // difference between working and "width not divisible by 2".
        "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-pix_fmt", "yuv420p",
        // A GIF has no audio, and some players will not start a file whose
        // moov atom sits at the end.
        "-movflags", "+faststart",
        "-y", outputName,
      ]);

      if (exit !== 0) {
        throw new Error(
          "This GIF couldn't be converted to MP4. It may be damaged, or not actually be a GIF."
        );
      }
    } finally {
      ffmpeg.off("progress", handleProgress);
    }

    const blob = await readOutput(
      ffmpeg,
      outputName,
      "video/mp4",
      "The MP4 came out empty. The GIF may have no frames in it."
    );

    onProgress?.("Done", 100);

    return {
      blob,
      filename: file.name.replace(/\.[^.]+$/, "") + ".mp4",
      originalSize: file.size,
    };
  }, onProgress);
}

/**
 * Animated PNG → GIF.
 *
 * Two passes, for the same reason Video to GIF uses two: GIF holds 256 colours,
 * and letting the encoder pick them from a fixed web palette is what produces
 * the muddy banded look. A palette generated from the actual frames first is
 * the whole difference.
 *
 * Worth knowing going in: APNG supports full alpha and 24-bit colour, GIF
 * supports neither, so this conversion always loses something. It is the right
 * move only when the destination cannot read APNG.
 */
export async function apngToGif(
  file: File,
  onProgress?: ProgressFn
): Promise<AnimatedResult> {
  return withFFmpeg(async (ffmpeg, track) => {
    const inputName = track("input.apng");
    const paletteName = track("palette.png");
    const outputName = track("output.gif");

    onProgress?.("Reading file…", 15);
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    onProgress?.("Building colour palette…", 30);

    // The demuxer has to be named. Left to itself FFmpeg probes an .apng as a
    // single still PNG and produces a one-frame GIF.
    const paletteExit = await ffmpeg.exec([
      "-f", "apng",
      "-i", inputName,
      "-vf", "palettegen=stats_mode=diff",
      "-y", paletteName,
    ]);

    if (paletteExit !== 0) {
      throw new Error(
        "This file couldn't be read as an animated PNG. A normal, non-animated PNG should go through the image converter instead."
      );
    }

    onProgress?.("Encoding GIF…", 55);

    const handleProgress = ({ progress }: { progress: number }) => {
      const clamped = Math.max(0, Math.min(1, progress));
      onProgress?.("Encoding GIF…", 55 + Math.round(clamped * 35));
    };
    ffmpeg.on("progress", handleProgress);

    try {
      const exit = await ffmpeg.exec([
        "-f", "apng",
        "-i", inputName,
        "-i", paletteName,
        "-lavfi", "paletteuse=dither=bayer:bayer_scale=5",
        "-loop", "0",
        "-y", outputName,
      ]);

      if (exit !== 0) {
        throw new Error("The GIF couldn't be built from this animated PNG.");
      }
    } finally {
      ffmpeg.off("progress", handleProgress);
    }

    const blob = await readOutput(
      ffmpeg,
      outputName,
      "image/gif",
      "The GIF came out empty. The file may have only one frame."
    );

    onProgress?.("Done", 100);

    return {
      blob,
      filename: file.name.replace(/\.[^.]+$/, "") + ".gif",
      originalSize: file.size,
    };
  }, onProgress);
}
