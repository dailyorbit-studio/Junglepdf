/**
 * Three page-level PDF operations that share one shape: read the document,
 * build a new one whose pages are the old ones rearranged or re-boxed, save.
 *
 * All three go through `copyPages`, so all three carry the same caveat as
 * merge, split and organize — form fields and bookmarks live on the document
 * catalog and cannot come across. `inspectFeatures` detects them so the UI can
 * say so rather than losing them quietly.
 */

import { PDFDocument } from "pdf-lib";
import { loadPDF, inspectFeatures, describeLostFeatures } from "./pdf-utils";

export interface PageOpResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  /** Pages in the finished document, where that differs from the source. */
  outputPageCount: number;
  notice: string | null;
}

/* ─────────────────────────── Reverse ─────────────────────────── */

/**
 * Reverse the page order.
 *
 * `copyPages` with a reversed index list rather than repeated `removePage` and
 * `insertPage` on the original: mutating a document while iterating its own
 * page tree is how off-by-one bugs get in, and copying into a fresh document
 * also drops the orphaned objects the original may be carrying.
 */
export async function reversePDF(
  file: File,
  onProgress?: (step: string, pct: number) => void
): Promise<PageOpResult> {
  onProgress?.("Reading PDF…", 10);

  const source = await loadPDF(await file.arrayBuffer(), file.name);
  const pageCount = source.getPageCount();

  if (pageCount < 2) {
    throw new Error("This PDF has a single page, so reversing it would change nothing.");
  }

  const features = inspectFeatures(source);

  onProgress?.("Reversing page order…", 45);

  const output = await PDFDocument.create();
  const indices = Array.from({ length: pageCount }, (_, i) => pageCount - 1 - i);
  const pages = await output.copyPages(source, indices);
  for (const page of pages) output.addPage(page);

  onProgress?.("Saving…", 85);

  const bytes = await output.save();
  onProgress?.("Done", 100);

  return {
    blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),
    filename: file.name.replace(/\.pdf$/i, "") + "_reversed.pdf",
    pageCount,
    outputPageCount: pageCount,
    notice: describeLostFeatures(features),
  };
}

/* ─────────────────────────── N-up ─────────────────────────── */

export type NupLayout = 2 | 4 | 6 | 9;

export const NUP_LABELS: Record<NupLayout, string> = {
  2: "2 pages per sheet",
  4: "4 pages per sheet",
  6: "6 pages per sheet",
  9: "9 pages per sheet",
};

/** Columns × rows for each layout, chosen to suit portrait source pages. */
const NUP_GRID: Record<NupLayout, { columns: number; rows: number; landscape: boolean }> = {
  2: { columns: 2, rows: 1, landscape: true },
  4: { columns: 2, rows: 2, landscape: false },
  6: { columns: 3, rows: 2, landscape: true },
  9: { columns: 3, rows: 3, landscape: false },
};

export interface NupOptions {
  layout: NupLayout;
  /** Gap around each placed page, in points. */
  gap: number;
  /** Hairline around each slot, so a printed handout shows the page edges. */
  drawBorders: boolean;
}

/**
 * Place several source pages on each sheet.
 *
 * `embedPages` turns pages into form XObjects that can be drawn at any scale,
 * which is what makes this lossless — the text stays text and the images stay
 * at their original resolution, just drawn smaller. Rasterising to fit would
 * be far simpler and would throw away both.
 *
 * The sheet takes the first page's dimensions, rotated to landscape for the
 * layouts that want it. Mixed-size documents are scaled per slot to fit,
 * preserving each page's own aspect ratio rather than stretching it.
 */
