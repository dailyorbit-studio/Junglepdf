/**
 * Crop PDF — pdf-lib CropBox
 *
 * Cropping a PDF does not remove anything. Every page carries a MediaBox (the
 * sheet) and may carry a CropBox (the part a viewer should show); this tool
 * writes the CropBox and leaves the content stream untouched.
 *
 * The consequence is worth being honest about in the UI: the cropped-away
 * content is still in the file. Anyone can widen the CropBox again and read
 * it. Cropping is a layout operation, not redaction, and treating it as a way
 * to hide a signature or a header is how people leak things.
 */

import type { PDFPage } from "pdf-lib";
import type { ProgressFn } from "./ffmpeg";
import { loadPDF, parsePageSelection } from "./pdf-utils";

/** Fractions of each edge to trim, 0–0.45. */
export interface CropMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const MAX_MARGIN = 0.45;

export interface CropResult {
  blob: Blob;
  filename: string;
  pagesCropped: number;
  totalPages: number;
  /** Output size of the first cropped page, in PDF points. */
  newWidth: number;
  newHeight: number;
}

export function isValidMargins(m: CropMargins): boolean {
  const values = [m.top, m.right, m.bottom, m.left];
  if (values.some((v) => !Number.isFinite(v) || v < 0 || v > MAX_MARGIN)) return false;
  // Opposite edges must leave something behind.
  return m.top + m.bottom < 1 && m.left + m.right < 1;
}

export async function cropPDF(
  file: File,
  margins: CropMargins,
  pageSelection: string | null,
  onProgress?: ProgressFn
): Promise<CropResult> {
  if (!isValidMargins(margins)) {
    throw new Error(
      `Each margin must be between 0% and ${Math.round(MAX_MARGIN * 100)}%, and opposite edges can't overlap.`
    );
  }
  if (margins.top + margins.right + margins.bottom + margins.left === 0) {
    throw new Error("Set at least one margin above zero, or there is nothing to crop.");
  }

  onProgress?.("Reading PDF…", 15);

  const doc = await loadPDF(await file.arrayBuffer(), file.name);
  const pages = doc.getPages();
  const totalPages = pages.length;

  const targets = pageSelection
    ? new Set(parsePageSelection(pageSelection, totalPages))
    : null;

  onProgress?.("Cropping pages…", 45);

  let cropped = 0;
  let newWidth = 0;
  let newHeight = 0;

  for (let i = 0; i < pages.length; i++) {
    if (targets && !targets.has(i + 1)) continue;

    const page = pages[i];
    const box = effectiveBox(page);

    // Rotation is presentation-only: a page displayed sideways still has an
    // upright coordinate system underneath. So "top" as the user sees it maps
    // to a different edge of the box depending on /Rotate, and cropping
    // without accounting for that trims the wrong side of every scanned page.
    const rotation = ((page.getRotation().angle % 360) + 360) % 360;
    const m = rotateMargins(margins, rotation);

    const width = box.width * (1 - m.left - m.right);
    const height = box.height * (1 - m.top - m.bottom);
    const x = box.x + box.width * m.left;
    // PDF's origin is bottom-left, so the user's "top" margin is subtracted
    // from the far end and the "bottom" margin is what moves the origin.
    const y = box.y + box.height * m.bottom;

    page.setCropBox(x, y, width, height);

    if (cropped === 0) {
      newWidth = Math.round(width);
      newHeight = Math.round(height);
    }
    cropped++;
  }

  if (cropped === 0) {
    throw new Error("That selection matched no pages.");
  }

  onProgress?.("Saving…", 80);

  const bytes = await doc.save();

  onProgress?.("Done", 100);

  return {
    blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
    filename: file.name.replace(/\.pdf$/i, "") + "_cropped.pdf",
    pagesCropped: cropped,
    totalPages,
    newWidth,
    newHeight,
  };
}

/**
 * The box to crop relative to.
 *
 * A page that already has a CropBox has been cropped before, and margins
 * should apply to what the user can currently see rather than to the full
 * sheet hiding behind it.
 */
function effectiveBox(page: PDFPage): { x: number; y: number; width: number; height: number } {
  const crop = page.getCropBox();
  if (crop && crop.width > 0 && crop.height > 0) return crop;
  return page.getMediaBox();
}

/** Re-map user-facing edges onto unrotated page space. */
function rotateMargins(m: CropMargins, rotation: number): CropMargins {
  switch (rotation) {
    case 90:
      return { top: m.left, right: m.top, bottom: m.right, left: m.bottom };
    case 180:
      return { top: m.bottom, right: m.left, bottom: m.top, left: m.right };
    case 270:
      return { top: m.right, right: m.bottom, bottom: m.left, left: m.top };
    default:
      return m;
  }
}
