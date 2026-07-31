/**
 * PDF to Text — pdf.js text layer
 *
 * This reads the text that is *already* in the file. It is not OCR, and the
 * distinction matters more than any other caveat in this toolkit: a PDF
 * produced by Word has a text layer and comes out perfectly, while a PDF that
 * is a photograph of a page has none and comes out empty. The tool detects
 * that case and says so rather than handing back a blank file.
 *
 * Adding real OCR would mean tesseract.js — several megabytes of WASM and a
 * language model per language — which is a different order of dependency than
 * anything else here.
 */

import type { ProgressFn } from "./ffmpeg";
import { openForRender } from "./pdf-render";

export type TextFormat = "txt" | "md";

export interface TextResult {
  blob: Blob;
  filename: string;
  /** Extracted text, so the UI can offer a copy button and a preview. */
  text: string;
  pageCount: number;
  characterCount: number;
  /** Set when the PDF appears to be scanned images with no text layer. */
  notice: string | null;
}

/** pdf.js returns either a glyph run or a line-break marker. */
interface TextItemLike {
  str?: string;
  hasEOL?: boolean;
  transform?: number[];
}

export async function pdfToText(
  file: File,
  format: TextFormat,
  onProgress?: ProgressFn
): Promise<TextResult> {
  onProgress?.("Reading PDF…", 10);

  const session = await openForRender(await file.arrayBuffer(), file.name);

  try {
    const pageCount = session.doc.numPages;
    const pages: string[] = [];

    for (let n = 1; n <= pageCount; n++) {
      onProgress?.(
        `Extracting page ${n} of ${pageCount}…`,
        15 + Math.round((n / pageCount) * 70)
      );

      const page = await session.doc.getPage(n);
      try {
        const content = await page.getTextContent();
        pages.push(assembleLines(content.items as TextItemLike[]));
      } finally {
        page.cleanup();
      }
    }

    const body =
      format === "md"
        ? pages
            .map((text, i) => `## Page ${i + 1}\n\n${text}`.trim())
            .join("\n\n---\n\n")
        : pages.join("\n\n");

    const text = body.trim();

    onProgress?.("Done", 100);

    return {
      blob: new Blob([text], {
        type: format === "md" ? "text/markdown" : "text/plain",
      }),
      filename: file.name.replace(/\.pdf$/i, "") + `.${format}`,
      text,
      pageCount,
      characterCount: text.length,
      notice:
        text.length === 0
          ? "No text layer was found. This PDF is almost certainly a scan — a picture of a page rather than text — and extracting it would need OCR, which this tool does not do."
          : null,
    };
  } finally {
    await session.destroy();
  }
}

/**
 * Reassemble glyph runs into lines.
 *
 * pdf.js hands back positioned fragments, not lines — a justified paragraph
 * can arrive as dozens of items because the renderer adjusted spacing between
 * words. Joining them blindly gives one enormous line per page.
 *
 * `hasEOL` covers most files. Where a producer omits it, the fallback is the
 * y-coordinate from the text matrix: a fragment that jumped vertically started
 * a new line.
 */
function assembleLines(items: TextItemLike[]): string {
  const lines: string[] = [];
  let current = "";
  let lastY: number | null = null;

  for (const item of items) {
    if (typeof item.str !== "string") continue;

    const y = item.transform?.[5];

    if (lastY !== null && typeof y === "number" && Math.abs(y - lastY) > 2) {
      lines.push(current.trimEnd());
      current = "";
    }

    current += item.str;

    if (item.hasEOL) {
      lines.push(current.trimEnd());
      current = "";
      lastY = null;
    } else if (typeof y === "number") {
      lastY = y;
    }
  }

  if (current.trim()) lines.push(current.trimEnd());

  // Collapse runs of blank lines into paragraph breaks rather than leaving the
  // vertical whitespace of the original layout.
  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
