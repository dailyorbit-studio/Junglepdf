/**
 * Image Cropper — Canvas source-rect draw
 *
 * The crop rectangle arrives in *natural image pixels*, not the display
 * coordinates the user dragged in. Converting from one to the other is the
 * caller's job, because only the UI knows the on-screen scale factor.
 */

import {
  loadDrawableImage,
  createSurface,
  assertEncodedAs,
  formatSupportsAlpha,
} from "./canvas-utils";
import type { OutputFormat } from "./image-converter";
import { FORMAT_EXTENSIONS, FORMAT_LABELS, formatUsesQuality } from "./image-converter";

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AspectPreset {
  label: string;
  /** width / height, or null for a freeform drag. */
  ratio: number | null;
}

export const ASPECT_PRESETS: AspectPreset[] = [
  { label: "Free", ratio: null },
  { label: "1:1", ratio: 1 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "3:2", ratio: 3 / 2 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "9:16", ratio: 9 / 16 },
];

export interface CropOptions {
  rect: CropRect;
  format: OutputFormat;
  quality: number;
}

export interface CropResult {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
}

export async function cropImage(
  file: File,
  options: CropOptions,
  onProgress?: (step: string, pct: number) => void
): Promise<CropResult> {
  onProgress?.("Reading image…", 10);

  const image = await loadDrawableImage(file);

  try {
    // Clamp to the image. A drag that ends outside the element, or a stale
    // rect from a previous file, would otherwise ask the canvas to read
    // pixels that do not exist — which yields transparent padding rather
    // than an error, so it has to be caught here.
    const x = Math.max(0, Math.min(Math.round(options.rect.x), image.width - 1));
    const y = Math.max(0, Math.min(Math.round(options.rect.y), image.height - 1));
    const width = Math.max(1, Math.min(Math.round(options.rect.width), image.width - x));
    const height = Math.max(1, Math.min(Math.round(options.rect.height), image.height - y));

    if (width < 1 || height < 1) {
      throw new Error("The crop area is empty. Drag a larger selection.");
    }

    onProgress?.("Cropping…", 45);

    const surface = createSurface(width, height);

    if (!formatSupportsAlpha(options.format)) {
      surface.ctx.fillStyle = "#FFFFFF";
      surface.ctx.fillRect(0, 0, width, height);
    }
    surface.ctx.imageSmoothingEnabled = true;
    surface.ctx.imageSmoothingQuality = "high";
    // The 9-argument form: read this rect from the source, write it to the
    // whole destination. drawWithMatte only does the 5-argument form, so the
    // matte is inlined above instead.
    surface.ctx.drawImage(image.source, x, y, width, height, 0, 0, width, height);

    onProgress?.(`Encoding ${FORMAT_LABELS[options.format]}…`, 75);

    const blob = await surface.toBlob(
      options.format,
      formatUsesQuality(options.format) ? options.quality : undefined
    );
    assertEncodedAs(blob, options.format);

    onProgress?.("Done", 100);

    const baseName = file.name.replace(/\.[^.]+$/, "");

    return {
      blob,
      filename: `${baseName}_cropped.${FORMAT_EXTENSIONS[options.format]}`,
      width,
      height,
    };
  } finally {
    image.release();
  }
}
