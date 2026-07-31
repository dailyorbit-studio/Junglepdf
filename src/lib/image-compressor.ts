/**
 * Image Compressor — Iterative Canvas Quality Loop
 *
 * Binary-searches the JPEG quality parameter for the highest quality whose
 * output still fits the user's target size. Stops early once the search
 * range collapses, and reports honestly when the target is unreachable.
 */

import {
  loadDrawableImage,
  createSurface,
  drawWithMatte,
  type Surface,
} from "./canvas-utils";

export interface CompressResult {
  blob: Blob;
  quality: number;
  iterations: number;
  originalSize: number;
  compressedSize: number;
  /** True when even the lowest quality could not reach the target size. */
  targetMissed: boolean;
}

const OUTPUT_FORMAT = "image/jpeg";

export async function compressImage(
  file: File,
  targetKB: number,
  onProgress?: (step: string, pct: number) => void
): Promise<CompressResult> {
  const targetBytes = targetKB * 1024;
  const toleranceBytes = 2 * 1024; // ±2KB
  const maxIterations = 12;

  onProgress?.("Reading file…", 5);

  const image = await loadDrawableImage(file);

  let surface: Surface;
  try {
    surface = createSurface(image.width, image.height);
    // JPEG has no alpha channel, so transparent source pixels get a white
    // matte here — otherwise they would encode as black.
    drawWithMatte(surface, image, image.width, image.height, OUTPUT_FORMAT);
  } finally {
    image.release();
  }

  onProgress?.("Analyzing image…", 15);

  const encode = (quality: number) => surface.toBlob(OUTPUT_FORMAT, quality);

  // If the floor is still too big, the target simply isn't reachable at this
  // resolution. Return the smallest possible result and say so.
  const smallest = await encode(0.01);
  if (smallest.size > targetBytes + toleranceBytes) {
    onProgress?.("Packing output…", 95);
    return {
      blob: smallest,
      quality: 0.01,
      iterations: 1,
      originalSize: file.size,
      compressedSize: smallest.size,
      targetMissed: true,
    };
  }

  // If full quality already fits, there's nothing to trade away.
  const largest = await encode(1.0);
  if (largest.size <= targetBytes + toleranceBytes) {
    onProgress?.("Packing output…", 95);
    return {
      blob: largest,
      quality: 1.0,
      iterations: 2,
      originalSize: file.size,
      compressedSize: largest.size,
      targetMissed: false,
    };
  }

  // Invariant: quality `lo` fits, quality `hi` does not. Track the best
  // fitting candidate seen so far rather than whatever the last probe was.
  let lo = 0.01;
  let hi = 1.0;
  let bestBlob = smallest;
  let bestQuality = 0.01;
  let iterations = 2;

  while (iterations < maxIterations && hi - lo > 0.005) {
    const mid = (lo + hi) / 2;
    const blob = await encode(mid);
    iterations++;

    const pct = 15 + Math.round((iterations / maxIterations) * 70);
    onProgress?.(`Adjusting quality (attempt ${iterations})…`, pct);

    if (blob.size <= targetBytes + toleranceBytes) {
      // Fits — keep it and try for better quality.
      bestBlob = blob;
      bestQuality = mid;
      lo = mid;

      if (targetBytes - blob.size <= toleranceBytes) break; // close enough
    } else {
      hi = mid;
    }
  }

  onProgress?.("Packing output…", 95);

  return {
    blob: bestBlob,
    quality: bestQuality,
    iterations,
    originalSize: file.size,
    compressedSize: bestBlob.size,
    targetMissed: false,
  };
}
