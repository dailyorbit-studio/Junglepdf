/**
 * Merge Audio — Web Audio decode, concatenate, WAV encode
 *
 * Web Audio rather than FFmpeg because concatenation needs every input at a
 * common sample rate and channel count, and `decodeAudioData` already
 * resamples everything to the AudioContext's rate on the way in. Getting
 * FFmpeg to do the same would mean a filter graph; here it is free.
 *
 * The consequence is the same one the audio cutter carries: the output is at
 * the device's rate (usually 48kHz), not the source's. The UI says so.
 */

import type { ProgressFn } from "./ffmpeg";
import { encodeWAV } from "./wav";

export interface MergeAudioResult {
  blob: Blob;
  filename: string;
  duration: number;
  sampleRate: number;
  fileCount: number;
}

/** WAV is uncompressed, so a long queue balloons fast. Same cap as the cutter. */
const MAX_OUTPUT_BYTES = 500 * 1024 * 1024;

export function formatEstimatedSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
}

export const MAX_OUTPUT_LABEL = formatEstimatedSize(MAX_OUTPUT_BYTES);

/** Silence inserted between tracks, in seconds. */
export type GapSeconds = 0 | 0.5 | 1 | 2;

export async function mergeAudio(
  files: File[],
  gap: GapSeconds,
  onProgress?: ProgressFn
): Promise<MergeAudioResult> {
  if (files.length < 2) {
    throw new Error("Add at least two audio files to merge.");
  }

  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextCtor) {
    throw new Error("Your browser doesn't support the Web Audio API.");
  }

  const audioCtx = new AudioContextCtor();
  const buffers: AudioBuffer[] = [];

  try {
    for (let i = 0; i < files.length; i++) {
      onProgress?.(
        `Decoding ${i + 1} of ${files.length}…`,
        5 + Math.round((i / files.length) * 55)
      );

      let buffer: AudioBuffer;
      try {
        buffer = await audioCtx.decodeAudioData(await files[i].arrayBuffer());
      } catch {
        // decodeAudioData rejects with a bare DOMException whose message is
        // just "Unable to decode audio data" — name the file instead.
        throw new Error(
          `"${files[i].name}" couldn't be decoded. The format may not be supported by your browser, or the file may be corrupted.`
        );
      }

      if (buffer.length === 0 || buffer.numberOfChannels === 0) {
        throw new Error(`"${files[i].name}" doesn't contain any audio data.`);
      }

      buffers.push(buffer);
    }
  } finally {
    await audioCtx.close();
  }

  // decodeAudioData already resampled everything to the context rate, so
  // these agree by construction. Channel counts do not — a mono file among
  // stereo ones has to be widened, not truncated.
  const sampleRate = buffers[0].sampleRate;
  const channels = Math.max(...buffers.map((b) => b.numberOfChannels));

  const gapSamples = Math.round(gap * sampleRate);
  const totalSamples =
    buffers.reduce((sum, b) => sum + b.length, 0) + gapSamples * (buffers.length - 1);

  const projected = 44 + totalSamples * channels * 2;
  if (projected > MAX_OUTPUT_BYTES) {
    throw new Error(
      `Those files would produce a ${formatEstimatedSize(projected)} WAV, over the ` +
        `${MAX_OUTPUT_LABEL} limit. Merge them in smaller batches.`
    );
  }

  onProgress?.("Joining tracks…", 65);

  const output: Float32Array[] = [];
  for (let ch = 0; ch < channels; ch++) {
    output.push(new Float32Array(totalSamples));
  }

  let offset = 0;
  for (const buffer of buffers) {
    for (let ch = 0; ch < channels; ch++) {
      // Mono into stereo: duplicate channel 0 rather than leaving the right
      // channel silent, which is what reading past numberOfChannels would do.
      const source = buffer.getChannelData(Math.min(ch, buffer.numberOfChannels - 1));
      output[ch].set(source, offset);
    }
    offset += buffer.length + gapSamples;
  }

  onProgress?.("Encoding WAV…", 85);

  let blob: Blob;
  try {
    blob = encodeWAV(output, sampleRate);
  } catch (err) {
    if (err instanceof RangeError) {
      throw new Error("Not enough memory to build the WAV file. Merge fewer files at a time.");
    }
    throw err;
  }


  onProgress?.("Done", 100);

  return {
    blob,
    filename: "merged.wav",
    duration: totalSamples / sampleRate,
    sampleRate,
    fileCount: files.length,
  };
}
