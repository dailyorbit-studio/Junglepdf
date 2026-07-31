/**
 * Markdown → PDF.
 *
 * A block-level Markdown parser feeding the same `Block[]` pipeline that Word,
 * HTML, TXT and RTF already use, so headings, lists, tables and code all lay
 * out exactly as they do everywhere else. Nothing here draws anything — that
 * is `renderBlocksToPdf`'s job.
 *
 * CommonMark is a large specification and this is not all of it. What is
 * supported is what people actually write: ATX headings, setext H1/H2, fenced
 * and indented code, blockquotes, ordered and unordered lists (nested), tables,
 * thematic breaks, and inline emphasis, code, links and images. What is not:
 * reference-style links, footnotes, HTML blocks, and loose/tight list
 * distinctions. `describeMarkdownLimits()` is the single source of that list so
 * the page copy cannot drift from the parser.
 */

import {
  renderBlocksToPdf,
  createSanitizer,
  buildNotice,
  type Block,
  type Span,
  type DocLayoutOptions,
  type Sanitizer,
} from "./pdf-layout";
import type { ProgressFn } from "./ffmpeg";

export interface MarkdownToPdfResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  unsupportedCharacters: number;
  notice: string | null;
}

/* ─────────────────────────── inline ─────────────────────────── */

/**
 * Inline emphasis, code, links and images.
 *
 * Hand-rolled rather than regex-replaced because the markers nest: `**bold
 * with _italic_ inside**` has to produce one bold run containing a
 * bold-italic run, and a chain of replacements produces literal asterisks
 * somewhere in the middle every time.
 */
function inlineSpans(text: string, sanitize: Sanitizer): Span[] {
  const spans: Span[] = [];
  let buffer = "";
  let bold = false;
  let italic = false;

  const flush = () => {
    if (!buffer) return;
    spans.push({ text: sanitize(buffer), bold, italic });
    buffer = "";
  };

  for (let i = 0; i < text.length; i++) {
    const rest = text.slice(i);

    // Escapes come first, or "\*" would open emphasis.
    if (text[i] === "\\" && i + 1 < text.length) {
      buffer += text[i + 1];
      i++;
      continue;
    }

    // Inline code wins over emphasis: `a_b_c` is literal inside backticks.
    const code = rest.match(/^`([^`]+)`/);
    if (code) {
      flush();
      spans.push({ text: sanitize(code[1]), bold, italic, mono: true });
      i += code[0].length - 1;
      continue;
    }

    // Images before links — the syntax differs only by the leading "!", and
    // there is nowhere in a text run to put a picture, so the alt text stands
    // in for it.
    const image = rest.match(/^!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/);
    if (image) {
      flush();
      const alt = image[1].trim();
      spans.push({ text: sanitize(alt ? `[image: ${alt}]` : "[image]"), bold, italic: true });
      i += image[0].length - 1;
      continue;
    }

    const link = rest.match(/^\[([^\]]+)\]\(([^)\s]+)[^)]*\)/);
    if (link) {
      flush();
      spans.push({ text: sanitize(link[1]), bold, italic, href: link[2] });
      i += link[0].length - 1;
      continue;
    }

    // Bare autolinks: <https://example.com>
    const autolink = rest.match(/^<((?:https?|mailto):[^>\s]+)>/);
    if (autolink) {
      flush();
      spans.push({ text: sanitize(autolink[1]), bold, italic, href: autolink[1] });
      i += autolink[0].length - 1;
      continue;
    }

    if (rest.startsWith("**") || rest.startsWith("__")) {
      flush();
      bold = !bold;
      i++;
      continue;
    }

    // Single marker: only emphasis when it is not mid-word, so snake_case
    // identifiers and file_name_like_this survive intact.
    if ((text[i] === "*" || text[i] === "_") && !/\w/.test(text[i - 1] ?? "")) {
      flush();
      italic = !italic;
      continue;
    }
    if ((text[i] === "*" || text[i] === "_") && italic) {
      flush();
      italic = false;
      continue;
    }

    buffer += text[i];
  }

  flush();
  return spans.length > 0 ? spans : [{ text: "", bold: false, italic: false }];
}

/* ─────────────────────────── blocks ─────────────────────────── */

const ORDERED = /^(\s*)(\d+)[.)]\s+(.*)$/;
const BULLET = /^(\s*)[-*+]\s+(.*)$/;

/** A table separator row: |---|:--:|---:| */
const TABLE_RULE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

const splitTableRow = (line: string): string[] =>
  line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((cell) => cell.trim());

export function markdownToBlocks(markdown: string, sanitize: Sanitizer): Block[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({
      kind: "para",
      spans: inlineSpans(paragraph.join(" ").trim(), sanitize),
      indent: 0,
    });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced code — everything until the closing fence is literal, including
    // characters that would otherwise be Markdown.
    const fence = line.match(/^\s*(```|~~~)(.*)$/);
    if (fence) {
      flushParagraph();
      const marker = fence[1];
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith(marker)) {
        body.push(lines[i]);
        i++;
      }
      for (const codeLine of body) {
        blocks.push({
          kind: "para",
          spans: [{ text: sanitize(codeLine), bold: false, italic: false, mono: true }],
          indent: 0,
          mono: true,
        });
      }
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      continue;
    }

    // Thematic break, before the bullet rule — "---" matches neither list nor
    // setext heading when the previous line is blank.
    if (/^\s*([-*_])\s*(\1\s*){2,}$/.test(line)) {
      flushParagraph();
      blocks.push({ kind: "rule" });
      continue;
    }

    const atx = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (atx) {
      flushParagraph();
      blocks.push({
        kind: "heading",
        level: atx[1].length,
        spans: inlineSpans(atx[2], sanitize),
      });
      continue;
    }

    // Setext: the underline decides, so it can only be recognised one line late.
    const next = lines[i + 1];
    if (next && paragraph.length === 0 && /^\s*=+\s*$/.test(next) && line.trim()) {
      blocks.push({ kind: "heading", level: 1, spans: inlineSpans(line.trim(), sanitize) });
      i++;
      continue;
    }
    if (next && paragraph.length === 0 && /^\s*-{2,}\s*$/.test(next) && line.trim()) {
      blocks.push({ kind: "heading", level: 2, spans: inlineSpans(line.trim(), sanitize) });
      i++;
      continue;
    }

    // Table: a header row followed by a separator row.
    if (line.includes("|") && next && TABLE_RULE.test(next)) {
      flushParagraph();
      const header = splitTableRow(line);
      const rows: { cells: Span[][]; header: boolean }[] = [
        { cells: header.map((cell) => inlineSpans(cell, sanitize)), header: true },
      ];
      i += 2;
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        const cells = splitTableRow(lines[i]);
        // Pad or trim to the header width, so a ragged table still renders.
        const normalized = Array.from({ length: header.length }, (_, c) => cells[c] ?? "");
        rows.push({ cells: normalized.map((cell) => inlineSpans(cell, sanitize)), header: false });
        i++;
      }
      i--;
      blocks.push({ kind: "table", rows });
      continue;
    }

    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      blocks.push({
        kind: "para",
        spans: inlineSpans(quote[1], sanitize),
        indent: 0,
        quote: true,
      });
      continue;
    }

    const ordered = line.match(ORDERED);
    if (ordered) {
      flushParagraph();
      blocks.push({
        kind: "para",
        spans: inlineSpans(ordered[3], sanitize),
        // Two spaces per nesting level is the common convention; four also
        // reads as one level here rather than as code.
        indent: Math.floor(ordered[1].length / 2),
        marker: `${ordered[2]}.`,
      });
      continue;
    }

    const bullet = line.match(BULLET);
    if (bullet) {
      flushParagraph();
      // Task list checkboxes render as a symbol rather than raw brackets.
      const text = bullet[2].replace(/^\[([ xX])\]\s*/, (_, mark) =>
        mark === " " ? "☐ " : "☑ "
      );
      blocks.push({
        kind: "para",
        spans: inlineSpans(text, sanitize),
        indent: Math.floor(bullet[1].length / 2),
        marker: "•",
      });
      continue;
    }

    // Indented code, but only outside a paragraph — four leading spaces in the
    // middle of prose is a continuation line, not a code block.
    if (/^ {4,}\S/.test(line) && paragraph.length === 0) {
      blocks.push({
        kind: "para",
        spans: [{ text: sanitize(line.replace(/^ {4}/, "")), bold: false, italic: false, mono: true }],
        indent: 0,
        mono: true,
      });
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  return blocks;
}

