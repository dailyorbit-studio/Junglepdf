/**
 * Document → PDF layout engine.
 *
 * A shared typesetter: hand it a list of semantic blocks (headings,
 * paragraphs, lists, tables, images, rules) and it flows them onto pdf-lib
 * pages with word wrapping, pagination, real link annotations and embedded
 * images.
 *
 * This started life inside `word-to-pdf.ts`. Six converters now need exactly
 * the same second half — Word, plain text, RTF, HTML, ODT and EPUB all differ
 * only in how they turn their input into blocks — so the engine lives here and
 * each converter is reduced to its parser. `wav.ts` exists for the same reason:
 * four copies of one encoder is four places to fix one bug.
 *
 * Two constraints run through the whole file:
 *
 *  - **WinAnsi only.** The 14 standard PDF fonts cannot draw outside cp1252,
 *    and pdf-lib throws mid-draw on anything else. Text is sanitized on the way
 *    in and the replacements are counted so callers can disclose them, rather
 *    than shipping a multi-megabyte Unicode font to every visitor.
 *  - **Re-flow, not facsimile.** Nothing here reproduces a source
 *    application's page. It produces a clean, readable document.
 */

import {
  PDFDocument,
  PDFFont,
  PDFName,
  PDFPage,
  PDFRef,
  PDFString,
  StandardFonts,
  rgb,
  type RGB,
} from "pdf-lib";
import { loadDrawableImage, createSurface } from "./canvas-utils";

/* ────────────────────────── public options ────────────────────────── */

export type DocPageSize = "a4" | "letter";
export type DocFontFamily = "sans" | "serif";

export const PAGE_SIZE_LABELS: Record<DocPageSize, string> = {
  a4: "A4",
  letter: "US Letter",
};

export const FONT_LABELS: Record<DocFontFamily, string> = {
  sans: "Sans-serif (Helvetica)",
  serif: "Serif (Times)",
};

/** Points. pdf-lib's PageSizes are the same numbers; spelled out for clarity. */
const PAGE_POINTS: Record<DocPageSize, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

export interface DocLayoutOptions {
  pageSize: DocPageSize;
  fontFamily: DocFontFamily;
  /** Page margin in points. 72pt = 1 inch. */
  margin: number;
  /**
   * Swap the page's width and height. Prose never needs this; a spreadsheet
   * with eight columns needs it badly.
   */
  landscape?: boolean;
}

/** The margin presets every document converter offers. */
export const MARGIN_PRESETS: { value: number; label: string }[] = [
  { value: 36, label: "Narrow" },
  { value: 54, label: "Normal" },
  { value: 72, label: "Wide" },
];

export const DEFAULT_LAYOUT: DocLayoutOptions = {
  pageSize: "a4",
  fontFamily: "sans",
  margin: 54,
};

/* ────────────────────────── document model ────────────────────────── */

export interface Span {
  text: string;
  bold: boolean;
  italic: boolean;
  href?: string;
  /** Draw in a monospace face — code blocks and preformatted text. */
  mono?: boolean;
}

export type Block =
  | { kind: "heading"; level: number; spans: Span[] }
  | { kind: "para"; spans: Span[]; indent: number; marker?: string; quote?: boolean; mono?: boolean }
  | { kind: "image"; src: string }
  | { kind: "table"; rows: { cells: Span[][]; header: boolean }[] }
  | { kind: "rule" }
  | { kind: "pagebreak" };

/** Convenience for parsers that only produce plain runs. */
export function plain(text: string): Span[] {
  return [{ text, bold: false, italic: false }];
}

/* ────────────────────────── text encoding ────────────────────────── */

const CHARACTER_SUBSTITUTES: Record<string, string> = {
  "‐": "-",
  "‑": "-",
  "‒": "-",
  "―": "—",
  "′": "'",
  "″": '"',
  " ": " ",
  " ": " ",
  " ": " ",
  " ": " ",
  " ": " ",
  "­": "",
  "​": "",
  "‌": "",
  "‍": "",
  "﻿": "",
  "≤": "<=",
  "≥": ">=",
  "≠": "!=",
  "→": "->",
  "←": "<-",
  "●": "•",
  "▪": "•",
  "■": "•",
  "✓": "v",
  "✔": "v",
  "✗": "x",
};

