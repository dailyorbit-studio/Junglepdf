/**
 * Image Converter — Canvas re-encode at native resolution
 *
 * Format change only: dimensions are never touched. That is the whole point
 * of having this separate from the resizer, which people reach for and then
 * have to remember to type the original size back into.
 *
 * Three formats come from the browser's own encoder (PNG, JPEG, WebP). The
 * rest are written byte by byte in image-encoders.ts, because a canvas asked
 * for anything else quietly returns a PNG instead of refusing.
 *
 * AVIF is deliberately absent as an *output*. It cannot be produced here by any
 * path: no browser exposes an AVIF encoder through canvas, and the vendored
 * FFmpeg core is not built with libaom. It was previously offered and every
 * attempt failed at `assertEncodedAs`. AVIF *input* still works — decoding is
 * widely supported, it is only encoding that isn't.
 */

import {
  loadDrawableImage,
  createSurface,
  drawWithMatte,
  assertEncodedAs,
} from "./canvas-utils";
import {
  encodeBMP,
  encodeGIF,
  encodeTIFF,
  encodeICO,
  ICO_MAX_DIMENSION,
} from "./image-encoders";

export type OutputFormat =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif"
  | "image/bmp"
  | "image/tiff"
  | "image/x-icon";

export const FORMAT_LABELS: Record<OutputFormat, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "image/gif": "GIF",
  "image/bmp": "BMP",
  "image/tiff": "TIFF",
  "image/x-icon": "ICO",
};

export const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/x-icon": "ico",
};

/** One plain sentence per format, for someone who does not know which to pick. */
export const FORMAT_NOTES: Record<OutputFormat, string> = {
  "image/jpeg": "Best for photos. Small files, and no transparency.",
  "image/png": "Best for logos, screenshots and anything with transparency. Lossless.",
  "image/webp": "Smaller than JPG and PNG at the same quality. Works in every current browser.",
  "image/gif": "Limited to 256 colours. Use it for simple graphics, not photographs.",
  "image/bmp": "Uncompressed. Very large files — mainly for older Windows software.",
  "image/tiff": "Uncompressed and widely accepted by print and scanning software.",
  "image/x-icon": "Windows icon, for app and site favicons. Capped at 256×256.",
};

/** Every extension that maps onto one of the output formats above. */
const EXTENSION_TO_FORMAT: Record<string, OutputFormat> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  jfif: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
  tif: "image/tiff",
  tiff: "image/tiff",
  ico: "image/x-icon",
};

/**
 * Which format is this file already in?
 *
 * The UI uses it to rule that option out. Converting a JPG to a JPG is not a
 * conversion — it is a re-encode at a different quality, which is what the
 * compressor is for, and offering it here contradicts the line directly above
 * the buttons promising that only the format changes.
 *
 * Read from the extension rather than `file.type`, because a file dragged in
 * from some sources arrives with an empty type.
 */
export function detectSourceFormat(file: File): OutputFormat | null {
  const ext = file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase();
  if (ext && EXTENSION_TO_FORMAT[ext]) return EXTENSION_TO_FORMAT[ext];

  const fromMime = file.type.toLowerCase();
  if (fromMime === "image/jpg") return "image/jpeg";
  return (Object.keys(FORMAT_LABELS) as OutputFormat[]).find((f) => f === fromMime) ?? null;
}

/** Formats the browser encodes itself. The rest are written by hand. */
const CANVAS_NATIVE = new Set<OutputFormat>(["image/jpeg", "image/png", "image/webp"]);

/** Quality only means something to the two lossy encoders. */
export function formatUsesQuality(format: OutputFormat): boolean {
  return format === "image/jpeg" || format === "image/webp";
}

export interface ConvertOptions {
  format: OutputFormat;
  /** 0.01–1.0. Ignored by every format except JPG and WebP. */
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
  /** Set when the output had to differ from the request, e.g. an ICO downscale. */
  notice: string | null;
}

export async function convertImage(
  file: File,
  options: ConvertOptions,
  onProgress?: (step: string, pct: number) => void
): Promise<ConvertResult> {
  onProgress?.("Reading image…", 10);

  const image = await loadDrawableImage(file);

  try {
    let { width, height } = image;
    let notice: string | null = null;

    // ICO cannot describe a side longer than 256px — the directory entry gives
    // each dimension a single byte. Scaling down is the only way to honour the
    // request, so do it and say so rather than failing.
    if (options.format === "image/x-icon" && (width > ICO_MAX_DIMENSION || height > ICO_MAX_DIMENSION)) {
      const scale = ICO_MAX_DIMENSION / Math.max(width, height);
      const scaled = { w: Math.max(1, Math.round(width * scale)), h: Math.max(1, Math.round(height * scale)) };
      notice =
        `The icon was scaled to ${scaled.w}×${scaled.h}. The ICO format cannot store a side longer than ` +
        `${ICO_MAX_DIMENSION}px, so ${width}×${height} would not fit.`;
      width = scaled.w;
      height = scaled.h;
    }

    onProgress?.("Drawing…", 40);

    const surface = createSurface(width, height);
    // Converting a transparent PNG to JPG needs the matte, or every
    // transparent pixel encodes as black.
    drawWithMatte(surface, image, width, height, options.format);

    onProgress?.(`Encoding ${FORMAT_LABELS[options.format]}…`, 70);

    let blob: Blob;

    if (CANVAS_NATIVE.has(options.format)) {
      blob = await surface.toBlob(
        options.format,
        formatUsesQuality(options.format) ? options.quality : undefined
      );
      assertEncodedAs(blob, options.format);
    } else if (options.format === "image/x-icon") {
      // The payload is a PNG, so this one still goes through the canvas first.
      const png = await surface.toBlob("image/png");
      assertEncodedAs(png, "image/png");
      blob = encodeICO([
        { width, height, bytes: new Uint8Array(await png.arrayBuffer()) },
      ]);
    } else {
      const data = surface.ctx.getImageData(0, 0, width, height);
      blob =
        options.format === "image/gif"
          ? encodeGIF(data)
          : options.format === "image/bmp"
            ? encodeBMP(data)
            : encodeTIFF(data);
    }

    onProgress?.("Done", 100);

    const baseName = file.name.replace(/\.[^.]+$/, "");

    return {
      blob,
      filename: `${baseName}.${FORMAT_EXTENSIONS[options.format]}`,
      width,
      height,
      originalSize: file.size,
      grew: blob.size > file.size,
      notice,
    };
  } finally {
    image.release();
  }
}