export async function markdownToPDF(
  file: File,
  options: DocLayoutOptions,
  onProgress?: ProgressFn
): Promise<MarkdownToPdfResult> {
  onProgress?.("Reading Markdown…", 10);

  const sanitize = createSanitizer();
  const blocks = markdownToBlocks(await file.text(), sanitize);

  if (blocks.length === 0) {
    throw new Error("This file appears to be empty — there was no text to convert.");
  }

  onProgress?.("Laying out…", 35);

  const rendered = await renderBlocksToPdf(
    blocks,
    options,
    {
      title: file.name.replace(/\.(md|markdown|mdown|mkd)$/i, ""),
      creator: "JunglePDF Markdown to PDF",
    },
    onProgress
  );

  onProgress?.("Done", 100);

  return {
    blob: rendered.blob,
    filename: file.name.replace(/\.(md|markdown|mdown|mkd)$/i, "") + ".pdf",
    pageCount: rendered.pageCount,
    unsupportedCharacters: sanitize.dropped,
    notice: buildNotice(0, sanitize.dropped),
  };
}

/** What the parser handles, and what it does not. Used by the page copy. */
export function describeMarkdownLimits(): string[] {
  return [
    "Headings, bold, italic, inline code, links, blockquotes, horizontal rules, task lists and nested lists all convert.",
    "Tables convert, using the header row for column titles.",
    "Fenced and indented code blocks keep their line breaks and render in a monospace face.",
    "Images are replaced by their alt text in brackets — a linked image would have to be fetched from the network, and nothing here does that.",
    "Reference-style links, footnotes and raw HTML blocks are not supported.",
  ];
}
