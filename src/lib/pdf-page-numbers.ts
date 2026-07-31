/**
 * Add Page Numbers — pdf-lib text drawing
 *
 * Draws directly onto each page's content stream with a standard font, so
 * nothing has to be embedded and the file grows by a few hundred bytes total.
 *
 * Standard fonts are WinAnsi-encoded, which means they cannot render text
 * outside Latin-1. That only matters for the custom text field, and the
 * failure is caught before saving rather than surfacing as a pdf-lib throw.
 */

import { StandardFonts, rgb, degrees } from "pdf-lib";
import { loadPDF } from "./pdf-utils";

export type NumberPosition =
  | "top-left" | "top-center" | "top-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

export type NumberFormat = "n" | "page-n" | "n-of-total" | "page-n-of-total";

export const POSITION_LABELS: Record<NumberPosition, string> = {
  "top-left": "Top left",
  "top-center": "Top centre",
  "top-right": "Top right",
  "bottom-left": "Bottom left",
  "bottom-center": "Bottom centre",
  "bottom-right": "Bottom right",
};

export const FORMAT_LABELS: Record<NumberFormat, string> = {
  n: "1",
  "page-n": "Page 1",
  "n-of-total": "1 / 10",
  "page-n-of-total": "Page 1 of 10",
};

export interface PageNumberOptions {
  position: NumberPosition;
  format: NumberFormat;
  fontSize: number;
  /** Number printed on the first included page. */
  startAt: number;
  /** Skip stamping the first page — usual for a cover or title page. */
  skipFirstPage: boolean;
  margin: number;
}

export interface PageNumberResult {
  blob: Blob;
  filename: string;
  pagesStamped: number;
  totalPages: number;
}

function renderLabel(format: NumberFormat, current: number, total: number): string {
  switch (format) {
    case "n":
      return String(current);
    case "page-n":
      return `Page ${current}`;
    case "n-of-total":
      return `${current} / ${total}`;
    case "page-n-of-total":
      return `Page ${current} of ${total}`;
  }
}

export async function addPageNumbers(
  file: File,
  options: PageNumberOptions,
  onProgress?: (step: string, pct: number) => void
): Promise<PageNumberResult> {
  onProgress?.("Reading PDF…", 10);

  const arrayBuffer = await file.arrayBuffer();
  const doc = await loadPDF(arrayBuffer, file.name);
  const totalPages = doc.getPageCount();

  onProgress?.("Embedding font…", 25);

  const font = await doc.embedFont(StandardFonts.Helvetica);

  const firstIndex = options.skipFirstPage ? 1 : 0;
  const stampedCount = Math.max(0, totalPages - firstIndex);

  if (stampedCount === 0) {
    throw new Error(
      "Skipping the first page leaves nothing to number — this document only has one page."
    );
  }

  const lastNumber = options.startAt + stampedCount - 1;

  onProgress?.("Stamping pages…", 40);

  for (let i = firstIndex; i < totalPages; i++) {
    const page = doc.getPage(i);
    const label = renderLabel(
      options.format,
      options.startAt + (i - firstIndex),
      lastNumber
    );

    const textWidth = font.widthOfTextAtSize(label, options.fontSize);
    const textHeight = font.heightAtSize(options.fontSize);

    // getSize() reports the media box, which ignores /Rotate. A page the
    // viewer shows landscape still reports portrait dimensions here, so the
    // stamp has to be placed in unrotated space and turned to match.
    const { width, height } = page.getSize();
    const rotation = page.getRotation().angle % 360;
    const swapped = rotation === 90 || rotation === 270;
    const visibleWidth = swapped ? height : width;
    const visibleHeight = swapped ? width : height;

    const [vertical, horizontal] = options.position.split("-");

    // Where the stamp goes in the coordinate space the *reader* sees:
    // origin bottom-left, x right, y up.
    let vx: number;
    if (horizontal === "left") vx = options.margin;
    else if (horizontal === "right") vx = visibleWidth - options.margin - textWidth;
    else vx = (visibleWidth - textWidth) / 2;

    const vy =
      vertical === "top"
        ? visibleHeight - options.margin - textHeight
        : options.margin;

    // Map that back into page space, inverting /Rotate.
    //
    // /Rotate R turns the page R degrees clockwise for display, so a visible
    // point (u, v) comes from a page point given by the inverse rotation.
    // Passing rotate: degrees(R) to drawText then makes the glyphs run along
    // the visible x-axis, and the anchor pdf-lib uses is the corner the text
    // grows away from — which is why 180 and 270 anchor at the far edge
    // rather than subtracting the text box.
    let x: number;
    let y: number;
    switch (rotation) {
      case 90:
        x = width - vy;
        y = vx;
        break;
      case 180:
        x = width - vx;
        y = height - vy;
        break;
      case 270:
        x = vy;
        y = height - vx;
        break;
      default:
        x = vx;
        y = vy;
    }

    page.drawText(label, {
      x,
      y,
      size: options.fontSize,
      font,
      color: rgb(0.15, 0.15, 0.15),
      rotate: degrees(rotation),
    });

    if (i % 25 === 0) {
      onProgress?.("Stamping pages…", 40 + Math.round((i / totalPages) * 45));
    }
  }

  onProgress?.("Saving…", 90);

  const bytes = await doc.save();
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });

  onProgress?.("Done", 100);

  return {
    blob,
    filename: file.name.replace(/\.pdf$/i, "") + "_numbered.pdf",
    pagesStamped: stampedCount,
    totalPages,
  };
}
