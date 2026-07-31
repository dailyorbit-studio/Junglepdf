/**
 * Canvas compositions: combining several images into one, cutting one image
 * into many, and masking to a circle.
 *
 * All three go through `canvas-utils` for decoding and surface allocation, so
 * they inherit the OffscreenCanvas fallback, the canvas-area ceiling, and the
 * white matte that stops a transparent PNG turning black in a JPEG.
 */

import {
  loadDrawableImage,
  createSurface,
  formatSupportsAlpha,
  type DrawableImage,
} from "./canvas-utils";
import { createZip, type ZipEntry } from "./zip";

export type ComposeFormat = "image/png" | "image/jpeg" | "image/webp";

export const COMPOSE_FORMAT_LABELS: Record<ComposeFormat, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
};

const EXTENSIONS: Record<ComposeFormat, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export interface ComposeResult {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
}

/** Load several files, guaranteeing every bitmap is released even on failure. */
async function withImages<T>(
  files: File[],
  work: (images: DrawableImage[]) => Promise<T>
): Promise<T> {
  const images: DrawableImage[] = [];
  try {
    for (const file of files) images.push(await loadDrawableImage(file));
    return await work(images);
  } finally {
    for (const image of images) image.release();
  }
}

/* ─────────────────────────── Collage ─────────────────────────── */

export type CollageLayout = "horizontal" | "vertical" | "grid";

export const COLLAGE_LAYOUT_LABELS: Record<CollageLayout, string> = {
  horizontal: "Side by side",
  vertical: "Stacked",
  grid: "Grid",
};

export interface CollageOptions {
  layout: CollageLayout;
  /** Gap between images and around the edge, in pixels. */
  gap: number;
  /** Fill behind the images and in the gaps. */
  background: string;
  format: ComposeFormat;
  quality: number;
  /** Columns for the grid layout. Ignored otherwise. */
  columns: number;
}

export const COLLAGE_DEFAULTS: CollageOptions = {
  layout: "horizontal",
  gap: 12,
  background: "#ffffff",
  format: "image/jpeg",
  quality: 0.9,
  columns: 2,
};

/**
 * Combine images into one sheet.
 *
 * Rows and columns are sized to the largest cell rather than scaling every
 * image to a common size: scaling to fit would distort photos of different
 * aspect ratios, and letterboxing each into an equal cell is what actually
 * looks right. Each image is centred in its cell at its natural size, scaled
 * down only if it exceeds the cell.
 */
export async function createCollage(
  files: File[],
  options: CollageOptions,
  onProgress?: (step: string, pct: number) => void
): Promise<ComposeResult> {
  if (files.length < 2) {
    throw new Error("Pick at least two images — one image is not a collage.");
  }

  onProgress?.("Decoding images…", 15);

  return withImages(files, async (images) => {
    const gap = Math.max(0, options.gap);
    const count = images.length;

    const columns =
      options.layout === "horizontal"
        ? count
        : options.layout === "vertical"
          ? 1
          : Math.max(1, Math.min(options.columns, count));
    const rows = Math.ceil(count / columns);

    // Every cell is the size of the largest image, so the grid stays regular.
    const cellWidth = Math.max(...images.map((i) => i.width));
    const cellHeight = Math.max(...images.map((i) => i.height));

    const width = Math.round(columns * cellWidth + gap * (columns + 1));
    const height = Math.round(rows * cellHeight + gap * (rows + 1));

    onProgress?.("Composing…", 45);

    const surface = createSurface(width, height);
    const { ctx } = surface;

    // Always paint the background, even for PNG: the gaps would otherwise be
    // transparent, which is rarely what someone making a collage wants.
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, width, height);

    images.forEach((image, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);

      const cellX = gap + column * (cellWidth + gap);
      const cellY = gap + row * (cellHeight + gap);

      const scale = Math.min(cellWidth / image.width, cellHeight / image.height, 1);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;

      ctx.drawImage(
        image.source,
        cellX + (cellWidth - drawWidth) / 2,
        cellY + (cellHeight - drawHeight) / 2,
        drawWidth,
        drawHeight
      );
    });

    onProgress?.("Encoding…", 80);

    const blob = await surface.toBlob(options.format, options.quality);

    onProgress?.("Done", 100);

    return {
      blob,
      filename: `collage.${EXTENSIONS[options.format]}`,
      width,
      height,
    };
  });
}

/* ───────────────────────── Split into grid ───────────────────────── */

export interface SplitOptions {
  columns: number;
  rows: number;
  format: ComposeFormat;
  quality: number;
}

export interface SplitResult {
  blob: Blob;
  filename: string;
  /** Number of tiles produced. */
  tileCount: number;
  tileWidth: number;
  tileHeight: number;
}

/**
 * Cut an image into a grid of tiles, bundled as a ZIP.
 *
 * Tiles are numbered row-major with zero padding — `tile-01.png` sorts
 * correctly in a file manager where `tile-1.png` would put 10 before 2.
 *
 * The last column and row absorb any remainder rather than being dropped, so
 * a 1000px image cut into 3 gives 334/333/333 and not 333 with 1px lost.
 */
