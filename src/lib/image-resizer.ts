/**
 * Image Resizer — Canvas-based with DPI support for mm conversion
 *
 * Resizes images to exact pixel dimensions. When the user specifies
 * millimeters, we convert to pixels using their chosen DPI.
 */

import {
  loadDrawableImage,
  createSurface,
  drawWithMatte,
  assertEncodedAs,
} from "./canvas-utils";

export interface ResizeOptions {
  width: number;
  height: number;
  unit: "px" | "mm";
  dpi: number; // Used when unit is "mm"
  format: "image/jpeg" | "image/png" | "image/webp";
  quality: number; // 0.01–1.0
}

export interface ResizeResult {
  blob: Blob;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

function mmToPixels(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

export async function resizeImage(
  file: File,
  options: ResizeOptions,
  onProgress?: (step: string, pct: number) => void
): Promise<ResizeResult> {
  onProgress?.("Reading image…", 10);

  const image = await loadDrawableImage(file);
  const originalWidth = image.width;
  const originalHeight = image.height;

  try {
    // Calculate target pixel dimensions
    let targetW = options.width;
    let targetH = options.height;

    if (options.unit === "mm") {
      targetW = mmToPixels(options.width, options.dpi);
      targetH = mmToPixels(options.height, options.dpi);
    }

    // Clamp to reasonable bounds
    targetW = Math.max(1, Math.min(Math.round(targetW), 10000));
    targetH = Math.max(1, Math.min(Math.round(targetH), 10000));

    onProgress?.("Resizing…", 40);

    const surface = createSurface(targetW, targetH);
    // A white matte goes down first for JPEG, which has no alpha channel.
    drawWithMatte(surface, image, targetW, targetH, options.format);

    onProgress?.("Encoding output…", 75);

    const blob = await surface.toBlob(
      options.format,
      options.format === "image/png" ? undefined : options.quality
    );
    assertEncodedAs(blob, options.format);

    onProgress?.("Done", 100);

    return {
      blob,
      width: targetW,
      height: targetH,
      originalWidth,
      originalHeight,
    };
  } finally {
    image.release();
  }
}
