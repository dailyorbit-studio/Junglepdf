/**
 * Volume & Fade — Web Audio gain and linear ramps
 *
 * Applied sample by sample rather than through a GainNode and
 * OfflineAudioContext. Both work; doing the arithmetic directly means the
 * peak can be measured before and after in the same pass, which is what makes
 * the clipping warning possible.
 */

import type { ProgressFn } from "./ffmpeg";
import { encodeWAV } from "./wav";

export interface VolumeResult {
  blob: Blob;
  filename: string;
  duration: number;
  sampleRate: number;
  /** Loudest sample after gain, as a multiple of full scale. */
  peakAfter: number;
  /** True when the requested gain would have pushed samples past full scale. */
  clipped: boolean;
}

export interface VolumeOptions {
  /** Multiplier. 1 is unchanged, 2 is +6dB, 0.5 is −6dB. */
  gain: number;
  fadeInSeconds: number;
  fadeOutSeconds: number;
  /** Scale the result down so the loudest sample sits just under full scale. */
  normalize: boolean;
}

export function gainToDecibels(gain: number): number {
  if (gain <= 0) return -Infinity;
  return 20 * Math.log10(gain);
}

export function formatDecibels(gain: number): string {
  const db = gainToDecibels(gain);
  if (!Number.isFinite(db)) return "−∞ dB";
  return `${db >= 0 ? "+" : "−"}${Math.abs(db).toFixed(1)} dB`;
}

export interface DecodedAudio {
  buffer: AudioBuffer;
  duration: number;
  sampleRate: number;
  peak: number;
}

export async function decodeForVolume(
  file: File,
  onProgress?: ProgressFn
): Promise<DecodedAudio> {
  onProgress?.("Reading file…", 10);

  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextCtor) {
    throw new Error("Your browser doesn't support the Web Audio API.");
  }

  const audioCtx = new AudioContextCtor();

  let buffer: AudioBuffer;
  try {
    buffer = await audioCtx.decodeAudioData(await file.arrayBuffer());
  } catch {
    throw new Error(
      "This file couldn't be decoded. The format may not be supported by your browser, or the file may be corrupted. MP3 and WAV work everywhere."
    );
  } finally {
    await audioCtx.close();
  }

  if (buffer.length === 0 || buffer.numberOfChannels === 0) {
    throw new Error("This file doesn't contain any audio data.");
  }

  onProgress?.("Measuring level…", 60);

  let peak = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > peak) peak = abs;
    }
  }

  onProgress?.("Done", 100);

  return { buffer, duration: buffer.duration, sampleRate: buffer.sampleRate, peak };
}

/** Highest gain that leaves the loudest sample just under full scale. */
export function headroomGain(peak: number): number {
  if (peak <= 0) return 1;
  return 0.99 / peak;
}

export async function applyVolume(
  buffer: AudioBuffer,
  options: VolumeOptions,
  originalFilename: string,
  onProgress?: ProgressFn
): Promise<VolumeResult> {
  onProgress?.("Applying gain…", 25);

  const { sampleRate, numberOfChannels: channels, length } = buffer;

  const fadeInSamples = Math.min(length, Math.round(options.fadeInSeconds * sampleRate));
  const fadeOutSamples = Math.min(length, Math.round(options.fadeOutSeconds * sampleRate));

  if (fadeInSamples + fadeOutSamples > length) {
    throw new Error(
      "The fades are longer than the track. Shorten them so they don't overlap."
    );
  }

  const output: Float32Array[] = [];
  let peakAfter = 0;
  let clipped = false;

  for (let ch = 0; ch < channels; ch++) {
    const source = buffer.getChannelData(ch);
    const target = new Float32Array(length);

    for (let i = 0; i < length; i++) {
      let value = source[i] * options.gain;

      // Linear ramps. Equal-power curves matter when crossfading two sources;
      // for a fade to and from silence, linear is what people expect to hear.
      if (fadeInSamples > 0 && i < fadeInSamples) {
        value *= i / fadeInSamples;
      }
      if (fadeOutSamples > 0 && i >= length - fadeOutSamples) {
        value *= (length - i) / fadeOutSamples;
      }

      const abs = Math.abs(value);
      if (abs > peakAfter) peakAfter = abs;
      if (abs > 1) clipped = true;

      target[i] = value;
    }

    output.push(target);
    onProgress?.("Applying gain…", 25 + Math.round(((ch + 1) / channels) * 40));
  }

  // Normalising is a second pass on purpose: the scale factor is not known
  // until the whole signal has been through the gain and the fades.
  if (options.normalize && peakAfter > 0) {
    const scale = 0.99 / peakAfter;
    for (const channel of output) {
      for (let i = 0; i < channel.length; i++) channel[i] *= scale;
    }
    peakAfter = 0.99;
    clipped = false;
  } else {
    // Hard-clip rather than letting the WAV encoder wrap the value around,
    // which turns a loud passage into white noise.
    for (const channel of output) {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = Math.max(-1, Math.min(1, channel[i]));
      }
    }
    if (peakAfter > 1) peakAfter = 1;
  }

  onProgress?.("Encoding WAV…", 80);

  let blob: Blob;
  try {
    blob = encodeWAV(output, sampleRate);
  } catch (err) {
    if (err instanceof RangeError) {
      throw new Error("Not enough memory to build the WAV file. Try a shorter track.");
    }
    throw err;
  }

  onProgress?.("Done", 100);

  return {
    blob,
    filename: originalFilename.replace(/\.[^.]+$/, "") + "_adjusted.wav",
    duration: length / sampleRate,
    sampleRate,
    peakAfter,
    clipped,
  };
}
