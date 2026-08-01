/**
 * Watermark PDF — pdf-lib text overlay
 *
 * Draws text across each page at a chosen angle and opacity. This is an
 * overlay, not a security feature: the text sits in the content stream and
 * can be removed by anyone with a PDF editor. The UI says so, because a
 * watermark that people believe is tamper-proof is worse than none.
 */

import { StandardFonts, rgb, degrees } from "pdf-lib";
import { loadPDF } from "./pdf-utils";

export interface WatermarkOptions {
  text: string;
  /** Degrees counter-clockwise. 45 is the familiar diagonal. */
  angle: number;
  opacity: number;
  fontSize: number;
  /** Hex string like "#DC2626". */
  color: string;
}

export interface WatermarkResult {
  blob: Blob;
  filename: string;
  pageCount: number;
}

/** Standard fonts are WinAnsi — anything outside Latin-1 cannot be drawn. */
export function findUnsupportedCharacter(text: string): string | null {
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    // Printable Latin-1 plus the usual whitespace.
    if (code === 9 || code === 10 || code === 13) continue;
    if (code >= 32 && code <= 126) continue;
    if (code >= 160 && code <= 255) continue;
    return char;
  }
  return null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  return {
    r: parseInt(full.slice(0, 2), 16) / 255,
    g: parseInt(full.slice(2, 4), 16) / 255,
    b: parseInt(full.slice(4, 6), 16) / 255,
  };
}

export async function watermarkPDF(
  file: File,
  options: WatermarkOptions,
  onProgress?: (step: string, pct: number) => void
): Promise<WatermarkResult> {
  const text = options.text.trim();

  if (!text) {
    throw new Error("Enter the text you want stamped across the pages.");
  }

  const bad = findUnsupportedCharacter(text);
  if (bad) {
    throw new Error(
      `"${bad}" can't be drawn with the built-in PDF fonts, which only cover Latin characters. ` +
        `Use text without accented or non-Latin symbols.`
    );
  }

  onProgress?.("Reading PDF…", 10);

  const arrayBuffer = await file.arrayBuffer();
  const doc = await loadPDF(arrayBuffer, file.name);
  const pageCount = doc.getPageCount();

  onProgress?.("Embedding font…", 25);

  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const { r, g, b } = hexToRgb(options.color);

  const textWidth = font.widthOfTextAtSize(text, options.fontSize);
  const textHeight = font.heightAtSize(options.fontSize);
  const radians = (options.angle * Math.PI) / 180;

  onProgress?.("Stamping pages…", 40);

  for (let i = 0; i < pageCount; i++) {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();

    // pdf-lib rotates text about its start point, so centring means walking
    // back half the rotated text box from the page centre rather than just
    // subtracting half the width.
    const dx = (Math.cos(radians) * textWidth - Math.sin(radians) * textHeight) / 2;
    const dy = (Math.sin(radians) * textWidth + Math.cos(radians) * textHeight) / 2;

    page.drawText(text, {
      x: width / 2 - dx,
      y: height / 2 - dy,
      size: options.fontSize,
      font,
      color: rgb(r, g, b),
      opacity: options.opacity,
      rotate: degrees(options.angle),
    });

    if (i % 25 === 0) {
      onProgress?.("Stamping pages…", 40 + Math.round((i / pageCount) * 45));
    }
  }

  onProgress?.("Saving…", 90);

  const bytes = await doc.save();
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });

  onProgress?.("Done", 100);

  return {
    blob,
    filename: file.name.replace(/\.pdf$/i, "") + "_watermarked.pdf",
    pageCount,
  };
}
