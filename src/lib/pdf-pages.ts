/**
 * Extract and Remove pages — pdf-lib
 *
 * Two operations, one file, because they are literally complements: both build
 * a new document from a subset of the old one, and they differ only in which
 * side of the selection they keep. Splitting them across two modules would
 * mean two copies of the copyPages loop and the feature-loss disclosure.
 *
 * They are separate *routes* rather than one page with a toggle because
 * "extract pages from PDF" and "delete pages from PDF" are things people
 * search for in those words, and a single page can only rank for one of them.
 */

import { PDFDocument } from "pdf-lib";
import type { ProgressFn } from "./ffmpeg";
import {
  loadPDF,
  inspectFeatures,
  describeLostFeatures,
  parsePageSelection,
} from "./pdf-utils";

export interface PageOpResult {
  blob: Blob;
  filename: string;
  /** Pages in the output. */
  pageCount: number;
  /** Pages in the input. */
  originalPageCount: number;
  /** Form-field / bookmark loss warning, or null. */
  notice: string | null;
}

/**
 * Build a new PDF containing only the selected pages, in ascending order.
 *
 * Order is deliberately not the order the user typed. "5, 1-2" produces pages
 * 1, 2, 5 — someone naming pages out of order is describing a *set*, and a
 * tool that silently reordered a document to match their typing would be a
 * surprise. Reordering is what the Organize tool is for.
 */
export async function extractPages(
  file: File,
  selection: string,
  onProgress?: ProgressFn
): Promise<PageOpResult> {
  return runPageOp(file, selection, "keep", onProgress);
}

/** Build a new PDF with the selected pages dropped and the rest left in order. */
export async function removePages(
  file: File,
  selection: string,
  onProgress?: ProgressFn
): Promise<PageOpResult> {
  return runPageOp(file, selection, "drop", onProgress);
}

async function runPageOp(
  file: File,
  selection: string,
  mode: "keep" | "drop",
  onProgress?: ProgressFn
): Promise<PageOpResult> {
  onProgress?.("Reading PDF…", 10);

  const source = await loadPDF(await file.arrayBuffer(), file.name);
  const totalPages = source.getPageCount();

  onProgress?.("Working out pages…", 25);

  const selected = parsePageSelection(selection, totalPages);
  const selectedSet = new Set(selected);

  // 1-indexed page numbers the output will contain.
  const keptPages =
    mode === "keep"
      ? selected
      : Array.from({ length: totalPages }, (_, i) => i + 1).filter(
          (p) => !selectedSet.has(p)
        );

  if (keptPages.length === 0) {
    throw new Error(
      mode === "keep"
        ? "That selection matched no pages."
        : "That would remove every page. A PDF needs at least one page."
    );
  }

  const notice = describeLostFeatures(inspectFeatures(source));

  onProgress?.("Copying pages…", 45);

  const output = await PDFDocument.create();
  const copied = await output.copyPages(
    source,
    keptPages.map((p) => p - 1)
  );
  for (const page of copied) output.addPage(page);

  onProgress?.("Saving…", 80);

  const bytes = await output.save();

  onProgress?.("Done", 100);

  const stem = file.name.replace(/\.pdf$/i, "");

  return {
    blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
    filename: `${stem}_${mode === "keep" ? "extracted" : "trimmed"}.pdf`,
    pageCount: keptPages.length,
    originalPageCount: totalPages,
    notice,
  };
}
