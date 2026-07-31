/**
 * Plain text and RTF → PDF.
 *
 * Two readers over one engine:
 *
 *  - **.txt** needs almost nothing: blank lines separate paragraphs, and a
 *    "keep line breaks" mode exists because the format is used for both prose
 *    and things where every line matters (logs, code, addresses, poetry).
 *  - **.rtf** is a plain-text control language, not a binary container, so it
 *    can be read here without a dependency. The parser below is deliberately
 *    partial: it handles groups, escapes, unicode runs, the destinations worth
 *    skipping, and bold/italic — which covers documents people actually have.
 *    It does not attempt tables or embedded objects.
 */

import type { ProgressFn } from "./ffmpeg";
import {
  buildNotice,
  createSanitizer,
  plain,
  renderBlocksToPdf,
  type Block,
  type DocLayoutOptions,
  type Sanitizer,
  type Span,
} from "./pdf-layout";

export interface TextToPdfResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  unsupportedCharacters: number;
  notice: string | null;
}

export type LineMode = "paragraphs" | "preserve";

export const LINE_MODE_LABELS: Record<LineMode, string> = {
  paragraphs: "Join wrapped lines",
  preserve: "Keep every line break",
};

/* ────────────────────────── plain text ────────────────────────── */

const BULLET = /^\s*([-*•·]|\d{1,3}[.)])\s+/;

/**
 * Turn plain text into blocks.
 *
 * `paragraphs` treats a blank line as the paragraph boundary and joins the
 * lines between, which is what a text file exported from a word processor
 * wants. `preserve` emits one paragraph per line, which is what a log file,
 * a poem or a list of addresses wants.
 */
export function textToBlocks(text: string, mode: LineMode, sanitize: Sanitizer): Block[] {
  const blocks: Block[] = [];
  // Normalise Windows and old Mac line endings; a stray \r draws as a box.
  const normalised = text.replace(/\r\n?/g, "\n").replace(/\t/g, "    ");

  if (mode === "preserve") {
    for (const line of normalised.split("\n")) {
      const clean = sanitize(line);
      if (clean.trim() === "") {
        blocks.push({ kind: "para", spans: plain(" "), indent: 0 });
        continue;
      }
      blocks.push({ kind: "para", spans: plain(clean), indent: 0 });
    }
    return blocks;
  }

  for (const chunk of normalised.split(/\n\s*\n/)) {
    const lines = chunk.split("\n").filter((l) => l.trim() !== "");
    if (lines.length === 0) continue;

    // A run of bullet-looking lines stays one-per-line — joining them would
    // turn a list into a single unreadable paragraph.
    if (lines.every((l) => BULLET.test(l))) {
      for (const line of lines) {
        const marker = line.match(BULLET)![1];
        blocks.push({
          kind: "para",
          spans: plain(sanitize(line.replace(BULLET, ""))),
          indent: 1,
          marker: /\d/.test(marker) ? marker : "•",
        });
      }
      continue;
    }

    blocks.push({ kind: "para", spans: plain(sanitize(lines.join(" "))), indent: 0 });
  }

  return blocks;
}

/* ────────────────────────── RTF ────────────────────────── */

/** Control words whose entire group is metadata, not document text. */
const SKIP_DESTINATIONS = new Set([
  "fonttbl", "colortbl", "stylesheet", "info", "pict", "object", "themedata",
  "colorschememapping", "latentstyles", "datastore", "generator", "listtable",
  "listoverridetable", "rsidtbl", "xmlnstbl", "filetbl", "header", "footer",
  "headerl", "headerr", "footerl", "footerr", "footnote", "fldinst",
]);

/**
 * Read RTF into blocks.
 *
 * RTF is a stream of `{groups}` and `\controlWords`. The parser tracks a stack
 * of formatting states, drops the groups listed above wholesale, and turns
 * `\par` into a paragraph break. Anything it does not recognise is ignored,
 * which is the format's own extension rule — readers are expected to skip
 * control words they do not know.
 */
