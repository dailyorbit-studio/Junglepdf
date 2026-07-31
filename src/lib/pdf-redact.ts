/**
 * Redact PDF — rasterise, paint, rebuild
 *
 * The single most important thing about this tool is what it refuses to do.
 *
 * Every "redaction" that draws a black rectangle over text in a PDF leaves the
 * text exactly where it was, underneath. It still selects, still copies, still
 * comes out of any text extractor — including the PDF to Text tool on this very
 * site. People have leaked court filings, medical records and unredacted names
 * this way, repeatedly, for years. A black box is a graphic, not a deletion.
 *
 * So this converts each page to an image, paints the boxes onto the *pixels*,
 * and rebuilds the PDF from those images. The redacted content is not hidden;
 * it no longer exists in the file.
 *
 * That has a real cost, stated plainly in the UI: the output has no text layer.
 * It is not searchable, not selectable, and larger than the original. That is
 * the price of the guarantee, and a redaction tool that quietly kept the text
 * to preserve searchability would be worse than useless — it would be
 * dangerous.
 */

import { PDFDocument } from "pdf-lib";
import { openForRender, clampScale } from "./pdf-render";
import type { ProgressFn } from "./ffmpeg";

/** A box in normalised page coordinates: 0–1 from the top-left. */
export interface RedactionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Page number (1-indexed) → boxes on that page. */
export type RedactionMap = Record<number, RedactionBox[]>;

export interface RedactResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  boxCount: number;
  notice: string | null;
}

export const DPI_OPTIONS = [150, 200, 300] as const;
export type RedactDpi = (typeof DPI_OPTIONS)[number];

export interface RedactOptions {
  dpi: RedactDpi;
  /** Boxes to paint, by page. */
  boxes: RedactionMap;
}

export function countBoxes(boxes: RedactionMap): number {
  return Object.values(boxes).reduce((n, list) => n + list.length, 0);
}

export function describeTradeoffs(): string[] {
  return [
    "Pages are rebuilt as images, so removed content is genuinely gone",
    "The output has no text layer — it cannot be searched or copied from",
    "The file will be larger than the original",
    "Everything outside your boxes stays visible, at the resolution you pick",
  ];
}

export async function redactPDF(
  file: File,
  options: RedactOptions,
  onProgress?: ProgressFn
): Promise<RedactResult> {
  const boxCount = countBoxes(options.boxes);
  if (boxCount === 0) {
    throw new Error("Draw at least one box over the content you want removed.");
  }

  onProgress?.("Reading PDF…", 5);

  const session = await openForRender(await file.arrayBuffer(), file.name);

  try {
    const pageCount = session.doc.numPages;
    const out = await PDFDocument.create();
    out.setProducer("JunglePDF");
    out.setCreator("JunglePDF Redact PDF");

    const { renderPage } = await import("./pdf-render");

    for (let n = 1; n <= pageCount; n++) {
      onProgress?.(
        `Redacting page ${n} of ${pageCount}…`,
        8 + Math.round((n / pageCount) * 80)
      );

      const page = await session.doc.getPage(n);
      const viewport = page.getViewport({ scale: 1 });
      page.cleanup();

      const requested = options.dpi / 72;
      const scale = clampScale(viewport.width, viewport.height, requested);
      const onThisPage = options.boxes[n] ?? [];

      // JPEG rather than PNG: a rasterised text page is a photograph as far as
      // an encoder is concerned, and PNG on that content produces files several
      // times larger for no visible gain.
      const rendered = await renderPage(
        session.doc,
        n,
        scale,
        "image/jpeg",
        0.9,
        (ctx, width, height) => {
          ctx.fillStyle = "#000000";
          for (const box of onThisPage) {
            // Normalised coordinates are resolution-independent, so the boxes
            // drawn on a small on-screen preview land correctly on a 300 DPI
            // raster.
            ctx.fillRect(
              Math.round(box.x * width),
              Math.round(box.y * height),
              Math.round(box.width * width),
              Math.round(box.height * height)
            );
          }
        }
      );

      const embedded = await out.embedJpg(await rendered.blob.arrayBuffer());
      // Keep the original page geometry so the document still prints correctly.
      const newPage = out.addPage([viewport.width, viewport.height]);
      newPage.drawImage(embedded, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });
    }

    onProgress?.("Saving…", 92);

    const bytes = await out.save();
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });

    onProgress?.("Done", 100);

    const grew = blob.size > file.size;

    return {
      blob,
      filename: file.name.replace(/\.pdf$/i, "") + "-redacted.pdf",
      pageCount,
      boxCount,
      notice:
        `Every page was rebuilt as an image, so the removed content is gone from the file rather than covered up. The result has no text layer — it cannot be searched or copied from` +
        (grew
          ? `, and it is larger than the original (${(blob.size / (1024 * 1024)).toFixed(1)} MB versus ${(file.size / (1024 * 1024)).toFixed(1)} MB).`
          : `.`),
    };
  } finally {
    await session.destroy();
  }
}
