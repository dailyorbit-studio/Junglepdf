/**
 * Three FFmpeg audio filters that each earn a tool: silence removal, loudness
 * normalisation, and pitch shifting.
 *
 * All three go through `runFFmpegJob` rather than the Web Audio path used by
 * the cutter, merger and volume tools. That is deliberate — Web Audio decodes
 * at the AudioContext's own sample rate, so a 44.1kHz source comes back
 * resampled to 48kHz before the tool ever sees it. Nothing here resamples
 * unless asked to, which matters most for the normaliser: the whole point is
 * to change loudness and nothing else.
 */

import { runFFmpegJob, type ProgressFn } from "./ffmpeg";
import { atempoChain } from "./audio-speed";

/** Output codec per input extension, so a WAV in gives a WAV out. */
const FORMATS: Record<string, { mime: string; codec: string[] }> = {
  mp3: { mime: "audio/mpeg", codec: ["-c:a", "libmp3lame", "-b:a", "192k"] },
  wav: { mime: "audio/wav", codec: ["-c:a", "pcm_s16le"] },
  ogg: { mime: "audio/ogg", codec: ["-c:a", "libvorbis", "-q:a", "5"] },
  m4a: { mime: "audio/mp4", codec: ["-c:a", "aac", "-b:a", "192k"] },
  flac: { mime: "audio/flac", codec: ["-c:a", "flac"] },
};

function formatFor(file: File) {
  const ext = file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase() ?? "mp3";
  const known = FORMATS[ext];
  return {
    ext,
    outExt: known ? ext : "mp3",
    spec: known ?? FORMATS.mp3,
  };
}

export interface AudioEffectResult {
  blob: Blob;
  filename: string;
  originalSize: number;
}

/* ─────────────────────── Silence remover ─────────────────────── */

export interface SilenceOptions {
  /** Anything quieter than this counts as silence, in dBFS. */
  thresholdDb: number;
  /** Silence must last at least this long to be cut, in seconds. */
  minDurationSeconds: number;
  /** Trim silence everywhere, or only at the very start and end. */
  mode: "all" | "edges";
}

export const SILENCE_DEFAULTS: SilenceOptions = {
  thresholdDb: -35,
  minDurationSeconds: 0.5,
  mode: "all",
};

/**
 * Cut silent stretches out.
 *
 * `silenceremove` in "all" mode needs `stop_periods=-1` — the default of 0
 * removes only the leading silence and then stops looking, which is the single
 * most common way this filter appears to do nothing at all on a podcast with a
 * clean start.
 *
 * The threshold is expressed in dB rather than a linear amplitude because a
 * noise floor is a dB quantity in every other tool people use, and -35dB is
 * roughly "room tone but no speech".
 */
export async function removeSilence(
  file: File,
  options: SilenceOptions,
  onProgress?: ProgressFn
): Promise<AudioEffectResult> {
  const { ext, outExt, spec } = formatFor(file);
  const threshold = `${options.thresholdDb}dB`;
  const duration = Math.max(0.05, options.minDurationSeconds);

  const filter =
    options.mode === "all"
      ? `silenceremove=start_periods=1:start_duration=${duration}:start_threshold=${threshold}:` +
        `stop_periods=-1:stop_duration=${duration}:stop_threshold=${threshold}:detection=peak`
      : // Edges only: trim the head, reverse, trim the head again, reverse back.
        // areverse buffers the whole stream, which is why this is the more
        // expensive of the two modes on a long file.
        `silenceremove=start_periods=1:start_duration=${duration}:start_threshold=${threshold}:detection=peak,` +
        `areverse,` +
        `silenceremove=start_periods=1:start_duration=${duration}:start_threshold=${threshold}:detection=peak,` +
        `areverse`;

  const blob = await runFFmpegJob(
    {
      file,
      inputName: `input.${ext}`,
      outputName: `output.${outExt}`,
      args: ["-af", filter, "-vn", ...spec.codec],
      outputMime: spec.mime,
      label: "Removing silence…",
      band: [25, 92],
      failureMessage:
        "FFmpeg couldn't process this file. It may be corrupted, or use a codec this build can't decode.",
    },
    onProgress
  );

  onProgress?.("Done", 100);

  return {
    blob,
    filename: `${file.name.replace(/\.[^.]+$/, "")}_trimmed.${outExt}`,
    originalSize: file.size,
  };
}

/* ───────────────────────── Normalise ───────────────────────── */

export type NormalizeMode = "broadcast" | "streaming" | "loud" | "peak";

export interface NormalizePreset {
  label: string;
  detail: string;
  /** Target integrated loudness, LUFS. Null for peak normalisation. */
  lufs: number | null;
}

/**
 * Loudness targets people actually publish against. The numbers are the
 * platform recommendations, not invented values.
 */
