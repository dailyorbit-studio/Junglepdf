/**
 * PDF rasterisation — pdf.js
 *
 * pdf-lib can read and rewrite a PDF's object graph but it cannot *draw* one.
 * Anything that needs pixels — page thumbnails, PDF-to-image export, image
 * re-encoding — has to go through pdf.js instead.
 *
 * The library is imported dynamically: it is roughly 1MB and the PDF tools
 * that only manipulate structure must not pay for it.
 */

import type { PDFDocumentProxy } from "pdfjs-dist";

/** Served from our own origin by scripts/copy-vendor-assets.mjs. */
const WORKER_SRC = "/pdfjs/pdf.worker.min.mjs";

type PdfJs = typeof import("pdfjs-dist");

let modulePromise: Promise<PdfJs> | null = null;

/**
 * Load pdf.js once and point it at the self-hosted worker.
 *
 * The promise is cached rather than a resolved flag so two tools mounting at
 * once share a single import instead of racing two module evaluations.
 */
async function getPdfJs(): Promise<PdfJs> {
  if (!modulePromise) {
    modulePromise = import("pdfjs-dist").then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = WORKER_SRC;
      return mod;
    });
  }
  return modulePromise;
}

/**
 * A rendering session. `destroy` tears down the worker — always call it in a
 * `finally`, or the worker and its copy of the file outlive the tool.
 */
export interface RenderSession {
  doc: PDFDocumentProxy;
  destroy: () => Promise<void>;
}

/**
 * Open a PDF for rendering.
 *
 * Mirrors the error mapping in pdf-utils' `loadPDF` so a corrupt or encrypted
 * file reads the same whichever library happens to touch it first.
 */
export async function openForRender(
  bytes: ArrayBuffer,
  filename?: string
): Promise<RenderSession> {
  const label = filename ? `"${filename}"` : "This PDF";
  const pdfjs = await getPdfJs();

  try {
    // pdf.js transfers and then detaches the buffer it is given, which would
    // break any caller that still needs the bytes. Hand it a copy.
    const task = pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)) });
    const doc = await task.promise;
    // destroy() lives on the loading task, not the document proxy — hand back
    // both so callers don't need to know that.
    return { doc, destroy: () => task.destroy() };
  } catch (err) {
    const name = (err as { name?: string })?.name ?? "";
    const message = err instanceof Error ? err.message : String(err);

    if (name === "PasswordException" || /password/i.test(message)) {
      throw new Error(
        `${label} is password-protected. Remove the password in your PDF reader, then try again.`
      );
    }
    throw new Error(
      `${label} could not be read. It may be corrupted or not a valid PDF.`
    );
  }
}

export interface RenderedPage {
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Render one page to a raster image.
 *
 * `scale` is relative to the PDF's own 72dpi user space, so scale 2 gives
 * 144dpi. Callers that think in DPI should pass `dpi / 72`.
 */
/**
 * Draw over a rendered page before it is encoded.
 *
 * Exists for Redact PDF, which has to paint its boxes onto the raster itself —
 * redaction that leaves the original page underneath is not redaction. Passing
 * a callback keeps every pdf.js call in this module rather than giving another
 * file its own render loop to get subtly wrong.
 */
export type PageDecorator = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => void;

export async function renderPage(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  format: "image/png" | "image/jpeg" = "image/png",
  quality = 0.92,
  decorate?: PageDecorator
): Promise<RenderedPage> {
  const page = await doc.getPage(pageNumber);

  try {
    const viewport = page.getViewport({ scale });
    const width = Math.max(1, Math.floor(viewport.width));
    const height = Math.max(1, Math.floor(viewport.height));

    // pdf.js renders onto a real <canvas>, not an OffscreenCanvas — it reads
    // canvas.style during setup.
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    try {
      // Pass `canvas` alone — pdf.js treats `canvas` and `canvasContext` as
      // alternatives, and supplying both is out of contract.
      //
      // `background` is how the page gets its white base. JPEG has no alpha,
      // so without it every unpainted area would encode as black.
      //
      // Note: pdf.js drives its canvas render loop off requestAnimationFrame,
      // so this does not progress while the tab is hidden. It resumes when the
      // tab is shown again — the promise stays pending rather than failing.
      await page.render({ canvas, viewport, background: "#FFFFFF" }).promise;

      if (decorate) {
        const ctx = canvas.getContext("2d");
        if (ctx) decorate(ctx, width, height);
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("The browser failed to encode the page image."))),
          format,
          format === "image/png" ? undefined : quality
        );
      });

      return { blob, width, height };
    } finally {
      // Release the backing store immediately — a 300 DPI A4 page is ~35MB,
      // and a 200-page run would otherwise hold every one until GC catches up.
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    page.cleanup();
  }
}

/** Largest scale that keeps a page inside the browser's canvas limits. */
export function clampScale(
  doc_width: number,
  doc_height: number,
  desiredScale: number
): number {
  const MAX_AREA = 16_777_216; // iOS Safari ceiling, same as canvas-utils
  const area = doc_width * doc_height * desiredScale * desiredScale;
  if (area <= MAX_AREA) return desiredScale;
  return Math.sqrt(MAX_AREA / (doc_width * doc_height));
}
