/**
 * Drawing on top of a PDF — pdf-lib
 *
 * The engine behind both PDF Annotator and Edit PDF. Both do the same thing
 * underneath: take a list of items positioned on pages and paint them onto the
 * existing content. They differ only in which items their UI offers.
 *
 * Everything here is **additive and vector**. The original page content is
 * untouched, nothing is rasterised, and the document keeps its text layer — so
 * the result is still searchable and still selectable. That is the right
 * trade-off for annotation, and precisely the wrong one for redaction: a filled
 * black box drawn here covers text without removing it. Redact PDF exists for
 * that, rasterises deliberately, and the two tools point at each other so
 * nobody reaches for the wrong one.
 *
 * Coordinates arrive normalised (0–1, origin top-left) because that is what a
 * preview at an arbitrary zoom can produce honestly. PDF user space runs from
 * the bottom-left, so every y is flipped on the way in.
 */

import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { loadPDF } from "./pdf-utils";
import { createSanitizer } from "./pdf-layout";
import type { ProgressFn } from "./ffmpeg";

/** A point in normalised page coordinates. */
export interface Point {
  x: number;
  y: number;
}

export interface OverlayBase {
  /** 1-indexed page. */
  page: number;
  /** Hex colour, e.g. "#ffe066". */
  color: string;
}

export type Overlay =
  | (OverlayBase & { kind: "highlight"; x: number; y: number; width: number; height: number })
  | (OverlayBase & { kind: "box"; x: number; y: number; width: number; height: number; opacity: number })
  | (OverlayBase & { kind: "text"; x: number; y: number; text: string; size: number })
  | (OverlayBase & { kind: "ink"; points: Point[]; thickness: number })
  | (OverlayBase & { kind: "image"; x: number; y: number; width: number; height: number; dataUrl: string });

export interface OverlayResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  itemCount: number;
  notice: string | null;
}

/** "#ffe066" → pdf-lib rgb. Falls back to black on anything unparseable. */
function toColor(hex: string) {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return rgb(0, 0, 0);
  const n = parseInt(match[1], 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/**
 * Draw one item onto a page.
 *
 * `height` is the page's own height, needed for every y flip. Text is measured
 * from its baseline in PDF space but positioned from its top in the editor, so
 * the font size is subtracted to make what you place match what you see.
 */
function drawOverlay(
  page: PDFPage,
  item: Overlay,
  font: PDFFont,
  sanitize: (text: string) => string
): void {
  const { width: pw, height: ph } = page.getSize();

  if (item.kind === "highlight" || item.kind === "box") {
    const opacity = item.kind === "highlight" ? 0.35 : item.opacity;
    page.drawRectangle({
      x: item.x * pw,
      y: ph - (item.y + item.height) * ph,
      width: item.width * pw,
      height: item.height * ph,
      color: toColor(item.color),
      opacity,
    });
    return;
  }

  if (item.kind === "text") {
    const text = sanitize(item.text);
    if (!text) return;
    // Multi-line text: pdf-lib draws \n as a glyph, not a break.
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      page.drawText(line, {
        x: item.x * pw,
        y: ph - item.y * ph - item.size * (i + 1),
        size: item.size,
        font,
        color: toColor(item.color),
        rotate: degrees(0),
      });
    });
    return;
  }

  if (item.kind === "ink") {
    // A stroke is drawn as connected segments with round caps; pdf-lib has no
    // polyline primitive and an SVG path would need the same flipping anyway.
    for (let i = 1; i < item.points.length; i++) {
      const from = item.points[i - 1];
      const to = item.points[i];
      page.drawLine({
        start: { x: from.x * pw, y: ph - from.y * ph },
        end: { x: to.x * pw, y: ph - to.y * ph },
        thickness: item.thickness,
        color: toColor(item.color),
        lineCap: 1,
      });
    }
    return;
  }
}

async function drawImageOverlay(
  doc: PDFDocument,
  page: PDFPage,
  item: Extract<Overlay, { kind: "image" }>
): Promise<boolean> {
  const response = await fetch(item.dataUrl);
  const blob = await response.blob();
  const bytes = await blob.arrayBuffer();

  let embedded;
  try {
    embedded = blob.type === "image/png" ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
  } catch {
    return false;
  }

  const { width: pw, height: ph } = page.getSize();
  page.drawImage(embedded, {
    x: item.x * pw,
    y: ph - (item.y + item.height) * ph,
    width: item.width * pw,
    height: item.height * ph,
  });
  return true;
}

export async function applyOverlays(
  file: File,
  overlays: Overlay[],
  onProgress?: ProgressFn
): Promise<OverlayResult> {
  if (overlays.length === 0) {
    throw new Error("Add something to the document first — nothing has been placed on it yet.");
  }

  onProgress?.("Reading PDF…", 12);

  const doc = await loadPDF(await file.arrayBuffer(), file.name);
  const pages = doc.getPages();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const sanitize = createSanitizer();

  onProgress?.("Drawing…", 40);

  let skippedImages = 0;

  for (let i = 0; i < overlays.length; i++) {
    const item = overlays[i];
    const page = pages[item.page - 1];
    if (!page) continue;

    if (item.kind === "image") {
      const ok = await drawImageOverlay(doc, page, item);
      if (!ok) skippedImages += 1;
    } else {
      drawOverlay(page, item, font, sanitize);
    }

    if (i % 10 === 0) {
      onProgress?.("Drawing…", 40 + Math.round((i / overlays.length) * 45));
    }
  }

  onProgress?.("Saving…", 90);

  const bytes = await doc.save();
  onProgress?.("Done", 100);

  const notes: string[] = [];
  if (sanitize.dropped > 0) {
    notes.push(
      `${sanitize.dropped} character${sanitize.dropped === 1 ? " was" : "s were"} replaced with "?" — the standard PDF fonts cover Western European text only.`
    );
  }
  if (skippedImages > 0) {
    notes.push(`${skippedImages} image could not be embedded and was skipped.`);
  }

  return {
    blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
    filename: file.name.replace(/\.pdf$/i, "") + "-edited.pdf",
    pageCount: pages.length,
    itemCount: overlays.length,
    notice: notes.length > 0 ? notes.join(" ") : null,
  };
}
