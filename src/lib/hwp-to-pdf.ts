/**
 * HWP to PDF — reading HWPX
 *
 * Hangul Word Processor is the standard word processor in South Korea, and its
 * files turn up constantly in Korean government, legal and academic work. There
 * are two formats behind the name, and only one of them is readable here:
 *
 *  - **.hwpx** (2010 onwards) is a zip of XML in the OWPML schema. Sections
 *    live in `Contents/section0.xml`, paragraphs are `hp:p`, runs are `hp:run`
 *    and text is `hp:t`. That is the same shape as every other Open Packaging
 *    format on this site, so it can be read with the zip library and XML parser
 *    already present.
 *  - **.hwp** (the classic binary) is a Microsoft compound-file container
 *    holding zlib-compressed records in Hancom's own undocumented-in-practice
 *    layout, with its own encryption options. That needs a dedicated parser and
 *    is rejected by name rather than failing later with a confusing zip error.
 *
 * The honest caveat that dominates this one: HWP documents are Korean, and the
 * standard PDF fonts cannot draw Hangul at all. Every Korean character becomes
 * a question mark. That makes this tool useful for a Latin-script HWPX and
 * nearly useless for a genuinely Korean one — which the UI says up front rather
 * than after a user has waited for a conversion.
 */

import type { ProgressFn } from "./ffmpeg";
import {
  buildNotice,
  createSanitizer,
  renderBlocksToPdf,
  type Block,
  type DocLayoutOptions,
  type Sanitizer,
  type Span,
} from "./pdf-layout";

export interface HwpToPdfResult {
  blob: Blob;
  filename: string;
  pageCount: number
  sectionCount: number;
  unsupportedCharacters: number;
  notice: string | null;
}

type Zip = Awaited<ReturnType<typeof loadZip>>;

async function loadZip(file: File) {
  const { default: JSZip } = await import("jszip");
  try {
    return await JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    throw new Error(
      `"${file.name}" could not be opened as an HWPX archive. If this is a classic .hwp file, open it in Hangul and save it as .hwpx first.`
    );
  }
}

async function readXml(zip: Zip, path: string): Promise<Document | null> {
  const entry = zip.file(path);
  if (!entry) return null;
  return new DOMParser().parseFromString(await entry.async("string"), "application/xml");
}

/** Section files, in order. Numbered section0.xml, section1.xml, … */
function sectionPaths(zip: Zip): string[] {
  return Object.keys(zip.files)
    .filter((name) => /(^|\/)section\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const n = (s: string) => Number(s.match(/section(\d+)\.xml$/i)?.[1] ?? 0);
      return n(a) - n(b);
    });
}

/**
 * Read a paragraph's runs.
 *
 * `hp:t` holds the text. Formatting lives in a character-property table
 * referenced by id rather than on the run itself, so bold and italic are not
 * recovered — resolving them would mean reading the header's property tables
 * for a result that is cosmetic here.
 */
function readParagraph(p: Element, sanitize: Sanitizer): Span[] {
  const spans: Span[] = [];

  for (const node of [...p.getElementsByTagName("*")]) {
    if (node.localName === "t") {
      const text = sanitize(node.textContent ?? "");
      if (text) spans.push({ text, bold: false, italic: false });
    } else if (node.localName === "lineBreak") {
      spans.push({ text: "\n", bold: false, italic: false });
    }
  }

  return spans;
}

function readSection(doc: Document, sanitize: Sanitizer, out: Block[]): void {
  for (const p of [...doc.getElementsByTagName("*")].filter((el) => el.localName === "p")) {
    // Nested paragraphs inside table cells are reached through their own
    // walk below; skip them here so their text is not emitted twice.
    if (p.closest?.("tc")) continue;

    const spans = readParagraph(p, sanitize);
    if (spans.some((s) => s.text.trim() !== "")) {
      out.push({ kind: "para", spans, indent: 0 });
    }
  }

  // Tables: hp:tbl → hp:tr → hp:tc, each cell holding paragraphs.
  for (const table of [...doc.getElementsByTagName("*")].filter((el) => el.localName === "tbl")) {
    const rows: { cells: Span[][]; header: boolean }[] = [];

    for (const tr of [...table.getElementsByTagName("*")].filter((el) => el.localName === "tr")) {
      const cells = [...tr.getElementsByTagName("*")].filter((el) => el.localName === "tc");
      if (cells.length === 0) continue;
      rows.push({
        cells: cells.map((cell) =>
          [...cell.getElementsByTagName("*")]
            .filter((el) => el.localName === "p")
            .flatMap((p) => readParagraph(p, sanitize))
        ),
        header: false,
      });
    }

    if (rows.length > 0) out.push({ kind: "table", rows });
  }
}

export function describeLosses(): string[] {
  return [
    "Paragraph text and tables come across",
    "Korean characters cannot be drawn by the standard PDF fonts",
    "Fonts, colours, headers, footers and images are not carried over",
    "Only .hwpx is readable — the classic binary .hwp is not",
  ];
}

export async function hwpToPDF(
  file: File,
  options: DocLayoutOptions,
  onProgress?: ProgressFn
): Promise<HwpToPdfResult> {
  if (/\.hwp$/i.test(file.name)) {
    throw new Error(
      "This is a classic binary .hwp file, which cannot be read in a browser — it is a compound-file container with its own compression, not a zip of XML. Open it in Hangul and save it as .hwpx, then try again."
    );
  }

  onProgress?.("Opening document…", 8);

  const zip = await loadZip(file);
  const paths = sectionPaths(zip);

  if (paths.length === 0) {
    throw new Error(
      "No document sections were found in this archive, so it is not an HWPX file. Check that it was saved as .hwpx rather than .hwp."
    );
  }

  onProgress?.("Reading structure…", 22);

  const sanitize = createSanitizer();
  const blocks: Block[] = [];

  for (let i = 0; i < paths.length; i++) {
    const doc = await readXml(zip, paths[i]);
    if (!doc) continue;
    // Sections are the format's page-break unit.
    if (blocks.length > 0) blocks.push({ kind: "pagebreak" });
    readSection(doc, sanitize, blocks);
  }

  if (blocks.length === 0) {
    throw new Error("This document appears to be empty — no text was found in it.");
  }

  onProgress?.("Laying out pages…", 40);

  const rendered = await renderBlocksToPdf(
    blocks,
    options,
    { title: file.name.replace(/\.hwpx?$/i, ""), creator: "JunglePDF HWP to PDF" },
    onProgress
  );

  onProgress?.("Done", 100);

  const notes: string[] = [];
  const base = buildNotice(0, sanitize.dropped);
  if (base) notes.push(base);
  if (sanitize.dropped > 20) {
    notes.push(
      "Most of this document was Hangul, which the standard PDF fonts cannot draw — the output will be largely question marks. Hangul in a PDF needs an embedded Korean font, which is several megabytes and is not shipped here."
    );
  }

  return {
    blob: rendered.blob,
    filename: file.name.replace(/\.hwpx?$/i, "") + ".pdf",
    pageCount: rendered.pageCount,
    sectionCount: paths.length,
    unsupportedCharacters: sanitize.dropped,
    notice: notes.length > 0 ? notes.join(" ") : null,
  };
}
