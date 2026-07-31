/**
 * Rotate PDF — pdf-lib page rotation flag
 *
 * A PDF page carries a /Rotate entry that viewers apply at display time.
 * Setting it costs nothing and loses nothing: no content is re-rendered, no
 * image is re-encoded, and the file size barely moves. That is why this is a
 * separate tool from the image rotator, which genuinely redraws pixels.
 */

import { degrees } from "pdf-lib";
import { loadPDF, parsePageSelection } from "./pdf-utils";

export type PdfRotation = 90 | 180 | 270;

export interface RotateResult {
  blob: Blob;
  filename: string;
  pagesRotated: number;
  totalPages: number;
}

export async function rotatePDF(
  file: File,
  rotation: PdfRotation,
  /** Range string like "1-3, 7", or null to rotate every page. */
  pageSelection: string | null,
  onProgress?: (step: string, pct: number) => void
): Promise<RotateResult> {
  onProgress?.("Reading PDF…", 10);

  const arrayBuffer = await file.arrayBuffer();
  const doc = await loadPDF(arrayBuffer, file.name);
  const totalPages = doc.getPageCount();

  const targets =
    pageSelection && pageSelection.trim()
      ? parsePageSelection(pageSelection, totalPages)
      : Array.from({ length: totalPages }, (_, i) => i + 1);

  onProgress?.("Rotating pages…", 40);

  for (const pageNumber of targets) {
    const page = doc.getPage(pageNumber - 1);
    // Rotation is cumulative against whatever the page already carried — a
    // scanner that wrote 90 and a user asking for 90 should end at 180, not
    // fight each other.
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + rotation) % 360));
  }

  onProgress?.("Saving…", 80);

  const bytes = await doc.save();
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });

  onProgress?.("Done", 100);

  return {
    blob,
    filename: file.name.replace(/\.pdf$/i, "") + "_rotated.pdf",
    pagesRotated: targets.length,
    totalPages,
  };
}
