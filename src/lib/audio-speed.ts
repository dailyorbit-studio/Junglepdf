/**
 * Audio Speed — FFmpeg tempo and resampling
 *
 * Two genuinely different operations share this page, because "speed up" is
 * ambiguous and users mean both:
 *
 *   - Tempo only (`atempo`) — the track plays faster but voices keep their
 *     pitch. This is what you want for a podcast at 1.5×.
 *   - Tape speed (`asetrate`) — the whole waveform is replayed at a different
 *     rate, so pitch rises with tempo. This is the chipmunk / nightcore
 *     effect, and the only one that matches how a record player behaves.
 *
 * FFmpeg rather than Web Audio because `playbackRate` on an OfflineAudioContext
 * gives you the second behaviour only, and there is no pitch-preserving
 * time-stretch anywhere in the Web Audio API.
 */

import { runFFmpegJob, type ProgressFn } from "./ffmpeg";

export const MIN_SPEED = 0.25;
export const MAX_SPEED = 4;

export type SpeedMode = "tempo" | "tape";

export const SPEED_PRESETS = [0.5, 0.75, 1.25, 1.5, 2] as const;

/** Containers FFmpeg can mux back out; anything else falls back to MP3. */
const PASSTHROUGH_FORMATS: Record<string, { mime: string; codec: string[] }> = {
  mp3: { mime: "audio/mpeg", codec: ["-c:a", "libmp3lame", "-b:a", "192k"] },
  wav: { mime: "audio/wav", codec: ["-c:a", "pcm_s16le"] },
  ogg: { mime: "audio/ogg", codec: ["-c:a", "libvorbis", "-q:a", "5"] },
  m4a: { mime: "audio/mp4", codec: ["-c:a", "aac", "-b:a", "192k"] },
  flac: { mime: "audio/flac", codec: ["-c:a", "flac"] },
};

export interface SpeedResult {
  blob: Blob;
  filename: string;
  originalSize: number;
  /** Estimated output duration, for the result banner. */
  speed: number;
  mode: SpeedMode;
}

/**
 * Build an `atempo` chain for an arbitrary factor.
 *
 * A single atempo only accepts 0.5–2.0. Outside that range FFmpeg errors
 * rather than clamping, so a 4× request has to become two chained 2× stages.
 */
export function atempoChain(factor: number): string {
  const stages: string[] = [];
  let remaining = factor;

  while (remaining > 2) {
    stages.push("atempo=2.0");
    remaining /= 2;
  }
  while (remaining < 0.5) {
    stages.push("atempo=0.5");
    remaining *= 2;
  }
  stages.push(`atempo=${remaining.toFixed(6)}`);

  return stages.join(",");
}

export async function changeAudioSpeed(
  file: File,
  speed: number,
  mode: SpeedMode,
  onProgress?: ProgressFn
): Promise<SpeedResult> {
  if (!Number.isFinite(speed) || speed < MIN_SPEED || speed > MAX_SPEED) {
    throw new Error(`Speed must be between ${MIN_SPEED}× and ${MAX_SPEED}×.`);
  }
  if (speed === 1) {
    throw new Error("That is the original speed — pick a different value.");
  }

  const ext = file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase() ?? "mp3";
  const spec = PASSTHROUGH_FORMATS[ext] ?? PASSTHROUGH_FORMATS.mp3;
  const outExt = PASSTHROUGH_FORMATS[ext] ? ext : "mp3";

  // Tape mode normalises to 44.1kHz first so the asetrate target is a known
  // number. Reading the source rate would mean a separate probe pass for a
  // value that the resample immediately discards anyway.
  const filter =
    mode === "tempo"
      ? atempoChain(speed)
      : `aresample=44100,asetrate=${Math.round(44100 * speed)},aresample=44100`;

  const blob = await runFFmpegJob(
    {
      file,
      inputName: `input.${ext}`,
      outputName: `output.${outExt}`,
      args: ["-filter:a", filter, "-vn", ...spec.codec],
      outputMime: spec.mime,
      label: `Retiming to ${speed}×…`,
      band: [30, 92],
      failureMessage:
        "This file's speed couldn't be changed. It may be damaged, or saved in a format these tools can't read.",
    },
    onProgress
  );

  onProgress?.("Done", 100);

  const suffix = String(speed).replace(".", "-");

  return {
    blob,
    filename: `${file.name.replace(/\.[^.]+$/, "")}_${suffix}x.${outExt}`,
    originalSize: file.size,
    speed,
    mode,
  };
}
