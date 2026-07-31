/**
 * Sign PDF — pdf-lib image stamping
 *
 * The signature arrives as a transparent PNG the client drew on a canvas (or
 * rendered from a typed name), plus a position expressed as fractions of the
 * page. Fractions rather than points because the UI places the mark on a
 * scaled preview and has no reason to know about PDF user space.
 *
 * A word on what this is: it stamps a picture of a signature onto a page. That
 * is what "sign PDF" means to almost everyone and it is what the paper-mimicking
 * workflow needs, but it is *not* a cryptographic signature — it carries no
 * certificate and proves nothing about who applied it or whether the document
 * changed afterwards. The UI says so plainly rather than letting the word
 * "signed" imply more than it should.
 */

import type { ProgressFn } from "./ffmpeg";
import { loadPDF } from "./pdf-utils";

export interface SignaturePlacement {
  /** 1-indexed page to stamp. */
  pageNumber: number;
  /** Left edge, as a fraction of page width (0–1). */
  x: number;
  /** Top edge, as a fraction of page height (0–1), measured from the top. */
  y: number;
  /** Width as a fraction of page width (0–1). Height follows the aspect ratio. */
  width: number;
}

export interface SignResult {
  blob: Blob;
  filename: string;
  pageNumber: number;
  totalPages: number;
}

export async function signPDF(
  file: File,
  signaturePng: Blob,
  placement: SignaturePlacement,
  onProgress?: ProgressFn
): Promise<SignResult> {
  onProgress?.("Reading PDF…", 15);

  const doc = await loadPDF(await file.arrayBuffer(), file.name);
  const pages = doc.getPages();
  const totalPages = pages.length;

  if (
    !Number.isInteger(placement.pageNumber) ||
    placement.pageNumber < 1 ||
    placement.pageNumber > totalPages
  ) {
    throw new Error(`Page ${placement.pageNumber} doesn't exist — this PDF has ${totalPages}.`);
  }

  onProgress?.("Embedding signature…", 45);

  let image;
  try {
    image = await doc.embedPng(await signaturePng.arrayBuffer());
  } catch {
    throw new Error("The signature image couldn't be embedded. Try drawing it again.");
  }

  const page = pages[placement.pageNumber - 1];

  // getSize() reports the CropBox where one exists, which is what the preview
  // rendered — so placement fractions line up without extra correction.
  const { width: pageWidth, height: pageHeight } = page.getSize();

  const drawWidth = pageWidth * placement.width;
  const drawHeight = drawWidth * (image.height / image.width);

  // The client measures y from the top because that is how a canvas and a
  // screen work. PDF user space has its origin at the bottom-left, and
  // drawImage positions by the image's *bottom* edge, so both flips apply.
  const x = pageWidth * placement.x;
  const y = pageHeight - pageHeight * placement.y - drawHeight;

  page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });

  onProgress?.("Saving…", 80);

  const bytes = await doc.save();

  onProgress?.("Done", 100);

  return {
    blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
    filename: file.name.replace(/\.pdf$/i, "") + "_signed.pdf",
    pageNumber: placement.pageNumber,
    totalPages,
  };
}

/**
 * Render a typed name as a transparent PNG in a script face.
 *
 * Kept here rather than in the component so the "draw it" and "type it" paths
 * hand `signPDF` the same thing: a PNG with an alpha channel, trimmed to its
 * ink. Anything opaque would stamp a white box over the page.
 */
export async function renderTypedSignature(
  name: string,
  fontFamily: string,
  color: string
): Promise<Blob> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Type a name to use as a signature.");

  const FONT_SIZE = 96;
  const PADDING = 24;

  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");
  if (!measureCtx) throw new Error("Your browser could not provide a canvas to draw on.");

  measureCtx.font = `${FONT_SIZE}px ${fontFamily}`;
  const metrics = measureCtx.measureText(trimmed);

  // actualBoundingBox* covers descenders and the swash tails of script faces,
  // which a plain `width` + font-size box clips.
  const ascent = metrics.actualBoundingBoxAscent || FONT_SIZE * 0.8;
  const descent = metrics.actualBoundingBoxDescent || FONT_SIZE * 0.3;

  const width = Math.ceil(metrics.width) + PADDING * 2;
  const height = Math.ceil(ascent + descent) + PADDING * 2;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not provide a canvas to draw on.");

  // No fillRect — the canvas starts fully transparent and must stay that way.
  ctx.font = `${FONT_SIZE}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(trimmed, PADDING, PADDING + ascent);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("The browser failed to render the signature.")),
      "image/png"
    );
  });
}
