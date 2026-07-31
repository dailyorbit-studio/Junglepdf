/**
 * Word to PDF — mammoth (.docx → HTML) → the shared layout engine.
 *
 * There is no client-side Word renderer, so this is a two-stage conversion:
 * mammoth reads the OOXML and hands back semantic HTML (headings, lists,
 * tables, runs, images), and `pdf-layout.ts` flows that onto pages. Nothing is
 * uploaded and no headless browser is involved.
 *
 * Structure survives — headings, bold/italic, nested lists, block quotes,
 * tables, links and embedded images. Exact page fidelity does not: mammoth
 * deliberately reads the *document*, not its formatting, so fonts, colors,
 * columns, text boxes, headers/footers and manual page breaks are not in the
 * HTML. The result is a clean re-flow rather than a copy of what Word shows,
 * and `describeLosses()` says so in the UI.
 *
 * Only .docx is readable. The old binary .doc is a different container
 * entirely, rejected by name rather than failing later with a zip error.
 */

import type { ProgressFn } from "./ffmpeg";
import { htmlToBlocks } from "./html-blocks";
import {
  buildNotice,
  createSanitizer,
  renderBlocksToPdf,
  type DocLayoutOptions,
} from "./pdf-layout";

export {
  PAGE_SIZE_LABELS,
  FONT_LABELS,
  MARGIN_PRESETS,
  DEFAULT_LAYOUT,
  describeLosses,
  type DocPageSize,
  type DocFontFamily,
  type DocLayoutOptions,
} from "./pdf-layout";

// The engine's option types are shared across every document converter now.
// These aliases keep the Word tool's own vocabulary.
export type WordPageSize = import("./pdf-layout").DocPageSize;
export type WordFontFamily = import("./pdf-layout").DocFontFamily;
export type WordToPdfOptions = DocLayoutOptions;

export interface WordToPdfResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  skippedImages: number;
  unsupportedCharacters: number;
  notice: string | null;
}

export async function wordToPDF(
  file: File,
  options: DocLayoutOptions,
  onProgress?: ProgressFn
): Promise<WordToPdfResult> {
  if (/\.doc$/i.test(file.name)) {
    throw new Error(
      "This is a legacy .doc file. Open it in Word or Google Docs and save it as .docx, then try again — the old binary format cannot be read in a browser."
    );
  }
  if (!/\.docx$/i.test(file.name)) {
    throw new Error("Choose a .docx Word document.");
  }

  onProgress?.("Reading document…", 5);

  // Dynamic import: mammoth is ~250KB and no other tool needs it.
  const mammoth = await import("mammoth");

  let html: string;
  try {
    const converted = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    html = converted.value;
  } catch {
    throw new Error(
      "This file could not be read as a Word document. It may be corrupted, password-protected, or saved in a different format with a .docx extension."
    );
  }

  onProgress?.("Reading structure…", 25);

  const sanitize = createSanitizer();
  const blocks = htmlToBlocks(html, sanitize);

  if (blocks.length === 0) {
    throw new Error(
      "This document appears to be empty — no text, tables or images were found in it."
    );
  }

  onProgress?.("Laying out pages…", 40);

  const rendered = await renderBlocksToPdf(
    blocks,
    options,
    { title: file.name.replace(/\.docx$/i, ""), creator: "JunglePDF Word to PDF" },
    onProgress
  );

  onProgress?.("Done", 100);

  return {
    blob: rendered.blob,
    filename: file.name.replace(/\.docx$/i, "") + ".pdf",
    pageCount: rendered.pageCount,
    skippedImages: rendered.skippedImages,
    unsupportedCharacters: sanitize.dropped,
    notice: buildNotice(rendered.skippedImages, sanitize.dropped),
  };
}