export async function nupPDF(
  file: File,
  options: NupOptions,
  onProgress?: (step: string, pct: number) => void
): Promise<PageOpResult> {
  onProgress?.("Reading PDF…", 10);

  const source = await loadPDF(await file.arrayBuffer(), file.name);
  const pageCount = source.getPageCount();
  const features = inspectFeatures(source);

  const { columns, rows, landscape } = NUP_GRID[options.layout];
  const perSheet = columns * rows;

  const first = source.getPage(0);
  const { width: srcWidth, height: srcHeight } = first.getSize();
  const sheetWidth = landscape ? Math.max(srcWidth, srcHeight) : Math.min(srcWidth, srcHeight);
  const sheetHeight = landscape ? Math.min(srcWidth, srcHeight) : Math.max(srcWidth, srcHeight);

  onProgress?.("Arranging pages…", 35);

  const output = await PDFDocument.create();
  const embedded = await output.embedPages(source.getPages());

  const gap = Math.max(0, options.gap);
  const slotWidth = (sheetWidth - gap * (columns + 1)) / columns;
  const slotHeight = (sheetHeight - gap * (rows + 1)) / rows;

  if (slotWidth <= 0 || slotHeight <= 0) {
    throw new Error(
      "The gap is too large for this layout — there is no room left for the pages themselves. Try a smaller gap."
    );
  }

  for (let start = 0; start < pageCount; start += perSheet) {
    const sheet = output.addPage([sheetWidth, sheetHeight]);

    for (let slot = 0; slot < perSheet && start + slot < pageCount; slot++) {
      const page = embedded[start + slot];
      const column = slot % columns;
      const row = Math.floor(slot / columns);

      // Fit inside the slot without distorting: one scale factor for both axes.
      const scale = Math.min(slotWidth / page.width, slotHeight / page.height);
      const drawWidth = page.width * scale;
      const drawHeight = page.height * scale;

      // pdf-lib's origin is bottom-left, so rows count down from the top.
      const slotX = gap + column * (slotWidth + gap);
      const slotY = sheetHeight - gap - (row + 1) * slotHeight - row * gap;

      sheet.drawPage(page, {
        x: slotX + (slotWidth - drawWidth) / 2,
        y: slotY + (slotHeight - drawHeight) / 2,
        width: drawWidth,
        height: drawHeight,
      });

      if (options.drawBorders) {
        sheet.drawRectangle({
          x: slotX,
          y: slotY,
          width: slotWidth,
          height: slotHeight,
          borderWidth: 0.5,
          borderOpacity: 0.35,
        });
      }
    }

    onProgress?.(
      "Arranging pages…",
      35 + Math.round(((start + perSheet) / pageCount) * 50)
    );
  }

  onProgress?.("Saving…", 90);

  const bytes = await output.save();
  onProgress?.("Done", 100);

  const outputPageCount = Math.ceil(pageCount / perSheet);

  return {
    blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),
    filename: file.name.replace(/\.pdf$/i, "") + `_${options.layout}up.pdf`,
    pageCount,
    outputPageCount,
    notice: describeLostFeatures(features),
  };
}

/* ─────────────────────── Resize page size ─────────────────────── */

export type PaperSize = "a4" | "letter" | "legal" | "a3" | "a5";

/** Points, portrait. 72pt = 1 inch. */
export const PAPER_SIZES: Record<PaperSize, { label: string; size: [number, number] }> = {
  a4: { label: "A4 (210 × 297 mm)", size: [595.28, 841.89] },
  letter: { label: "US Letter (8.5 × 11 in)", size: [612, 792] },
  legal: { label: "US Legal (8.5 × 14 in)", size: [612, 1008] },
  a3: { label: "A3 (297 × 420 mm)", size: [841.89, 1190.55] },
  a5: { label: "A5 (148 × 210 mm)", size: [419.53, 595.28] },
};

export interface ResizeOptions {
  target: PaperSize;
  /** Keep each page's own orientation rather than forcing portrait. */
  keepOrientation: boolean;
}

/**
 * Re-box every page onto a standard paper size.
 *
 * The content is scaled to fit and centred, not stretched: a Letter page
 * scaled onto A4 keeps its proportions and gains a margin, because the two
 * sizes have different aspect ratios and any tool that "fills" the page is
 * quietly distorting the document.
 *
 * Like N-up this uses `embedPages`, so text stays selectable and images keep
 * their resolution.
 */
export async function resizePDF(
  file: File,
  options: ResizeOptions,
  onProgress?: (step: string, pct: number) => void
): Promise<PageOpResult> {
  onProgress?.("Reading PDF…", 10);

  const source = await loadPDF(await file.arrayBuffer(), file.name);
  const pageCount = source.getPageCount();
  const features = inspectFeatures(source);

  onProgress?.("Resizing pages…", 35);

  const output = await PDFDocument.create();
  const embedded = await output.embedPages(source.getPages());
  const [targetShort, targetLong] = PAPER_SIZES[options.target].size;

  for (let i = 0; i < embedded.length; i++) {
    const page = embedded[i];
    const sourceIsLandscape = page.width > page.height;
    const useLandscape = options.keepOrientation && sourceIsLandscape;

    const width = useLandscape ? targetLong : targetShort;
    const height = useLandscape ? targetShort : targetLong;

    const sheet = output.addPage([width, height]);
    const scale = Math.min(width / page.width, height / page.height);

    sheet.drawPage(page, {
      x: (width - page.width * scale) / 2,
      y: (height - page.height * scale) / 2,
      width: page.width * scale,
      height: page.height * scale,
    });

    if (i % 10 === 0) {
      onProgress?.("Resizing pages…", 35 + Math.round((i / embedded.length) * 50));
    }
  }

  onProgress?.("Saving…", 90);

  const bytes = await output.save();
  onProgress?.("Done", 100);

  return {
    blob: new Blob([bytes as unknown as BlobPart], { type: "application/pdf" }),
    filename: file.name.replace(/\.pdf$/i, "") + `_${options.target}.pdf`,
    pageCount,
    outputPageCount: pageCount,
    notice: describeLostFeatures(features),
  };
}