/** cp1252's occupants of 0x80–0x9F, where Latin-1 has control codes. */
const WIN_ANSI_HIGH = new Set(
  "€‚ƒ„…†‡ˆ‰Š‹ŒŽ" + "‘’“”•–—˜™š›œžŸ"
);

function encodable(char: string): boolean {
  const code = char.codePointAt(0) ?? 0;
  if (code >= 0x20 && code <= 0x7e) return true;
  if (code >= 0xa0 && code <= 0xff) return true;
  return WIN_ANSI_HIGH.has(char);
}

export interface Sanitizer {
  (text: string): string;
  dropped: number;
}

/**
 * Replace characters the standard PDF fonts cannot encode, counting them.
 *
 * Scripts outside Western European — Devanagari, CJK, Arabic, Greek, Cyrillic —
 * become "?" and the count is reported in the UI, which is a better outcome
 * than pdf-lib throwing on the first one and failing the conversion.
 */
export function createSanitizer(): Sanitizer {
  const fn = ((text: string) => {
    let out = "";
    for (const char of text) {
      const substitute = CHARACTER_SUBSTITUTES[char];
      const candidate = substitute !== undefined ? substitute : char;
      for (const c of candidate) {
        if (encodable(c)) out += c;
        else {
          out += "?";
          fn.dropped += 1;
        }
      }
    }
    return out;
  }) as Sanitizer;

  fn.dropped = 0;
  return fn;
}

/* ────────────────────────── line breaking ────────────────────────── */

interface Piece {
  text: string;
  font: PDFFont;
  size: number;
  href?: string;
  width: number;
}

interface Line {
  pieces: Piece[];
  width: number;
}

interface FontSet {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  boldItalic: PDFFont;
  mono: PDFFont;
  monoBold: PDFFont;
}

function pick(fonts: FontSet, span: { bold: boolean; italic: boolean; mono?: boolean }, boldAll: boolean): PDFFont {
  const bold = span.bold || boldAll;
  if (span.mono) return bold ? fonts.monoBold : fonts.mono;
  if (bold && span.italic) return fonts.boldItalic;
  if (bold) return fonts.bold;
  if (span.italic) return fonts.italic;
  return fonts.regular;
}

/**
 * Greedy word wrap across styled spans.
 *
 * Measuring per token rather than per span, because a bold run can straddle a
 * line break. A token wider than the column (a long URL, a hash) is broken by
 * character rather than allowed to run into the margin.
 */
function layoutLine(
  spans: Span[],
  fonts: FontSet,
  size: number,
  maxWidth: number,
  boldAll = false
): Line[] {
  const lines: Line[] = [];
  let current: Line = { pieces: [], width: 0 };

  const push = () => {
    while (current.pieces.length > 0) {
      const last = current.pieces[current.pieces.length - 1];
      if (last.text.trim() !== "") break;
      current.width -= last.width;
      current.pieces.pop();
    }
    lines.push(current);
    current = { pieces: [], width: 0 };
  };

  const add = (text: string, font: PDFFont, href: string | undefined, width: number) => {
    current.pieces.push({ text, font, size, href, width });
    current.width += width;
  };

  for (const span of spans) {
    const font = pick(fonts, span, boldAll);

    for (const token of span.text.split(/(\s+|\n)/)) {
      if (token === "") continue;

      if (token === "\n") {
        push();
        continue;
      }

      const isSpace = token.trim() === "";
      if (isSpace && current.pieces.length === 0) continue;

      let width = font.widthOfTextAtSize(token, size);

      if (width > maxWidth && !isSpace) {
        if (current.pieces.length > 0) push();
        let chunk = "";
        for (const char of token) {
          if (font.widthOfTextAtSize(chunk + char, size) > maxWidth && chunk !== "") {
            add(chunk, font, span.href, font.widthOfTextAtSize(chunk, size));
            push();
            chunk = char;
          } else {
            chunk += char;
          }
        }
        if (chunk) add(chunk, font, span.href, font.widthOfTextAtSize(chunk, size));
        continue;
      }

      if (current.width + width > maxWidth && current.pieces.length > 0) {
        push();
        if (isSpace) continue;
        width = font.widthOfTextAtSize(token, size);
      }

      add(token, font, span.href, width);
    }
  }

  if (current.pieces.length > 0 || lines.length === 0) push();
  return lines;
}

