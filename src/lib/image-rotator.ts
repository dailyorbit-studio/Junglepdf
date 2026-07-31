/**
 * Rotate & Flip — Canvas transform
 *
 * Rotation is restricted to multiples of 90° on purpose. Arbitrary angles
 * need a larger canvas plus a background fill for the exposed corners, which
 * turns a "rotate my photo" tool into a compositing tool. That is a different
 * product decision, not a missing feature.
 */

import {
  loadDrawableImage,
  createSurface,
  assertEncodedAs,
  formatSupportsAlpha,
} from "./canvas-utils";
import type { OutputFormat } from "./image-converter";
import { FORMAT_EXTENSIONS, formatUsesQuality } from "./image-converter";

export type Rotation = 0 | 90 | 180 | 270;

export interface TransformOptions {
  rotation: Rotation;
  flipHorizontal: boolean;
  flipVertical: boolean;
  format: OutputFormat;
  quality: number;
}

export interface TransformResult {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
}

/** Output dimensions after the transform — swapped for quarter turns. */
export function transformedSize(
  width: number,
  height: number,
  rotation: Rotation
): { width: number; height: number } {
  return rotation === 90 || rotation === 270
    ? { width: height, height: width }
    : { width, height };
}

export async function transformImage(
  file: File,
  options: TransformOptions,
  onProgress?: (step: string, pct: number) => void
): Promise<TransformResult> {
  onProgress?.("Reading image…", 10);

  const image = await loadDrawableImage(file);

  try {
    const { rotation, flipHorizontal, flipVertical } = options;
    const out = transformedSize(image.width, image.height, rotation);

    onProgress?.("Transforming…", 45);

    const surface = createSurface(out.width, out.height);

    if (!formatSupportsAlpha(options.format)) {
      surface.ctx.fillStyle = "#FFFFFF";
      surface.ctx.fillRect(0, 0, out.width, out.height);
    }

    // Move the origin to the centre of the *output*, apply the transforms,
    // then draw the source centred on that origin. Doing it in this order is
    // what makes rotation and flip compose correctly regardless of which the
    // user picked first.
    surface.ctx.save();
    surface.ctx.translate(out.width / 2, out.height / 2);
    surface.ctx.rotate((rotation * Math.PI) / 180);
    surface.ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
    surface.ctx.imageSmoothingEnabled = true;
    surface.ctx.imageSmoothingQuality = "high";
    surface.ctx.drawImage(
      image.source,
      -image.width / 2,
      -image.height / 2,
      image.width,
      image.height
    );
    surface.ctx.restore();

    onProgress?.("Encoding…", 75);

    const blob = await surface.toBlob(
      options.format,
      formatUsesQuality(options.format) ? options.quality : undefined
    );
    assertEncodedAs(blob, options.format);

    onProgress?.("Done", 100);

    const baseName = file.name.replace(/\.[^.]+$/, "");

    return {
      blob,
      filename: `${baseName}_rotated.${FORMAT_EXTENSIONS[options.format]}`,
      width: out.width,
      height: out.height,
    };
  } finally {
    image.release();
  }
}
