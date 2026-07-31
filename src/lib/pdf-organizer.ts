/**
 * Organize PDF — delete and reorder pages
 *
 * Takes an explicit ordering of source page indices and builds a new document
 * from it. Deleting is just omission, and reordering is just a permutation, so
 * one function covers both.
 *
 * Uses copyPages, which means the AcroForm and outline caveats from pdf-utils
 * apply here as they do for merge and split.
 */

import { PDFDocument } from "pdf-lib";
import { loadPDF, inspectFeatures, describeLostFeatures } from "./pdf-utils";
import { openForRender, renderPage } from "./pdf-render";

export interface OrganizeResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  removedCount: number;
  warning: string | null;
}

export interface PageThumbnail {
  /** 0-indexed position in the *source* document. */
  index: number;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Render every page as a small preview.
 *
 * Data URLs rather than object URLs on purpose: thumbnails live for as long
 * as the tool is open and are handed to many <img> elements, so having the
 * browser own the lifetime is simpler than tracking N revocations.
 */
export async function renderThumbnails(
  file: File,
  onProgress?: (step: string, pct: number) => void
): Promise<PageThumbnail[]> {
  onProgress?.("Reading PDF…", 5);

  const arrayBuffer = await file.arrayBuffer();
  const session = await openForRender(arrayBuffer, file.name);
  const { doc } = session;

  try {
    const count = doc.numPages;
    const thumbnails: PageThumbnail[] = [];

    for (let i = 1; i <= count; i++) {
      onProgress?.(`Rendering page ${i} of ${count}…`, 5 + Math.round((i / count) * 90));

      const page = await doc.getPage(i);
      const base = page.getViewport({ scale: 1 });
      page.cleanup();

      // Target roughly 200px on the long edge — enough to recognise a page,
      // cheap enough to render a 200-page document without stalling the tab.
      const scale = Math.min(1.5, 200 / Math.max(base.width, base.height));
      const rendered = await renderPage(doc, i, scale, "image/jpeg", 0.7);

      thumbnails.push({
        index: i - 1,
        dataUrl: await blobToDataUrl(rendered.blob),
        width: rendered.width,
        height: rendered.height,
      });
    }

    onProgress?.("Done", 100);
    return thumbnails;
  } finally {
    await session.destroy();
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read a rendered page."));
    reader.readAsDataURL(blob);
  });
}

/**
 * Build a new PDF containing exactly `order`, in that sequence.
 *
 * `order` holds 0-indexed source page numbers. Repeats are allowed — that is
 * how you duplicate a page.
 */
export async function organizePDF(
  file: File,
  order: number[],
  onProgress?: (step: string, pct: number) => void
): Promise<OrganizeResult> {
  onProgress?.("Reading PDF…", 10);

  const arrayBuffer = await file.arrayBuffer();
  const source = await loadPDF(arrayBuffer, file.name);
  const totalPages = source.getPageCount();
  const features = inspectFeatures(source);

  if (order.length === 0) {
    throw new Error("Keep at least one page — a PDF with no pages is not a valid document.");
  }

  const outOfRange = order.find((i) => i < 0 || i >= totalPages);
  if (outOfRange !== undefined) {
    throw new Error("The page selection no longer matches this document. Reload and try again.");
  }

  onProgress?.("Rebuilding document…", 40);

  const output = await PDFDocument.create();
  const copied = await output.copyPages(source, order);
  for (const page of copied) output.addPage(page);

  onProgress?.("Saving…", 80);

  const bytes = await output.save();
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });

  onProgress?.("Done", 100);

  return {
    blob,
    filename: file.name.replace(/\.pdf$/i, "") + "_organized.pdf",
    pageCount: order.length,
    removedCount: Math.max(0, totalPages - new Set(order).size),
    warning: describeLostFeatures(features),
  };
}