/* ────────────────────────── the layout pass ────────────────────────── */

const HEADING_SIZES: Record<number, number> = {
  1: 20,
  2: 16,
  3: 13.5,
  4: 12,
  5: 11,
  6: 10.5,
};

const BODY_SIZE = 11;
const LINE_FACTOR = 1.42;
const INDENT_STEP = 18;
const LINK_COLOR = rgb(0.09, 0.36, 0.72);
const TEXT_COLOR = rgb(0.1, 0.1, 0.12);
const QUOTE_COLOR = rgb(0.35, 0.35, 0.4);
const RULE_COLOR = rgb(0.8, 0.8, 0.84);
const CELL_PAD = 5;

class Layout {
  page: PDFPage;
  y: number;
  private annots: PDFRef[] = [];

  constructor(
    private doc: PDFDocument,
    private width: number,
    readonly height: number,
    readonly margin: number
  ) {
    this.page = doc.addPage([width, height]);
    this.y = height - margin;
  }

  get contentWidth(): number {
    return this.width - this.margin * 2;
  }

  newPage(): void {
    this.flushAnnots();
    this.page = this.doc.addPage([this.width, this.height]);
    this.y = this.height - this.margin;
  }

  /** Start a new page when `needed` points will not fit below the cursor. */
  ensure(needed: number): void {
    if (this.y - needed < this.margin) this.newPage();
  }

  /** Vertical space, dropped at the top of a page so pages do not start blank. */
  space(points: number): void {
    if (this.y < this.height - this.margin) this.y -= points;
  }

  link(url: string, x: number, y: number, w: number, h: number): void {
    const ref = this.doc.context.register(
      this.doc.context.obj({
        Type: "Annot",
        Subtype: "Link",
        Rect: [x, y, x + w, y + h],
        Border: [0, 0, 0],
        A: { Type: "Action", S: "URI", URI: PDFString.of(url) },
      })
    );
    this.annots.push(ref);
  }

  private flushAnnots(): void {
    if (this.annots.length === 0) return;
    this.page.node.set(PDFName.of("Annots"), this.doc.context.obj(this.annots));
    this.annots = [];
  }

  finish(): void {
    this.flushAnnots();
  }
}

function drawLine(layout: Layout, line: Line, x: number, baseline: number, color: RGB): void {
  let cursor = x;
  for (const piece of line.pieces) {
    const isLink = Boolean(piece.href);
    layout.page.drawText(piece.text, {
      x: cursor,
      y: baseline,
      size: piece.size,
      font: piece.font,
      color: isLink ? LINK_COLOR : color,
    });

    if (isLink && piece.text.trim() !== "") {
      layout.page.drawLine({
        start: { x: cursor, y: baseline - 1.5 },
        end: { x: cursor + piece.width, y: baseline - 1.5 },
        thickness: 0.5,
        color: LINK_COLOR,
      });
      layout.link(piece.href!, cursor, baseline - 2, piece.width, piece.size + 2);
    }

    cursor += piece.width;
  }
}

/** Draw wrapped text, paginating between lines rather than mid-line. */
function drawParagraph(
  layout: Layout,
  lines: Line[],
  x: number,
  size: number,
  color: RGB,
  rail?: RGB
): void {
  const lineHeight = size * LINE_FACTOR;

  for (const line of lines) {
    layout.ensure(lineHeight);
    const baseline = layout.y - size;

    if (rail) {
      layout.page.drawRectangle({
        x: x - 10,
        y: baseline - lineHeight * 0.25,
        width: 2,
        height: lineHeight,
        color: rail,
      });
    }

    drawLine(layout, line, x, baseline, color);
    layout.y -= lineHeight;
  }
}

async function embedImage(doc: PDFDocument, src: string) {
  const response = await fetch(src);
  const blob = await response.blob();
  const type = blob.type.toLowerCase();

  if (type === "image/png") return doc.embedPng(await blob.arrayBuffer());
  if (type === "image/jpeg" || type === "image/jpg") return doc.embedJpg(await blob.arrayBuffer());

  // GIF, BMP, WebP and TIFF go through a canvas. Vector formats (EMF/WMF, SVG
  // from some writers) cannot be decoded and throw, which the caller counts.
  const file = new File([blob], "image", { type: blob.type || "image/png" });
  const image = await loadDrawableImage(file);
  try {
    const surface = createSurface(image.width, image.height);
    surface.ctx.fillStyle = "#FFFFFF";
    surface.ctx.fillRect(0, 0, image.width, image.height);
    surface.ctx.drawImage(image.source, 0, 0, image.width, image.height);
    const png = await surface.toBlob("image/png");
    return doc.embedPng(await png.arrayBuffer());
  } finally {
    image.release();
  }
}

