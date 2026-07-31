/**
 * PDF Splitter — pdf-lib
 *
 * Splits a PDF into separate documents based on a page range specification.
 * Supports formats like "1-3, 5, 7-10" or individual page extraction.
 */

import { PDFDocument } from "pdf-lib";
import {
  loadPDF,
  inspectFeatures,
  describeLostFeatures,
  parsePageRanges,
} from "./pdf-utils";

export interface SplitResult {
  parts: { blob: Blob; label: string; pageCount: number }[];
  totalSourcePages: number;
  warning: string | null;
}

// parsePageRanges moved to pdf-utils once four tools needed the same syntax.
export { parsePageRanges };

/**
 * Split a PDF based on page ranges.
 * Each range becomes a separate output document.
 */
export async function splitPDF(
  file: File,
  rangeString: string,
  onProgress?: (step: string, pct: number) => void
): Promise<SplitResult> {
  onProgress?.("Reading PDF…", 10);

  const arrayBuffer = await file.arrayBuffer();
  const source = await loadPDF(arrayBuffer, file.name);
  const totalPages = source.getPageCount();
  const features = inspectFeatures(source);

  const ranges = parsePageRanges(rangeString, totalPages);

  const parts: SplitResult["parts"] = [];
  const baseName = file.name.replace(/\.pdf$/i, "");

  for (let i = 0; i < ranges.length; i++) {
    const [start, end] = ranges[i];
    const pct = 10 + Math.round(((i + 1) / ranges.length) * 80);
    onProgress?.(`Extracting pages ${start}–${end}…`, pct);

    const newDoc = await PDFDocument.create();
    // pdf-lib uses 0-indexed pages
    const pageIndices = Array.from({ length: end - start + 1 }, (_, j) => start - 1 + j);
    const copiedPages = await newDoc.copyPages(source, pageIndices);

    for (const page of copiedPages) {
      newDoc.addPage(page);
    }

    const bytes = await newDoc.save();
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
    const label = start === end ? `${baseName}_page${start}.pdf` : `${baseName}_pages${start}-${end}.pdf`;

    parts.push({ blob, label, pageCount: copiedPages.length });
  }

  onProgress?.("Done", 100);

  return {
    parts,
    totalSourcePages: totalPages,
    warning: describeLostFeatures(features),
  };
}
