/**
 * Audio Cutter — Web Audio API
 *
 * Decodes an audio file into an AudioBuffer, slices it between
 * user-specified start/end timestamps, and encodes the result as WAV.
 *
 * NOTE: decodeAudioData resamples to the AudioContext's rate (usually the
 * output device's, commonly 48kHz), so the decoded rate may differ from the
 * source file's. The cut itself is sample-exact against the decoded buffer;
 * `sampleRate` on the result reports what actually came out.
 */

export interface CutResult {
  blob: Blob;
  filename: string;
  duration: number;
  sampleRate: number;
}

export interface DecodeResult {
  buffer: AudioBuffer;
  duration: number;
  sampleRate: number;
}

import {
  encodeWAVSafely,
  estimateWavBytes,
  formatEstimatedSize,
  MAX_OUTPUT_BYTES,
  MAX_OUTPUT_LABEL,
} from "./wav";

export { formatEstimatedSize, MAX_OUTPUT_LABEL };

/**
 * How large the WAV for this selection would be, so the UI can warn before
 * the user commits to an allocation that might kill the tab.
 */
export function estimateOutputBytes(
  buffer: AudioBuffer,
  startTime: number,
  endTime: number
): number {
  return estimateWavBytes(
    Math.max(0, endTime - startTime),
    buffer.sampleRate,
    buffer.numberOfChannels
  );
}

/**
 * Decode an audio file and return the AudioBuffer + duration metadata.
 */
export async function decodeAudioFile(
  file: File,
  onProgress?: (step: string, pct: number) => void
): Promise<DecodeResult> {
  onProgress?.("Reading audio file…", 10);

  const arrayBuffer = await file.arrayBuffer();

  onProgress?.("Decoding audio data…", 30);

  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextCtor) {
    throw new Error("Your browser doesn't support the Web Audio API.");
  }

  const audioCtx = new AudioContextCtor();

  let buffer: AudioBuffer;
  try {
    buffer = await audioCtx.decodeAudioData(arrayBuffer);
  } catch {
    // decodeAudioData rejects with a bare DOMException whose message is just
    // "Unable to decode audio data" — useless to a user deciding what to do.
    throw new Error(
      "This file couldn't be decoded. The format may not be supported by your browser, or the file may be corrupted. MP3 and WAV work everywhere."
    );
  } finally {
    await audioCtx.close();
  }

  if (buffer.numberOfChannels === 0 || buffer.length === 0) {
    throw new Error("This file doesn't contain any audio data.");
  }

  onProgress?.("Audio decoded", 50);

  return {
    buffer,
    duration: buffer.duration,
    sampleRate: buffer.sampleRate,
  };
}

/**
 * Cut an AudioBuffer between startTime and endTime (in seconds)
 * and encode the result as WAV.
 */
export async function cutAudio(
  buffer: AudioBuffer,
  startTime: number,
  endTime: number,
  originalFilename: string,
  onProgress?: (step: string, pct: number) => void
): Promise<CutResult> {
  onProgress?.("Slicing audio…", 60);

  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;

  // Clamp to the buffer so a stale slider value can't read past the end.
  const startSample = Math.max(0, Math.min(Math.floor(startTime * sampleRate), buffer.length));
  const endSample = Math.max(0, Math.min(Math.floor(endTime * sampleRate), buffer.length));
  const length = endSample - startSample;

  if (length <= 0) throw new Error("End time must be after start time.");

  const projected = 44 + length * numChannels * 2;
  if (projected > MAX_OUTPUT_BYTES) {
    throw new Error(
      `That selection would produce a ${formatEstimatedSize(projected)} WAV file, ` +
        `over the ${MAX_OUTPUT_LABEL} limit. Trim a shorter range.`
    );
  }

  // Extract channel data
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    const fullData = buffer.getChannelData(ch);
    channels.push(fullData.slice(startSample, endSample));
  }

  onProgress?.("Encoding WAV…", 80);

  const wavBlob = encodeWAVSafely(channels, sampleRate);

  const baseName = originalFilename.replace(/\.[^.]+$/, "");

  onProgress?.("Done", 100);

  return {
    blob: wavBlob,
    filename: `${baseName}_trimmed.wav`,
    duration: length / sampleRate,
    sampleRate,
  };
}
