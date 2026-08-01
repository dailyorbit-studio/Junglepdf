/**
 * Audio Converter — FFmpeg WASM
 *
 * Re-encodes an audio stream into a different codec and container. Unlike the
 * cutter, which decodes through Web Audio and is therefore stuck at the
 * AudioContext's sample rate, this path hands the original bytes to FFmpeg —
 * so a 44.1kHz source stays 44.1kHz.
 */

import { runFFmpegJob, type ProgressFn } from "./ffmpeg";

export type AudioFormat = "mp3" | "wav" | "ogg" | "m4a" | "flac";

interface FormatSpec {
  label: string;
  extension: string;
  mime: string;
  /** Codec arguments. Lossless formats ignore the bitrate. */
  codec: string[];
  lossless: boolean;
  note: string;
}

export const AUDIO_FORMATS: Record<AudioFormat, FormatSpec> = {
  mp3: {
    label: "MP3",
    extension: "mp3",
    mime: "audio/mpeg",
    codec: ["-acodec", "libmp3lame"],
    lossless: false,
    note: "Plays on everything. The safe choice when you don't control the destination.",
  },
  wav: {
    label: "WAV",
    extension: "wav",
    mime: "audio/wav",
    codec: ["-acodec", "pcm_s16le"],
    lossless: true,
    note: "Uncompressed 16-bit PCM. Large files, but no encoder in the path at all.",
  },
  ogg: {
    label: "OGG",
    extension: "ogg",
    mime: "audio/ogg",
    codec: ["-acodec", "libvorbis"],
    lossless: false,
    note: "Better than MP3 at the same bitrate, and unencumbered. Weaker support on Apple devices.",
  },
  m4a: {
    label: "M4A",
    extension: "m4a",
    mime: "audio/mp4",
    codec: ["-acodec", "aac"],
    lossless: false,
    note: "AAC in an MP4 container. The default across the Apple ecosystem.",
  },
  flac: {
    label: "FLAC",
    extension: "flac",
    mime: "audio/flac",
    codec: ["-acodec", "flac"],
    lossless: true,
    note: "Lossless compression — roughly half the size of WAV with identical audio.",
  },
};

export const BITRATES = [96, 128, 192, 256, 320] as const;

/** Extensions that mean "already this format", including the usual aliases. */
const EXTENSION_TO_FORMAT: Record<string, AudioFormat> = {
  mp3: "mp3",
  wav: "wav",
  wave: "wav",
  ogg: "ogg",
  oga: "ogg",
  m4a: "m4a",
  mp4a: "m4a",
  flac: "flac",
};

/**
 * Which of our output formats is this file already in?
 *
 * The UI rules that option out. Re-encoding an MP3 to an MP3 is not a
 * conversion — it is a quality change, which is a different job — and offering
 * it invites someone to run a lossy round-trip for no reason at all.
 */
export function detectSourceFormat(file: File): AudioFormat | null {
  const ext = file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase();
  if (!ext) return null;
  return EXTENSION_TO_FORMAT[ext] ?? null;
}

export interface AudioConvertResult {
  blob: Blob;
  filename: string;
  originalSize: number;
}

export async function convertAudio(
  file: File,
  format: AudioFormat,
  bitrateKbps: number,
  onProgress?: ProgressFn
): Promise<AudioConvertResult> {
  const spec = AUDIO_FORMATS[format];

  // Keep the source extension on the virtual input: FFmpeg leans on it to
  // choose a demuxer when a container's magic bytes are ambiguous.
  const sourceExt = file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase() ?? "bin";

  const blob = await runFFmpegJob(
    {
      file,
      inputName: `input.${sourceExt}`,
      outputName: `output.${spec.extension}`,
      args: [
        "-vn", // Drop cover art, which would otherwise become a video stream
        ...spec.codec,
        ...(spec.lossless ? [] : ["-b:a", `${bitrateKbps}k`]),
      ],
      outputMime: spec.mime,
      label: `Encoding ${spec.label}…`,
      band: [30, 90],
      failureMessage:
        `This file couldn't be converted to ${spec.label}. It may be damaged, or it may not have any sound in it.`,
    },
    onProgress
  );

  onProgress?.("Done", 100);

  const baseName = file.name.replace(/\.[^.]+$/, "");

  return {
    blob,
    filename: `${baseName}.${spec.extension}`,
    originalSize: file.size,
  };
}