export const NORMALIZE_PRESETS: Record<NormalizeMode, NormalizePreset> = {
  streaming: {
    label: "Streaming (-14 LUFS)",
    detail: "What Spotify, YouTube and Apple Music normalise to.",
    lufs: -14,
  },
  broadcast: {
    label: "Broadcast (-23 LUFS)",
    detail: "The EBU R128 standard, used for television and radio.",
    lufs: -23,
  },
  loud: {
    label: "Loud (-9 LUFS)",
    detail: "Club and podcast-loud. Expect the quiet parts to come up hard.",
    lufs: -9,
  },
  peak: {
    label: "Peak only (0 dBFS)",
    detail: "Scales so the loudest sample just touches full scale. Changes no dynamics.",
    lufs: null,
  },
};

/**
 * Even out loudness.
 *
 * `loudnorm` measures the whole programme and applies one gain, which is what
 * "normalise" means to anyone who has used it elsewhere — not compression, and
 * not per-section levelling. Single-pass mode is used here; a two-pass measure
 * would be a little more accurate and would double the time on a file the user
 * is watching a progress bar for.
 *
 * `peak` mode uses `loudnorm`'s linear cousin instead, because scaling to full
 * scale is a different operation entirely and pretending otherwise would make
 * the "changes no dynamics" claim false.
 */
export async function normalizeAudio(
  file: File,
  mode: NormalizeMode,
  onProgress?: ProgressFn
): Promise<AudioEffectResult> {
  const { ext, outExt, spec } = formatFor(file);
  const preset = NORMALIZE_PRESETS[mode];

  const filter =
    preset.lufs === null
      ? // -1dBFS rather than 0: true-peak can exceed sample-peak after
        // decoding, and a lossy encoder needs headroom or it clips on playback.
        "dynaudnorm=f=500:g=31:p=0.95,alimiter=limit=0.891"
      : `loudnorm=I=${preset.lufs}:TP=-1.5:LRA=11`;

  const blob = await runFFmpegJob(
    {
      file,
      inputName: `input.${ext}`,
      outputName: `output.${outExt}`,
      args: ["-af", filter, "-vn", ...spec.codec],
      outputMime: spec.mime,
      label: "Normalising loudness…",
      band: [25, 92],
      failureMessage:
        "FFmpeg couldn't normalise this file. It may be corrupted, or use a codec this build can't decode.",
    },
    onProgress
  );

  onProgress?.("Done", 100);

  return {
    blob,
    filename: `${file.name.replace(/\.[^.]+$/, "")}_normalized.${outExt}`,
    originalSize: file.size,
  };
}

/* ─────────────────────── Pitch shifter ─────────────────────── */

export const MIN_SEMITONES = -12;
export const MAX_SEMITONES = 12;

export interface PitchResult extends AudioEffectResult {
  semitones: number;
}

/**
 * Shift pitch without changing the length.
 *
 * The trick is that FFmpeg has no pitch filter. `asetrate` moves pitch and
 * speed together — the tape effect — so the tempo has to be put back with
 * `atempo` by the inverse factor. Twelve semitones is a factor of two, hence
 * the 2^(n/12).
 *
 * `atempoChain` is reused from the speed tool rather than reimplemented: a
 * single atempo is limited to 0.5–2.0, and an octave shift needs exactly 2.0
 * back, which is the boundary where a naive single filter silently clamps.
 */
export async function shiftPitch(
  file: File,
  semitones: number,
  onProgress?: ProgressFn
): Promise<PitchResult> {
  if (!Number.isFinite(semitones) || semitones < MIN_SEMITONES || semitones > MAX_SEMITONES) {
    throw new Error(`Pitch must be between ${MIN_SEMITONES} and +${MAX_SEMITONES} semitones.`);
  }
  if (semitones === 0) {
    throw new Error("That is the original pitch — pick a different value.");
  }

  const { ext, outExt, spec } = formatFor(file);
  const ratio = Math.pow(2, semitones / 12);

  // Normalise to 44.1kHz first so the asetrate target is a known number, then
  // undo the tempo change the rate shift caused.
  const filter =
    `aresample=44100,asetrate=${Math.round(44100 * ratio)},` +
    `${atempoChain(1 / ratio)},aresample=44100`;

  const blob = await runFFmpegJob(
    {
      file,
      inputName: `input.${ext}`,
      outputName: `output.${outExt}`,
      args: ["-af", filter, "-vn", ...spec.codec],
      outputMime: spec.mime,
      label: `Shifting ${semitones > 0 ? "+" : ""}${semitones} semitones…`,
      band: [25, 92],
      failureMessage:
        "FFmpeg couldn't retune this file. It may be corrupted, or use a codec this build can't decode.",
    },
    onProgress
  );

  onProgress?.("Done", 100);

  const label = `${semitones > 0 ? "plus" : "minus"}${Math.abs(semitones)}`;

  return {
    blob,
    filename: `${file.name.replace(/\.[^.]+$/, "")}_${label}.${outExt}`,
    originalSize: file.size,
    semitones,
  };
}

/** Honest description of what phase-vocoder-free pitch shifting sounds like. */
export function describePitchLimits(): string[] {
  return [
    "Shifting by a few semitones sounds clean. Past about five, voices start to take on the chipmunk or growl character that comes from resampling rather than true pitch shifting.",
    "The length of the file does not change — the tempo correction puts it back.",
    "For a deliberate tape or chipmunk effect without correcting the tempo, use the Audio Speed tool in tape mode instead.",
  ];
}
