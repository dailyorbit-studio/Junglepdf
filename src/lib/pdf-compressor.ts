/**
 * PDF Compressor — pdf-lib
 *
 * Reduces PDF file size by re-serializing the document: pages are copied
 * into a fresh document (dropping objects orphaned by earlier edits) and
 * saved with object streams, which pack small objects together.
 *
 * This is a structural optimization only. pdf-lib cannot re-encode embedded
 * images, so image-heavy PDFs see modest gains and text-only files may not
 * shrink at all. When the rewrite comes out larger than the original — which
 * happens with already-optimized files — we return the original untouched.
 */

import { PDFDocument } from "pdf-lib";
import { loadPDF, inspectFeatures, describeLostFeatures } from "./pdf-utils";

export interface CompressPDFResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  pageCount: number;
  reduction: number; // percentage
  /** True when the rewrite didn't help and we returned the original. */
  keptOriginal: boolean;
  warning: string | null;
}

export async function compressPDF(
  file: File,
  onProgress?: (step: string, pct: number) => void
): Promise<CompressPDFResult> {
  onProgress?.("Reading PDF…", 10);

  const arrayBuffer = await file.arrayBuffer();
  const originalSize = file.size;

  onProgress?.("Analyzing document structure…", 25);

  const source = await loadPDF(arrayBuffer, file.name);
  const pageCount = source.getPageCount();
  const features = inspectFeatures(source);

  onProgress?.("Optimizing document…", 50);

  // Create a fresh document and copy pages (strips orphaned objects)
  const optimized = await PDFDocument.create();
  const pages = await optimized.copyPages(source, source.getPageIndices());
  for (const page of pages) {
    optimized.addPage(page);
  }

  onProgress?.("Saving compressed PDF…", 80);

  // Save with object streams for better compression
  const pdfBytes = await optimized.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  let blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  let keptOriginal = false;

  // Re-serialization can inflate an already-tight file. Handing back
  // something bigger under a "compressed" label would be a lie.
  if (blob.size >= originalSize) {
    blob = new Blob([arrayBuffer], { type: "application/pdf" });
    keptOriginal = true;
  }

  const compressedSize = blob.size;
  const reduction =
    originalSize > 0
      ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
      : 0;

  onProgress?.("Done", 100);

  return {
    blob,
    originalSize,
    compressedSize,
    pageCount,
    reduction: Math.max(0, reduction),
    keptOriginal,
    warning: keptOriginal ? null : describeLostFeatures(features),
  };
}