function drawTable(
  layout: Layout,
  block: Extract<Block, { kind: "table" }>,
  fonts: FontSet
): void {
  const columns = Math.max(...block.rows.map((r) => r.cells.length));
  if (columns === 0) return;

  // Equal columns: source column widths are usually not recoverable, and
  // guessing from content length collapses short-but-important columns.
  const colWidth = layout.contentWidth / columns;
  const textWidth = colWidth - CELL_PAD * 2;
  const size = BODY_SIZE - 1;
  const lineHeight = size * LINE_FACTOR;

  for (const row of block.rows) {
    const cellLines = Array.from({ length: columns }, (_, i) =>
      layoutLine(row.cells[i] ?? [], fonts, size, textWidth, row.header)
    );

    const rowHeight =
      Math.max(...cellLines.map((lines) => lines.length)) * lineHeight + CELL_PAD * 2;

    // A row taller than the page can never fit, and a fresh page would only
    // move the overflow. Let it run past the bottom margin instead.
    if (rowHeight <= layout.height - layout.margin * 2) layout.ensure(rowHeight);

    const top = layout.y;

    for (let c = 0; c < columns; c++) {
      const left = layout.margin + c * colWidth;

      layout.page.drawRectangle({
        x: left,
        y: top - rowHeight,
        width: colWidth,
        height: rowHeight,
        borderColor: RULE_COLOR,
        borderWidth: 0.5,
        ...(row.header ? { color: rgb(0.96, 0.96, 0.97) } : {}),
      });

      let baseline = top - CELL_PAD - size;
      for (const line of cellLines[c]) {
        drawLine(layout, line, left + CELL_PAD, baseline, TEXT_COLOR);
        baseline -= lineHeight;
      }
    }

    layout.y = top - rowHeight;
  }
}

/* ────────────────────────── entry point ────────────────────────── */

export interface RenderResult {
  blob: Blob;
  pageCount: number;
  /** Images that could not be decoded (vector drawings, mostly). */
  skippedImages: number;
}

export interface RenderMeta {
  title?: string;
  creator?: string;
}

/**
 * Flow blocks onto pages and save the PDF.
 *
 * Callers own the sanitizer so they can report one dropped-character count for
 * the whole conversion; text reaching here is assumed to be already clean.
 */
