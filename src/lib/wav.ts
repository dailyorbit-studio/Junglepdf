/**
 * WAV encoding — shared by every Web Audio tool.
 *
 * The cutter, merger and volume tools each carried a byte-identical copy of
 * this encoder. A fourth tool (reverse) made that a fourth place to fix the
 * same bug, so it lives here now.
 *
 * 16-bit PCM only. That is what every one of these tools produced already, and
 * it is the format with no decoder ambiguity anywhere.
 */

/** WAV is uncompressed, so long selections balloon fast. Cap the output. */
export const MAX_OUTPUT_BYTES = 500 * 1024 * 1024;

export function formatEstimatedSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
}

export const MAX_OUTPUT_LABEL = formatEstimatedSize(MAX_OUTPUT_BYTES);

/** Bytes a 16-bit PCM WAV needs for the given selection. */
export function estimateWavBytes(
  seconds: number,
  sampleRate: number,
  channels: number
): number {
  return 44 + Math.ceil(seconds * sampleRate) * channels * 2;
}

/**
 * Throw if the projected WAV would exceed the cap, naming both numbers so the
 * user knows how much to trim rather than just that they failed.
 */
export function assertWithinWavLimit(byteLength: number): void {
  if (byteLength > MAX_OUTPUT_BYTES) {
    throw new Error(
      `That would produce a ${formatEstimatedSize(byteLength)} WAV file, ` +
        `over the ${MAX_OUTPUT_LABEL} limit. Use a shorter selection.`
    );
  }
}

/**
 * Encode Float32 channel data into a WAV blob.
 *
 * Callers pass one Float32Array per channel, all the same length.
 */
export function encodeWAV(channels: Float32Array[], sampleRate: number): Blob {
  const numChannels = channels.length;
  const length = channels[0].length;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = length * blockAlign;
  const bufferSize = 44 + dataSize;

  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, bufferSize - 8, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Interleave channel data and write as 16-bit PCM.
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

/**
 * Encode, translating the allocator's RangeError into something actionable.
 *
 * A 400MB ArrayBuffer request throws a bare "Invalid array length" that tells
 * the user nothing about what to do differently.
 */
export function encodeWAVSafely(channels: Float32Array[], sampleRate: number): Blob {
  try {
    return encodeWAV(channels, sampleRate);
  } catch (err) {
    if (err instanceof RangeError) {
      throw new Error(
        "Not enough memory to build the WAV file. Try a shorter selection."
      );
    }
    throw err;
  }
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
