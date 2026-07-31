/**
 * Image Converter — Canvas re-encode at native resolution
 *
 * Format change only: dimensions are never touched. That is the whole point
 * of having this separate from the resizer, which people reach for and then
 * have to remember to type the original size back into.
 */

import {
  loadDrawableImage,
  createSurface,
  drawWithMatte,
  assertEncodedAs,
} from "./canvas-utils";

export type OutputFormat =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/avif";

export const FORMAT_LABELS: Record<OutputFormat, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "image/avif": "AVIF",
};

export const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** PNG is lossless, so its encoder ignores the quality argument entirely. */
export function formatUsesQuality(format: OutputFormat): boolean {
  return format !== "image/png";
}

export interface ConvertOptions {
  format: OutputFormat;
  /** 0.01–1.0. Ignored for PNG. */
  quality: number;
}

export interface ConvertResult {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  originalSize: number;
  /** True when the output is larger than the input — worth telling the user. */
  grew: boolean;
}

export async function convertImage(
  file: File,
  options: ConvertOptions,
  onProgress?: (step: string, pct: number) => void
): Promise<ConvertResult> {
  onProgress?.("Reading image…", 10);

  const image = await loadDrawableImage(file);

  try {
    const { width, height } = image;

    onProgress?.("Drawing…", 40);

    const surface = createSurface(width, height);
    // Converting a transparent PNG to JPG needs the matte, or every
    // transparent pixel encodes as black.
    drawWithMatte(surface, image, width, height, options.format);

    onProgress?.(`Encoding ${FORMAT_LABELS[options.format]}…`, 70);

    const blob = await surface.toBlob(
      options.format,
      formatUsesQuality(options.format) ? options.quality : undefined
    );
    assertEncodedAs(blob, options.format);

    onProgress?.("Done", 100);

    const baseName = file.name.replace(/\.[^.]+$/, "");

    return {
      blob,
      filename: `${baseName}.${FORMAT_EXTENSIONS[options.format]}`,
      width,
      height,
      originalSize: file.size,
      grew: blob.size > file.size,
    };
  } finally {
    image.release();
  }
}
