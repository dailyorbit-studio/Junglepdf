/**
 * PDF Merger — pdf-lib
 *
 * Combines multiple PDF files into a single document by copying all
 * pages in the user-specified order.
 */

import { PDFDocument } from "pdf-lib";
import { loadPDF, inspectFeatures, describeLostFeatures } from "./pdf-utils";

export interface MergeResult {
  blob: Blob;
  totalPages: number;
  fileCount: number;
  /** Set when any input had form fields or bookmarks that couldn't survive. */
  warning: string | null;
}

export async function mergePDFs(
  files: File[],
  onProgress?: (step: string, pct: number) => void
): Promise<MergeResult> {
  if (files.length < 2) {
    throw new Error("You need at least two PDF files to merge.");
  }

  onProgress?.("Creating output document…", 5);

  const merged = await PDFDocument.create();
  let totalPages = 0;
  let hasFormFields = false;
  let hasOutline = false;

  for (let i = 0; i < files.length; i++) {
    const pct = 5 + Math.round((i / files.length) * 80);
    onProgress?.(`Processing file ${i + 1} of ${files.length}…`, pct);

    const arrayBuffer = await files[i].arrayBuffer();
    const pdf = await loadPDF(arrayBuffer, files[i].name);

    const features = inspectFeatures(pdf);
    hasFormFields ||= features.hasFormFields;
    hasOutline ||= features.hasOutline;

    const pages = await merged.copyPages(pdf, pdf.getPageIndices());

    for (const page of pages) {
      merged.addPage(page);
      totalPages++;
    }
  }

  onProgress?.("Saving merged PDF…", 90);

  const pdfBytes = await merged.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });

  onProgress?.("Done", 100);

  return {
    blob,
    totalPages,
    fileCount: files.length,
    warning: describeLostFeatures({ hasFormFields, hasOutline }),
  };
}
