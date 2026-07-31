/**
 * Canvas helpers with fallbacks.
 *
 * OffscreenCanvas + convertToBlob only landed in Safari 16.4, and
 * createImageBitmap rejects some formats in older WebKit. Both image tools
 * go through here so they degrade to <canvas>/<img> instead of throwing.
 */

export interface DrawableImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  /** Frees the bitmap or object URL backing this image. Always call it. */
  release: () => void;
}

const DECODE_ERROR =
  "This image could not be decoded. It may be corrupted, or in a format your browser doesn't support.";

/**
 * Decode a file into something drawable, preferring createImageBitmap and
 * falling back to an <img> element.
 */
export async function loadDrawableImage(file: File): Promise<DrawableImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      // Fall through — older WebKit rejects WebP/AVIF here but can still
      // render them through an <img> tag.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(DECODE_ERROR));
      el.src = url;
    });

    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      throw new Error(DECODE_ERROR);
    }

    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

export interface Surface {
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  toBlob(type: string, quality?: number): Promise<Blob>;
}

/** Formats that cannot store an alpha channel — these need a matte. */
const OPAQUE_FORMATS = new Set(["image/jpeg", "image/jpg"]);

export function formatSupportsAlpha(mimeType: string): boolean {
  return !OPAQUE_FORMATS.has(mimeType);
}

/**
 * Allocate a 2D drawing surface, preferring OffscreenCanvas.
 *
 * Browsers cap canvas area (Safari on iOS is the tightest, around 16.7M
 * pixels), and an over-cap canvas fails silently by producing a blank
 * image rather than throwing — so check the dimensions up front.
 */
export function createSurface(width: number, height: number): Surface {
  const MAX_DIMENSION = 16384;
  const MAX_AREA = 16_777_216; // ~4096×4096, the iOS Safari ceiling

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    throw new Error(
      `${width}×${height} exceeds the ${MAX_DIMENSION}px canvas limit. Try smaller dimensions.`
    );
  }
  if (width * height > MAX_AREA) {
    throw new Error(
      `${width}×${height} is too large for your browser to render (${(
        (width * height) /
        1_000_000
      ).toFixed(1)} megapixels). Try smaller dimensions.`
    );
  }

  if (typeof OffscreenCanvas === "function") {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      return {
        ctx,
        toBlob: (type, quality) => canvas.convertToBlob({ type, quality }),
      };
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Your browser could not provide a canvas to draw on.");
  }

  return {
    ctx,
    toBlob: (type, quality) =>
      new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("The browser failed to encode the image.")),
          type,
          quality
        );
      }),
  };
}

/**
 * Draw an image onto a surface, laying down a white matte first when the
 * target format has no alpha channel. Without this, transparent PNG pixels
 * encode as black in JPEG output.
 */
export function drawWithMatte(
  surface: Surface,
  image: DrawableImage,
  targetWidth: number,
  targetHeight: number,
  outputFormat: string
): void {
  if (!formatSupportsAlpha(outputFormat)) {
    surface.ctx.fillStyle = "#FFFFFF";
    surface.ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  surface.ctx.imageSmoothingEnabled = true;
  surface.ctx.imageSmoothingQuality = "high";
  surface.ctx.drawImage(image.source, 0, 0, targetWidth, targetHeight);
}

/**
 * Confirm the encoder actually honoured the requested format. Browsers that
 * can't encode a type (Safari < 14 with WebP) silently return PNG instead,
 * which would otherwise ship a mislabelled file to the user.
 */
export function assertEncodedAs(blob: Blob, requested: string): void {
  if (blob.type && blob.type !== requested) {
    const label = requested.replace("image/", "").toUpperCase();
    throw new Error(
      `Your browser can't encode ${label}. Pick a different output format.`
    );
  }
}