export function rtfToBlocks(rtf: string, sanitize: Sanitizer): Block[] {
  interface State {
    bold: boolean;
    italic: boolean;
    /** Depth at which a skipped destination started, or null. */
    skipping: boolean;
  }

  const stack: State[] = [{ bold: false, italic: false, skipping: false }];
  const blocks: Block[] = [];
  let spans: Span[] = [];
  let buffer = "";

  const state = () => stack[stack.length - 1];

  const flushRun = () => {
    if (buffer === "") return;
    const text = sanitize(buffer);
    if (text) spans.push({ text, bold: state().bold, italic: state().italic });
    buffer = "";
  };

  const flushPara = () => {
    flushRun();
    if (spans.some((s) => s.text.trim() !== "")) {
      blocks.push({ kind: "para", spans, indent: 0 });
    }
    spans = [];
  };

  for (let i = 0; i < rtf.length; i++) {
    const char = rtf[i];

    if (char === "{") {
      flushRun();
      stack.push({ ...state() });
      continue;
    }

    if (char === "}") {
      flushRun();
      if (stack.length > 1) stack.pop();
      continue;
    }

    if (char === "\\") {
      const next = rtf[i + 1];

      // Escaped literal, or an escaped newline meaning a paragraph break.
      if (next === "\\" || next === "{" || next === "}") {
        if (!state().skipping) buffer += next;
        i += 1;
        continue;
      }
      if (next === "\n" || next === "\r") {
        flushPara();
        i += 1;
        continue;
      }
      // \'xx — a byte in the current code page. Treated as cp1252, which is
      // what the overwhelming majority of RTF in the wild uses.
      if (next === "'") {
        const hex = rtf.slice(i + 2, i + 4);
        if (!state().skipping) buffer += String.fromCharCode(parseInt(hex, 16) || 0);
        i += 3;
        continue;
      }

      const match = /^([a-zA-Z]+)(-?\d+)? ?/.exec(rtf.slice(i + 1));
      if (!match) {
        i += 1;
        continue;
      }

      const word = match[1];
      const param = match[2] ? parseInt(match[2], 10) : null;
      i += match[0].length;

      if (SKIP_DESTINATIONS.has(word)) {
        state().skipping = true;
        continue;
      }

      if (state().skipping) continue;

      switch (word) {
        case "par":
        case "sect":
          flushPara();
          break;
        case "line":
          flushRun();
          spans.push({ text: "\n", bold: false, italic: false });
          break;
        case "page":
          flushPara();
          blocks.push({ kind: "pagebreak" });
          break;
        case "tab":
          buffer += "    ";
          break;
        case "b":
          flushRun();
          state().bold = param !== 0;
          break;
        case "i":
          flushRun();
          state().italic = param !== 0;
          break;
        case "plain":
          flushRun();
          state().bold = false;
          state().italic = false;
          break;
        case "u": {
          // \uN is followed by a replacement character for readers that cannot
          // handle Unicode — "舒 ?" or "舒?" — and it must be swallowed
          // or every non-ASCII character leaves a "?" behind. Word emits these
          // constantly, so this is not an edge case.
          //
          // The lookahead is at i + 1, not i: the loop's own increment has not
          // happened yet, so i still sits on the last character consumed by the
          // control word.
          if (param !== null) buffer += String.fromCharCode(param < 0 ? param + 65536 : param);
          if (rtf[i + 1] === "?") i += 1;
          break;
        }
        default:
          break;
      }
      continue;
    }

    if (char === "\n" || char === "\r") continue;
    if (!state().skipping) buffer += char;
  }

  flushPara();
  return blocks;
}

/* ────────────────────────── entry points ────────────────────────── */

async function finish(
  blocks: Block[],
  file: File,
  extension: RegExp,
  options: DocLayoutOptions,
  sanitize: Sanitizer,
  creator: string,
  onProgress?: ProgressFn
): Promise<TextToPdfResult> {
  if (blocks.length === 0) {
    throw new Error("This file appears to be empty — there was no text to convert.");
  }

  const rendered = await renderBlocksToPdf(
    blocks,
    options,
    { title: file.name.replace(extension, ""), creator },
    onProgress
  );

  onProgress?.("Done", 100);

  return {
    blob: rendered.blob,
    filename: file.name.replace(extension, "") + ".pdf",
    pageCount: rendered.pageCount,
    unsupportedCharacters: sanitize.dropped,
    notice: buildNotice(0, sanitize.dropped),
  };
}

export async function txtToPDF(
  file: File,
  options: DocLayoutOptions & { lineMode?: LineMode },
  onProgress?: ProgressFn
): Promise<TextToPdfResult> {
  onProgress?.("Reading file…", 10);
  const sanitize = createSanitizer();
  const blocks = textToBlocks(await file.text(), options.lineMode ?? "paragraphs", sanitize);
  onProgress?.("Laying out pages…", 40);
  return finish(blocks, file, /\.(txt|text|log|md|csv)$/i, options, sanitize, "JunglePDF TXT to PDF", onProgress);
}

export async function rtfToPDF(
  file: File,
  options: DocLayoutOptions,
  onProgress?: ProgressFn
): Promise<TextToPdfResult> {
  onProgress?.("Reading file…", 10);

  const text = await file.text();
  if (!text.trimStart().startsWith("{\\rtf")) {
    throw new Error(
      "This does not look like an RTF file — it is missing the RTF header. If it came from Word, save it again as Rich Text Format."
    );
  }

  const sanitize = createSanitizer();
  const blocks = rtfToBlocks(text, sanitize);
  onProgress?.("Laying out pages…", 40);
  return finish(blocks, file, /\.rtf$/i, options, sanitize, "JunglePDF RTF to PDF", onProgress);
}
