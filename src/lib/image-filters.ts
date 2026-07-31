/**
 * Photo Filters — the canvas filter pipeline
 *
 * `ctx.filter` takes the same syntax as the CSS `filter` property and runs in
 * the compositor, which is why a 24-megapixel image adjusts in milliseconds
 * where a per-pixel loop over the ImageData would take seconds and block the
 * main thread while it did.
 *
 * The preview and the export run the identical filter string against the
 * identical source, differing only in canvas size. That is what makes "what
 * you see is what you get" true here rather than approximately true.
 */

import {
  loadDrawableImage,
  createSurface,
  assertEncodedAs,
  formatSupportsAlpha,
  type DrawableImage,
} from "./canvas-utils";
import type { ProgressFn } from "./ffmpeg";

export interface FilterSettings {
  /** Percent, 0–200. 100 is unchanged. */
  brightness: number;
  contrast: number;
  saturate: number;
  /** Percent, 0–100. */
  grayscale: number;
  sepia: number;
  invert: number;
  /** Degrees, 0–360. */
  hueRotate: number;
  /** Pixels, 0–20. */
  blur: number;
}

export const DEFAULT_FILTERS: FilterSettings = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  hueRotate: 0,
  blur: 0,
};

export const FILTER_PRESETS: { name: string; settings: FilterSettings }[] = [
  { name: "Original", settings: DEFAULT_FILTERS },
  {
    name: "Mono",
    settings: { ...DEFAULT_FILTERS, grayscale: 100, contrast: 110 },
  },
  {
    name: "Vintage",
    settings: { ...DEFAULT_FILTERS, sepia: 45, saturate: 85, contrast: 95, brightness: 105 },
  },
  {
    name: "Punch",
    settings: { ...DEFAULT_FILTERS, saturate: 145, contrast: 115 },
  },
  {
    name: "Cool",
    settings: { ...DEFAULT_FILTERS, hueRotate: 190, saturate: 115 },
  },
  {
    name: "Faded",
    settings: { ...DEFAULT_FILTERS, contrast: 82, brightness: 108, saturate: 80 },
  },
];

/**
 * Build the CSS filter string.
 *
 * Order matters — filters compose left to right, so blur after a contrast
 * boost looks different from the reverse. This order matches what image
 * editors do: colour adjustments, then tone, then the optical effect last.
 */
export function toFilterString(s: FilterSettings): string {
  const parts: string[] = [];

  if (s.brightness !== 100) parts.push(`brightness(${s.brightness}%)`);
  if (s.contrast !== 100) parts.push(`contrast(${s.contrast}%)`);
  if (s.saturate !== 100) parts.push(`saturate(${s.saturate}%)`);
  if (s.hueRotate !== 0) parts.push(`hue-rotate(${s.hueRotate}deg)`);
  if (s.sepia !== 0) parts.push(`sepia(${s.sepia}%)`);
  if (s.grayscale !== 0) parts.push(`grayscale(${s.grayscale}%)`);
  if (s.invert !== 0) parts.push(`invert(${s.invert}%)`);
  if (s.blur !== 0) parts.push(`blur(${s.blur}px)`);

  return parts.length > 0 ? parts.join(" ") : "none";
}

export function isDefault(s: FilterSettings): boolean {
  return toFilterString(s) === "none";
}

export interface FilterResult {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  originalSize: number;
}

export async function applyFilters(
  file: File,
  settings: FilterSettings,
  outputFormat: string,
  quality: number,
  onProgress?: ProgressFn
): Promise<FilterResult> {
  if (isDefault(settings)) {
    throw new Error("No adjustments are set — move a slider or pick a preset first.");
  }

  onProgress?.("Reading image…", 20);

  const image = await loadDrawableImage(file);

  try {
    const { width, height } = image;

    onProgress?.("Applying adjustments…", 55);

    const surface = createSurface(width, height);
    const blob = await renderFiltered(surface, image, settings, outputFormat, quality, width, height);

    onProgress?.("Done", 100);

    const ext = outputFormat.split("/")[1].replace("jpeg", "jpg");

    return {
      blob,
      filename: file.name.replace(/\.[^.]+$/, "") + `_edited.${ext}`,
      width,
      height,
      originalSize: file.size,
    };
  } finally {
    image.release();
  }
}

async function renderFiltered(
  surface: ReturnType<typeof createSurface>,
  image: DrawableImage,
  settings: FilterSettings,
  outputFormat: string,
  quality: number,
  width: number,
  height: number
): Promise<Blob> {
  const ctx = surface.ctx;

  if (!formatSupportsAlpha(outputFormat)) {
    // Fill before the filter is set, or the matte gets filtered too — a
    // brightness of 50% would turn the white backing grey.
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.save();
  ctx.filter = toFilterString(settings);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image.source, 0, 0, width, height);
  ctx.restore();

  const blob = await surface.toBlob(outputFormat, quality);
  assertEncodedAs(blob, outputFormat);
  return blob;
}

/**
 * True when the browser can actually apply canvas filters.
 *
 * `ctx.filter` is unsupported in older WebKit, where assigning it is a silent
 * no-op — the export would come back visually identical to the input with no
 * error anywhere. Checking lets the UI say so instead.
 */
export function supportsCanvasFilters(): boolean {
  if (typeof document === "undefined") return true;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return false;
  ctx.filter = "grayscale(50%)";
  return ctx.filter === "grayscale(50%)";
}
