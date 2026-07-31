/**
 * Images to PDF — pdf-lib image embedding
 *
 * pdf-lib can embed JPEG and PNG directly, storing the original compressed
 * bytes rather than re-encoding them. Anything else (WebP, AVIF, BMP, GIF)
 * has to be transcoded through a canvas first, which is lossy for the lossy
 * formats — so the tool says which files needed it.
 */

import { PDFDocument, PageSizes } from "pdf-lib";
import { loadDrawableImage, createSurface } from "./canvas-utils";

export type PageSizeName = "fit" | "a4" | "letter" | "legal";

export type Orientation = "portrait" | "landscape";

export const PAGE_SIZE_LABELS: Record<PageSizeName, string> = {
  fit: "Match each image",
  a4: "A4",
  letter: "US Letter",
  legal: "US Legal",
};

const POINT_SIZES: Record<Exclude<PageSizeName, "fit">, [number, number]> = {
  a4: PageSizes.A4,
  letter: PageSizes.Letter,
  legal: PageSizes.Legal,
};

export interface ImagesToPdfOptions {
  pageSize: PageSizeName;
  orientation: Orientation;
  /** Points of white space between the image and the page edge. */
  margin: number;
}

export interface ImagesToPdfResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  /** Files that had to be re-encoded to JPEG because PDF can't hold them. */
  transcoded: string[];
}

const DIRECT_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);

/**
 * Get bytes pdf-lib can embed, transcoding through a canvas when needed.
 *
 * Returns null in `transcodedFrom` when the original bytes were usable as-is,
 * so the caller can report only the files that actually lost fidelity.
 */
async function toEmbeddable(
  file: File
): Promise<{ bytes: ArrayBuffer; kind: "jpg" | "png"; transcoded: boolean }> {
  const type = file.type.toLowerCase();

  if (DIRECT_TYPES.has(type)) {
    return {
      bytes: await file.arrayBuffer(),
      kind: type === "image/png" ? "png" : "jpg",
      transcoded: false,
    };
  }

  // Everything else goes through the canvas. JPEG at 92% rather than PNG:
  // these are photographs often enough that lossless would multiply the file
  // size for no visible gain.
  const image = await loadDrawableImage(file);
  try {
    const surface = createSurface(image.width, image.height);
    surface.ctx.fillStyle = "#FFFFFF";
    surface.ctx.fillRect(0, 0, image.width, image.height);
    surface.ctx.drawImage(image.source, 0, 0, image.width, image.height);
    const blob = await surface.toBlob("image/jpeg", 0.92);
    return { bytes: await blob.arrayBuffer(), kind: "jpg", transcoded: true };
  } finally {
    image.release();
  }
}

export async function imagesToPDF(
  files: File[],
  options: ImagesToPdfOptions,
  onProgress?: (step: string, pct: number) => void
): Promise<ImagesToPdfResult> {
  if (files.length === 0) {
    throw new Error("Add at least one image.");
  }

  onProgress?.("Creating document…", 5);

  const doc = await PDFDocument.create();
  const transcoded: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(
      `Adding image ${i + 1} of ${files.length}…`,
      5 + Math.round((i / files.length) * 80)
    );

    let embeddable: Awaited<ReturnType<typeof toEmbeddable>>;
    try {
      embeddable = await toEmbeddable(file);
    } catch {
      throw new Error(`"${file.name}" could not be decoded. It may be corrupted.`);
    }

    if (embeddable.transcoded) transcoded.push(file.name);

    let embedded;
    try {
      embedded =
        embeddable.kind === "png"
          ? await doc.embedPng(embeddable.bytes)
          : await doc.embedJpg(embeddable.bytes);
    } catch {
      // A JPEG variant pdf-lib rejects — CMYK and 12-bit are the usual
      // culprits. Name the file rather than failing the whole batch blindly.
      throw new Error(
        `"${file.name}" uses a JPEG variant that can't be embedded directly. ` +
          `Convert it to PNG first, then try again.`
      );
    }

    if (options.pageSize === "fit") {
      // One page exactly the size of its image — no margins, no letterboxing.
      const page = doc.addPage([embedded.width, embedded.height]);
      page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
      continue;
    }

    const [shortSide, longSide] = POINT_SIZES[options.pageSize];
    const pageWidth = options.orientation === "landscape" ? longSide : shortSide;
    const pageHeight = options.orientation === "landscape" ? shortSide : longSide;

    const page = doc.addPage([pageWidth, pageHeight]);

    const availableWidth = Math.max(1, pageWidth - options.margin * 2);
    const availableHeight = Math.max(1, pageHeight - options.margin * 2);

    // Fit inside, never crop and never upscale past the available box.
    const scale = Math.min(
      availableWidth / embedded.width,
      availableHeight / embedded.height
    );
    const drawWidth = embedded.width * scale;
    const drawHeight = embedded.height * scale;

    page.drawImage(embedded, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
  }

  onProgress?.("Saving PDF…", 90);

  const bytes = await doc.save();
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });

  onProgress?.("Done", 100);

  return {
    blob,
    filename: files.length === 1
      ? files[0].name.replace(/\.[^.]+$/, "") + ".pdf"
      : "images.pdf",
    pageCount: files.length,
    transcoded,
  };
}
