/**
 * HTML → layout blocks.
 *
 * The common middle step for every converter whose source format is, or can be
 * reduced to, markup: Word (mammoth emits HTML), HTML files themselves, EPUB
 * (a zip of XHTML) and ODT (whose content.xml maps cleanly onto the same
 * shapes). Each of those has its own reader; they all end up here, and the
 * blocks then go to `pdf-layout.ts`.
 *
 * Parsing uses DOMParser rather than a regex or a bundled HTML parser — the
 * browser already ships a spec-compliant one that handles unclosed tags and
 * malformed nesting far better than anything worth writing.
 */

import type { Block, Sanitizer, Span } from "./pdf-layout";

const HEADINGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);
const BLOCK_CHILDREN = ["UL", "OL", "TABLE", "BLOCKQUOTE", "PRE"];
const MONO_TAGS = new Set(["CODE", "PRE", "KBD", "SAMP", "TT"]);

interface InlineStyle {
  bold: boolean;
  italic: boolean;
  mono: boolean;
  href?: string;
}

function collectInline(node: Node, style: InlineStyle, sanitize: Sanitizer, out: Span[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    // Collapse whitespace the way an HTML renderer would. Source markup is
    // full of newlines and indentation that are not part of the text.
    const text = sanitize((node.textContent ?? "").replace(/\s+/g, " "));
    if (text) out.push({ text, bold: style.bold, italic: style.italic, mono: style.mono, href: style.href });
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const el = node as Element;
  const tag = el.tagName.toUpperCase();

  if (tag === "BR") {
    out.push({ text: "\n", bold: false, italic: false });
    return;
  }
  // Images are block-level here; the caller lifts them out of the paragraph.
  if (tag === "IMG") return;
  // Never typeset the contents of these.
  if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return;

  const next: InlineStyle = {
    bold: style.bold || tag === "STRONG" || tag === "B" || tag === "TH",
    italic: style.italic || tag === "EM" || tag === "I",
    mono: style.mono || MONO_TAGS.has(tag),
    href: style.href ?? (tag === "A" ? el.getAttribute("href") ?? undefined : undefined),
  };

  el.childNodes.forEach((child) => collectInline(child, next, sanitize, out));
}

export function inlineSpans(el: Element, sanitize: Sanitizer): Span[] {
  const spans: Span[] = [];
  collectInline(el, { bold: false, italic: false, mono: false }, sanitize, spans);
  return spans;
}

function hasText(spans: Span[]): boolean {
  return spans.some((s) => s.text.trim().length > 0);
}

/** Images arrive inside paragraphs; pull them out as their own blocks. */
function imageBlocks(el: Element): Block[] {
  return [...el.querySelectorAll("img")]
    .map((img) => img.getAttribute("src"))
    .filter((src): src is string => Boolean(src) && !src!.startsWith("blob:"))
    .map((src) => ({ kind: "image", src }) as Block);
}

/** collectBlocks walks children, so a bare element needs a parent to sit in. */
function wrap(el: Element): Element {
  const holder = el.ownerDocument.createElement("div");
  holder.appendChild(el.cloneNode(true));
  return holder;
}

function collectBlocks(parent: Element, indent: number, sanitize: Sanitizer, out: Block[]): void {
  for (const child of [...parent.children]) {
    const tag = child.tagName.toUpperCase();

    if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "HEAD") continue;

    if (HEADINGS.has(tag)) {
      const spans = inlineSpans(child, sanitize);
      if (hasText(spans)) out.push({ kind: "heading", level: Number(tag[1]), spans });
      out.push(...imageBlocks(child));
      continue;
    }

    if (tag === "P" || tag === "DT" || tag === "DD" || tag === "FIGCAPTION") {
      const spans = inlineSpans(child, sanitize);
      if (hasText(spans)) {
        out.push({ kind: "para", spans, indent: tag === "DD" ? indent + 1 : indent });
      }
      out.push(...imageBlocks(child));
      continue;
    }

    if (tag === "PRE") {
      // Preformatted text keeps its own line breaks, so it is emitted one
      // paragraph per line rather than run through whitespace collapsing.
      //
      // Split before sanitizing, not after: a newline is not encodable in
      // WinAnsi, so sanitizing the whole block first turns every line break
      // into a literal "?" and leaves nothing to split on.
      const text = (child.textContent ?? "").replace(/\r\n?/g, "\n");
      for (const line of text.split("\n")) {
        out.push({
          kind: "para",
          spans: [{ text: sanitize(line) || " ", bold: false, italic: false, mono: true }],
          indent: indent + 1,
          mono: true,
        });
      }
      continue;
    }

    if (tag === "UL" || tag === "OL") {
      const ordered = tag === "OL";
      let index = Number(child.getAttribute("start") ?? 1);

      for (const li of [...child.children]) {
        if (li.tagName.toUpperCase() !== "LI") continue;

        const nested = [...li.children].filter((n) =>
          BLOCK_CHILDREN.includes(n.tagName.toUpperCase())
        );

        const clone = li.cloneNode(true) as Element;
        clone.querySelectorAll(BLOCK_CHILDREN.join(",")).forEach((n) => n.remove());

        const spans = inlineSpans(clone, sanitize);
        if (hasText(spans)) {
          out.push({
            kind: "para",
            spans,
            indent: indent + 1,
            marker: ordered ? `${index}.` : "•",
          });
          index += 1;
        }
        out.push(...imageBlocks(clone));

        for (const block of nested) collectBlocks(wrap(block), indent + 1, sanitize, out);
      }
      continue;
    }

    if (tag === "BLOCKQUOTE") {
      const before = out.length;
      collectBlocks(child, indent + 1, sanitize, out);
      for (let i = before; i < out.length; i++) {
        const block = out[i];
        if (block.kind === "para") block.quote = true;
      }
      continue;
    }

    if (tag === "TABLE") {
      const rows: { cells: Span[][]; header: boolean }[] = [];
      for (const tr of [...child.querySelectorAll("tr")]) {
        const cellEls = [...tr.children].filter((c) =>
          ["TD", "TH"].includes(c.tagName.toUpperCase())
        );
        if (cellEls.length === 0) continue;
        rows.push({
          cells: cellEls.map((cell) => inlineSpans(cell, sanitize)),
          header: cellEls.every((c) => c.tagName.toUpperCase() === "TH"),
        });
      }
      if (rows.length > 0) out.push({ kind: "table", rows });
      continue;
    }

    if (tag === "HR") {
      out.push({ kind: "rule" });
      continue;
    }

    if (tag === "IMG") {
      const src = child.getAttribute("src");
      if (src) out.push({ kind: "image", src });
      continue;
    }

    // Containers (div, section, article, figure, body…) are walked through;
    // one holding only inline content is treated as a paragraph.
    if (child.children.length === 0) {
      const spans = inlineSpans(child, sanitize);
      if (hasText(spans)) out.push({ kind: "para", spans, indent });
    } else {
      collectBlocks(child, indent, sanitize, out);
    }
  }
}

/** Parse an HTML string into layout blocks. */
export function htmlToBlocks(html: string, sanitize: Sanitizer): Block[] {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const blocks: Block[] = [];
  collectBlocks(parsed.body, 0, sanitize, blocks);
  return blocks;
}

/** Parse an XML/XHTML document (EPUB chapters, ODT content) into blocks. */
export function documentToBlocks(doc: Document, root: Element, sanitize: Sanitizer): Block[] {
  void doc;
  const blocks: Block[] = [];
  collectBlocks(root, 0, sanitize, blocks);
  return blocks;
}
