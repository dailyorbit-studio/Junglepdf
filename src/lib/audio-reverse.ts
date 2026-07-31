/**
 * Reverse Audio — Web Audio decode, flip, WAV encode
 *
 * Web Audio rather than FFmpeg's `areverse` filter for one reason: areverse
 * buffers the entire stream in the WASM heap anyway, so it buys no memory
 * saving, and going through decodeAudioData keeps this tool on the same
 * 32MB-free path as the cutter and merger.
 *
 * It inherits the same caveat as those two: decodeAudioData resamples to the
 * AudioContext's rate, so a 44.1kHz source comes back at the device rate
 * (usually 48kHz). The UI reports the rate that actually came out.
 */

import type { ProgressFn } from "./ffmpeg";
import { decodeAudioFile } from "./audio-cutter";
import { encodeWAVSafely, estimateWavBytes, assertWithinWavLimit } from "./wav";

export interface ReverseResult {
  blob: Blob;
  filename: string;
  duration: number;
  sampleRate: number;
}

export async function reverseAudio(
  file: File,
  onProgress?: ProgressFn
): Promise<ReverseResult> {
  const { buffer } = await decodeAudioFile(file, onProgress);

  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;

  assertWithinWavLimit(estimateWavBytes(buffer.duration, sampleRate, numChannels));

  onProgress?.("Reversing samples…", 65);

  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    // getChannelData hands back a live view into the AudioBuffer. Copying
    // first means the reverse below can't corrupt the source buffer, which
    // matters because a caller may decode once and reverse twice.
    const source = buffer.getChannelData(ch);
    const flipped = new Float32Array(source.length);
    for (let i = 0, j = source.length - 1; i < source.length; i++, j--) {
      flipped[i] = source[j];
    }
    channels.push(flipped);
  }

  onProgress?.("Encoding WAV…", 85);

  const blob = encodeWAVSafely(channels, sampleRate);

  onProgress?.("Done", 100);

  return {
    blob,
    filename: file.name.replace(/\.[^.]+$/, "") + "_reversed.wav",
    duration: buffer.duration,
    sampleRate,
  };
}