export async function renderBlocksToPdf(
  blocks: Block[],
  options: DocLayoutOptions,
  meta: RenderMeta = {},
  onProgress?: (step: string, pct: number) => void,
  progressRange: [number, number] = [40, 90]
): Promise<RenderResult> {
  const doc = await PDFDocument.create();
  if (meta.title) doc.setTitle(meta.title);
  doc.setProducer("JunglePDF");
  doc.setCreator(meta.creator ?? "JunglePDF");

  const serif = options.fontFamily === "serif";
  const fonts: FontSet = {
    regular: await doc.embedFont(serif ? StandardFonts.TimesRoman : StandardFonts.Helvetica),
    bold: await doc.embedFont(serif ? StandardFonts.TimesRomanBold : StandardFonts.HelveticaBold),
    italic: await doc.embedFont(serif ? StandardFonts.TimesRomanItalic : StandardFonts.HelveticaOblique),
    boldItalic: await doc.embedFont(
      serif ? StandardFonts.TimesRomanBoldItalic : StandardFonts.HelveticaBoldOblique
    ),
    mono: await doc.embedFont(StandardFonts.Courier),
    monoBold: await doc.embedFont(StandardFonts.CourierBold),
  };

  const [shortSide, longSide] = PAGE_POINTS[options.pageSize];
  const pageWidth = options.landscape ? longSide : shortSide;
  const pageHeight = options.landscape ? shortSide : longSide;
  const layout = new Layout(doc, pageWidth, pageHeight, options.margin);

  let skippedImages = 0;
  const [from, to] = progressRange;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (i % 20 === 0) {
      onProgress?.("Laying out pages…", from + Math.round((i / blocks.length) * (to - from)));
    }

    if (block.kind === "pagebreak") {
      layout.newPage();
      continue;
    }

    if (block.kind === "heading") {
      const size = HEADING_SIZES[block.level] ?? BODY_SIZE;
      layout.space(block.level <= 2 ? 14 : 10);
      const lines = layoutLine(block.spans, fonts, size, layout.contentWidth, true);
      // Keep a heading with at least one line of what follows it.
      layout.ensure(size * LINE_FACTOR * (lines.length + 1));
      drawParagraph(layout, lines, options.margin, size, TEXT_COLOR);
      layout.space(5);
      continue;
    }

    if (block.kind === "para") {
      const x = options.margin + block.indent * INDENT_STEP;
      const width = layout.contentWidth - block.indent * INDENT_STEP;
      const color = block.quote ? QUOTE_COLOR : TEXT_COLOR;
      const spans = block.mono
        ? block.spans.map((s) => ({ ...s, mono: true }))
        : block.spans;
      const lines = layoutLine(spans, fonts, BODY_SIZE, width, false);

      if (block.marker) {
        const markerWidth = fonts.regular.widthOfTextAtSize(`${block.marker} `, BODY_SIZE);
        layout.ensure(BODY_SIZE * LINE_FACTOR);
        layout.page.drawText(block.marker, {
          x: Math.max(options.margin, x - markerWidth),
          y: layout.y - BODY_SIZE,
          size: BODY_SIZE,
          font: fonts.regular,
          color: TEXT_COLOR,
        });
      }

      drawParagraph(layout, lines, x, BODY_SIZE, color, block.quote ? RULE_COLOR : undefined);
      layout.space(block.marker ? 3 : 7);
      continue;
    }

    if (block.kind === "rule") {
      layout.space(6);
      layout.ensure(10);
      layout.page.drawLine({
        start: { x: options.margin, y: layout.y },
        end: { x: options.margin + layout.contentWidth, y: layout.y },
        thickness: 0.75,
        color: RULE_COLOR,
      });
      layout.y -= 10;
      continue;
    }

    if (block.kind === "table") {
      layout.space(6);
      drawTable(layout, block, fonts);
      layout.space(10);
      continue;
    }

    let embedded;
    try {
      embedded = await embedImage(doc, block.src);
    } catch {
      skippedImages += 1;
      continue;
    }

    const maxWidth = layout.contentWidth;
    const maxHeight = pageHeight - options.margin * 2;
    const scale = Math.min(1, maxWidth / embedded.width, maxHeight / embedded.height);
    const drawWidth = embedded.width * scale;
    const drawHeight = embedded.height * scale;

    layout.space(6);
    layout.ensure(drawHeight);
    layout.page.drawImage(embedded, {
      x: options.margin + (maxWidth - drawWidth) / 2,
      y: layout.y - drawHeight,
      width: drawWidth,
      height: drawHeight,
    });
    layout.y -= drawHeight;
    layout.space(10);
  }

  layout.finish();

  onProgress?.("Saving PDF…", to + 2);

  const bytes = await doc.save();

  return {
    blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
    pageCount: doc.getPageCount(),
    skippedImages,
  };
}

/** The caveat list every "X to PDF" tool shows. */
export function describeLosses(): string[] {
  return [
    "Fonts, colors and exact spacing are replaced by a clean, readable layout",
    "Headers, footers, page numbers and footnotes are not carried over",
    "Text boxes, shapes, charts and SmartArt are dropped",
    "Multi-column layouts and manual page breaks are re-flowed",
  ];
}

/** Assemble the standard "some things could not be converted" notice. */
export function buildNotice(skippedImages: number, droppedCharacters: number): string | null {
  const notes: string[] = [];
  if (skippedImages > 0) {
    notes.push(
      `${skippedImages} image${skippedImages === 1 ? "" : "s"} could not be included — they use a vector format a browser cannot decode.`
    );
  }
  if (droppedCharacters > 0) {
    notes.push(
      `${droppedCharacters} character${droppedCharacters === 1 ? " was" : "s were"} replaced with "?". The standard PDF fonts cover Western European text only, so scripts like Devanagari, Chinese, Japanese, Arabic or Greek cannot be drawn.`
    );
  }
  return notes.length > 0 ? notes.join(" ") : null;
}