export async function splitImage(
  file: File,
  options: SplitOptions,
  onProgress?: (step: string, pct: number) => void
): Promise<SplitResult> {
  const columns = Math.max(1, Math.floor(options.columns));
  const rows = Math.max(1, Math.floor(options.rows));

  if (columns === 1 && rows === 1) {
    throw new Error("A 1×1 grid is the original image — pick more columns or rows.");
  }
  if (columns * rows > 400) {
    throw new Error(
      `${columns}×${rows} is ${columns * rows} tiles. That is more files than a ZIP of images should hold — try a coarser grid.`
    );
  }

  onProgress?.("Decoding image…", 10);

  return withImages([file], async ([image]) => {
    const baseWidth = Math.floor(image.width / columns);
    const baseHeight = Math.floor(image.height / rows);

    if (baseWidth < 1 || baseHeight < 1) {
      throw new Error(
        `This image is ${image.width}×${image.height}, which is too small to cut into a ${columns}×${rows} grid.`
      );
    }

    const stem = file.name.replace(/\.[^.]+$/, "");
    const extension = EXTENSIONS[options.format];
    const pad = String(columns * rows).length;
    const entries: ZipEntry[] = [];

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const sourceX = column * baseWidth;
        const sourceY = row * baseHeight;
        // Last column/row take the remainder.
        const tileWidth = column === columns - 1 ? image.width - sourceX : baseWidth;
        const tileHeight = row === rows - 1 ? image.height - sourceY : baseHeight;

        const surface = createSurface(tileWidth, tileHeight);

        if (!formatSupportsAlpha(options.format)) {
          surface.ctx.fillStyle = "#ffffff";
          surface.ctx.fillRect(0, 0, tileWidth, tileHeight);
        }

        surface.ctx.drawImage(
          image.source,
          sourceX,
          sourceY,
          tileWidth,
          tileHeight,
          0,
          0,
          tileWidth,
          tileHeight
        );

        const index = row * columns + column + 1;
        entries.push({
          filename: `${stem}-${String(index).padStart(pad, "0")}.${extension}`,
          blob: await surface.toBlob(options.format, options.quality),
        });

        onProgress?.(
          "Cutting tiles…",
          15 + Math.round((index / (columns * rows)) * 65)
        );
      }
    }

    onProgress?.("Bundling…", 88);

    const blob = await createZip(entries);

    onProgress?.("Done", 100);

    return {
      blob,
      filename: `${stem}_tiles.zip`,
      tileCount: entries.length,
      tileWidth: baseWidth,
      tileHeight: baseHeight,
    };
  });
}

/* ───────────────────────── Circle crop ───────────────────────── */

export interface CircleCropOptions {
  /** Ring drawn around the circle, in pixels. Zero for none. */
  borderWidth: number;
  borderColor: string;
  /** Fill outside the circle. Ignored for PNG and WebP, which keep it clear. */
  background: string;
  /** PNG and WebP can be transparent outside the circle; JPEG cannot. */
  format: ComposeFormat;
  quality: number;
}

export const CIRCLE_CROP_DEFAULTS: CircleCropOptions = {
  borderWidth: 0,
  borderColor: "#ffffff",
  background: "#ffffff",
  format: "image/png",
  quality: 0.92,
};

/**
 * Mask an image to a circle.
 *
 * The output is square and sized to the shorter edge, centred — a circle from
 * a 4:3 photo has to crop something, and taking it from the middle is what
 * every avatar cropper does.
 *
 * JPEG cannot store transparency, so it gets the background colour outside the
 * circle instead. Without that, the corners would come out black, which is the
 * same trap `drawWithMatte` exists to prevent elsewhere.
 */
export async function circleCrop(
  file: File,
  options: CircleCropOptions,
  onProgress?: (step: string, pct: number) => void
): Promise<ComposeResult> {
  onProgress?.("Decoding image…", 15);

  return withImages([file], async ([image]) => {
    const size = Math.min(image.width, image.height);
    const surface = createSurface(size, size);
    const { ctx } = surface;

    onProgress?.("Masking…", 50);

    if (!formatSupportsAlpha(options.format)) {
      ctx.fillStyle = options.background;
      ctx.fillRect(0, 0, size, size);
    }

    const radius = size / 2;
    const border = Math.max(0, options.borderWidth);

    ctx.save();
    ctx.beginPath();
    // Inset by the border so the ring sits inside the canvas rather than
    // being half clipped away at the edge.
    ctx.arc(radius, radius, radius - border, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Centre crop: take the middle square of the source.
    ctx.drawImage(
      image.source,
      (image.width - size) / 2,
      (image.height - size) / 2,
      size,
      size,
      0,
      0,
      size,
      size
    );
    ctx.restore();

    if (border > 0) {
      ctx.beginPath();
      ctx.arc(radius, radius, radius - border / 2, 0, Math.PI * 2);
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = border;
      ctx.stroke();
    }

    onProgress?.("Encoding…", 85);

    const blob = await surface.toBlob(options.format, options.quality);

    onProgress?.("Done", 100);

    return {
      blob,
      filename: `${file.name.replace(/\.[^.]+$/, "")}_circle.${EXTENSIONS[options.format]}`,
      width: size,
      height: size,
    };
  });
}
