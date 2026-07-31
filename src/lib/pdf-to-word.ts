/**
 * PDF to Word — pdf.js text layer → a hand-written .docx
 *
 * Two halves, in order:
 *
 *  1. Read the PDF's text layer with pdf.js and rebuild a *document* from it —
 *     lines from positioned glyph runs, paragraphs from lines, headings from
 *     relative font size, lists from their markers, and running headers and
 *     footers from what repeats on every page.
 *  2. Write that document out as OOXML and zip it into a .docx.
 *
 * The zip is assembled by hand rather than through a Word-writing library. A
 * .docx is a handful of small XML parts, JSZip is already a dependency, and the
 * alternative is several hundred kilobytes of library to emit markup this file
 * emits in a page. `word-to-pdf.ts` is the inverse direction and shares none of
 * this — mammoth reads .docx, it does not write it.
 *
 * The honest limits, all surfaced in the UI:
 *
 *  - **This is not OCR.** A scanned PDF is a picture of a page with no text in
 *    it. Detected and reported rather than returned as a blank document.
 *  - **The result is a re-flow, not a facsimile.** A PDF stores glyphs at
 *    coordinates; it does not record which of them are paragraphs, which are a
 *    table, or which column comes first. Everything below is inference, and it
 *    is right on ordinary prose and progressively less right as the layout gets
 *    more elaborate. Tables in particular come out as text, not as tables.
 */

import { openForRender } from "./pdf-render";
import type { ProgressFn } from "./ffmpeg";

export type WordLayout = "flowing" | "lines";

export const LAYOUT_LABELS: Record<WordLayout, string> = {
  flowing: "Rejoin wrapped lines",
  lines: "One paragraph per line",
};

export interface PdfToWordOptions {
  /**
   * `flowing` merges the lines of a wrapped paragraph back together, which is
   * what you want for prose you intend to edit. `lines` keeps every line as its
   * own paragraph, which is safer for poetry, addresses, code and forms.
   */
  layout: WordLayout;
  /** Insert a Word page break where each PDF page ended. */
  keepPageBreaks: boolean;
  /** Drop the lines that repeat at the top or bottom of every page. */
  stripRunningHeads: boolean;
}

export interface PdfToWordResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  paragraphCount: number;
  characterCount: number;
  /** Header/footer lines removed, so the count can be reported. */
  removedRunningHeads: number;
  notice: string | null;
}

/* ────────────────────────── reading the page ────────────────────────── */

interface RawLine {
  text: string;
  /** Baseline, in PDF user space — larger is higher up the page. */
  y: number;
  /** Left edge and right edge of the drawn text. */
  x0: number;
  x1: number;
  size: number;
  bold: boolean;
}

interface TextItemLike {
  str?: string;
  transform?: number[];
  width?: number;
  height?: number;
  fontName?: string;
  hasEOL?: boolean;
}

interface FontObject {
  bold?: boolean;
  black?: boolean;
  name?: string;
  fallbackName?: string;
}

interface PageLike {
  commonObjs?: { has(id: string): boolean; get(id: string): unknown };
}

/**
 * Whether a pdf.js font id refers to a bold face.
 *
 * `getTextContent` is no help here: it reports the font as an opaque id like
 * `g_d0_f1`, and its `styles` entry only says "sans-serif". The weight lives on
 * the font object in `commonObjs`, which the worker populates while building a
 * page's operator list — so the caller runs `getOperatorList()` first. That
 * costs about 1% on top of the text parse, because both do the same content
 * parsing and only the operator list keeps the result.
 *
 * A miss simply means the run is not marked bold, which is what the whole
 * document would look like without this.
 */
function boldLookup(page: PageLike): (fontName: string | undefined) => boolean {
  const cache = new Map<string, boolean>();

  return (fontName) => {
    if (!fontName) return false;
    const hit = cache.get(fontName);
    if (hit !== undefined) return hit;

    let bold = false;
    try {
      if (page.commonObjs?.has(fontName)) {
        const font = page.commonObjs.get(fontName) as FontObject;
        bold =
          font?.bold === true ||
          font?.black === true ||
          /bold|black|heavy|semib|demi/i.test(font?.name ?? "") ||
          /bold|black|heavy|semib|demi/i.test(font?.fallbackName ?? "");
      }
    } catch {
      // commonObjs throws rather than returning when an id has not resolved.
    }

    cache.set(fontName, bold);
    return bold;
  };
}

/**
 * Group positioned glyph runs into lines.
 *
 * A justified line arrives as many separate items because the renderer nudged
 * the spacing between words, so items are merged while they share a baseline.
 * The gap between one item's right edge and the next item's left edge decides
 * whether a space is needed — PDF frequently omits the space character itself
 * and simply moves the cursor.
 */
function assembleLines(items: TextItemLike[], isBold: (f?: string) => boolean): RawLine[] {
  const lines: RawLine[] = [];
  let current: RawLine | null = null;

  for (const item of items) {
    const str = item.str;
    if (typeof str !== "string" || str === "") continue;

    const transform = item.transform ?? [1, 0, 0, 1, 0, 0];
    const x = transform[4];
    const y = transform[5];
    const size = Math.hypot(transform[2], transform[3]) || item.height || 10;
    const width = item.width ?? 0;
    const bold = isBold(item.fontName);

    if (str.trim() === "" && !item.hasEOL) {
      // A whitespace-only run still moves the cursor; keep the advance so the
      // gap test below stays meaningful, but do not start a line with it.
      if (current) {
        current.text += " ";
        current.x1 = x + width;
      }
      continue;
    }

    const sameLine =
      current !== null &&
      Math.abs(current.y - y) <= Math.max(1.5, size * 0.35) &&
      x >= current.x0 - size;

    if (!sameLine) {
      if (current) lines.push(current);
      current = { text: str, y, x0: x, x1: x + width, size, bold };
    } else {
      const gap = x - current!.x1;
      const needsSpace = gap > size * 0.18 && !/\s$/.test(current!.text) && !/^\s/.test(str);
      current!.text += (needsSpace ? " " : "") + str;
      current!.x1 = x + width;
      current!.size = Math.max(current!.size, size);
      // A line counts as bold only if all of it is — a bold lead-in inside a
      // sentence should not turn the whole paragraph into a heading.
      current!.bold = current!.bold && bold;
    }

    if (item.hasEOL && current) {
      lines.push(current);
      current = null;
    }
  }

  if (current) lines.push(current);

  return lines
    .map((line) => ({ ...line, text: line.text.replace(/\s+/g, " ").trim() }))
    .filter((line) => line.text !== "");
}

/* ────────────────────────── running heads ────────────────────────── */

/** Page numbers change every page; compare with digits masked out. */
function fingerprint(text: string): string {
  return text.replace(/\d+/g, "#").toLowerCase().trim();
}

/** The strip at the top and bottom of a page where furniture is allowed to be. */
const MARGIN_ZONE = 0.08;

/**
 * Whether a line is a candidate for being page furniture.
 *
 * Two conditions, and the size one matters as much as the position. A heading
 * like "Section 3" can sit high enough on the page to fall inside the margin
 * zone, and with its digits masked it looks identical on every page — exactly
 * the shape of a running head. Real headers and footers are set *smaller* than
 * body text, so anything at body size or above is left alone.
 */
function inFurnitureZone(line: RawLine, pageHeight: number, bodySize: number): boolean {
  const zone = pageHeight * MARGIN_ZONE;
  const nearEdge = line.y > pageHeight - zone || line.y < zone;
  return nearEdge && line.size <= bodySize * 1.05;
}

/**
 * Find the header and footer lines that repeat across the document.
 *
 * A line has to appear on more than half the pages before it is treated as
 * furniture. Below three pages the test is not meaningful and nothing is
 * removed.
 */
function findRunningHeads(
  pages: { lines: RawLine[]; height: number }[],
  bodySize: number
): Set<string> {
  if (pages.length < 3) return new Set();

  const counts = new Map<string, number>();

  for (const page of pages) {
    const seen = new Set<string>();

    for (const line of page.lines) {
      if (!inFurnitureZone(line, page.height, bodySize)) continue;

      const key = fingerprint(line.text);
      if (key.length === 0 || seen.has(key)) continue;
      seen.add(key);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const threshold = Math.max(3, Math.ceil(pages.length * 0.6));
  return new Set(
    [...counts.entries()].filter(([, n]) => n >= threshold).map(([key]) => key)
  );
}

/* ────────────────────────── lines → paragraphs ────────────────────────── */

type ParaStyle = "Normal" | "Heading1" | "Heading2" | "Heading3";

interface Paragraph {
  text: string;
  style: ParaStyle;
  bold: boolean;
  /** Point size, carried through so the .docx resembles the original. */
  size: number;
  /** Set on list items; `ordered` picks bullets or numbers. */
  list?: { ordered: boolean; start: number; group: number };
  pageBreakBefore?: boolean;
}

const LIST_MARKER = /^([•▪◦‣·∙*o]|[-–—])\s+|^(\(?\d{1,3}[.)])\s+|^(\(?[a-zA-Z][.)])\s+/;

/** The size most of the document is set in, weighted by how much text uses it. */
function bodyTextSize(lines: RawLine[]): number {
  const weights = new Map<number, number>();
  for (const line of lines) {
    const key = Math.round(line.size * 2) / 2;
    weights.set(key, (weights.get(key) ?? 0) + line.text.length);
  }
  let best = 11;
  let bestWeight = -1;
  for (const [size, weight] of weights) {
    if (weight > bestWeight) {
      best = size;
      bestWeight = weight;
    }
  }
  return best || 11;
}

function headingStyle(size: number, body: number, bold: boolean): ParaStyle {
  const ratio = size / body;
  if (ratio >= 1.6) return "Heading1";
  if (ratio >= 1.3) return "Heading2";
  if (ratio >= 1.12) return "Heading3";
  // Same size as the body but entirely bold and short reads as a heading too —
  // which is how most Word documents that never used a heading style look.
  if (bold && ratio >= 0.98) return "Heading3";
  return "Normal";
}

interface BuildInput {
  pages: { lines: RawLine[]; width: number; height: number }[];
  options: PdfToWordOptions;
  drop: Set<string>;
}

function buildParagraphs({ pages, options, drop }: BuildInput): {
  paragraphs: Paragraph[];
  removed: number;
} {
  const body = bodyTextSize(pages.flatMap((p) => p.lines));
  const paragraphs: Paragraph[] = [];
  let removed = 0;
  let listGroup = 0;
  let pendingBreak = false;

  pages.forEach((page, pageIndex) => {
    const kept = page.lines.filter((line) => {
      if (
        drop.size > 0 &&
        drop.has(fingerprint(line.text)) &&
        inFurnitureZone(line, page.height, body)
      ) {
        removed += 1;
        return false;
      }
      return true;
    });

    if (pageIndex > 0 && options.keepPageBreaks) pendingBreak = true;

    // The left edge most lines start at — used to tell a continuation line from
    // a first line, and an indented block quote from body text.
    const leftEdge = kept.length > 0 ? Math.min(...kept.map((l) => l.x0)) : 0;
    const rightEdge = kept.length > 0 ? Math.max(...kept.map((l) => l.x1)) : page.width;

    for (let i = 0; i < kept.length; i++) {
      const line = kept[i];
      const previous = kept[i - 1];

      const markerMatch = line.text.match(LIST_MARKER);
      const style = headingStyle(line.size, body, line.bold);

      // Decide whether this line continues the paragraph above it.
      let continues = false;
      if (
        options.layout === "flowing" &&
        previous &&
        paragraphs.length > 0 &&
        !pendingBreak &&
        !markerMatch &&
        style === "Normal"
      ) {
        const last = paragraphs[paragraphs.length - 1];
        const gap = previous.y - line.y;
        const normalGap = Math.max(previous.size, line.size) * 1.8;
        const previousReachedMargin = previous.x1 > rightEdge - line.size * 2.5;
        const sameColumn = Math.abs(line.x0 - leftEdge) < line.size * 1.5;
        const sameSize = Math.abs(previous.size - line.size) < 0.6;

        continues =
          last.style === "Normal" &&
          gap > 0 &&
          gap < normalGap &&
          sameSize &&
          sameColumn &&
          previousReachedMargin &&
          // A line ending in a full stop *and* followed by an indent is a new
          // paragraph; ending mid-sentence is the strongest continuation signal
          // there is.
          !(/[.!?:;]["'”’)]?$/.test(last.text) && line.x0 > leftEdge + line.size);
      }

      if (continues) {
        const last = paragraphs[paragraphs.length - 1];
        // A hyphen at a line break is usually the renderer's, not the author's.
        if (/[a-z]-$/.test(last.text) && /^[a-z]/.test(line.text)) {
          last.text = last.text.slice(0, -1) + line.text;
        } else {
          last.text += " " + line.text;
        }
        continue;
      }

      let text = line.text;
      let list: Paragraph["list"];

      if (markerMatch) {
        const marker = markerMatch[0].trim();
        const ordered = /\d|[a-zA-Z]/.test(marker);
        const previousPara = paragraphs[paragraphs.length - 1];
        // A new list starts whenever the line above was not a list item of the
        // same kind, so numbering restarts where the document restarts it.
        if (!previousPara?.list || previousPara.list.ordered !== ordered) listGroup += 1;
        list = {
          ordered,
          start: ordered ? Number(marker.replace(/\D/g, "")) || 1 : 1,
          group: listGroup,
        };
        text = text.slice(markerMatch[0].length);
      }

      if (text.trim() === "") continue;

      paragraphs.push({
        text,
        style: list ? "Normal" : style,
        bold: line.bold && !list && style === "Normal",
        size: line.size,
        list,
        pageBreakBefore: pendingBreak,
      });
      pendingBreak = false;
    }
  });

  return { paragraphs, removed };
}

/* ────────────────────────── OOXML ────────────────────────── */

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // Word rejects the whole file on a stray control character, and PDFs do
    // contain them. Strip rather than escape.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

/** Points → twentieths of a point, the unit almost all of OOXML uses. */
const twips = (points: number) => Math.round(points * 20);
/** Points → half-points, which is what run sizes use. */
const halfPoints = (points: number) => Math.max(2, Math.round(points * 2));

const W_NS =
  'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';

function paragraphXml(para: Paragraph, bodySize: number): string {
  const props: string[] = [];
  if (para.style !== "Normal") props.push(`<w:pStyle w:val="${para.style}"/>`);
  if (para.list) {
    props.push(`<w:pStyle w:val="ListParagraph"/>`);
    props.push(
      `<w:numPr><w:ilvl w:val="0"/><w:numId w:val="${para.list.group}"/></w:numPr>`
    );
  }
  if (para.pageBreakBefore) props.push(`<w:pageBreakBefore/>`);

  const runProps: string[] = [];
  if (para.bold) runProps.push("<w:b/>");
  // Only spell out a size when it differs from the document default, so an
  // ordinary paragraph stays editable through Word's own styles.
  if (para.style === "Normal" && Math.abs(para.size - bodySize) > 0.6) {
    runProps.push(`<w:sz w:val="${halfPoints(para.size)}"/>`);
  }

  const pPr = props.length > 0 ? `<w:pPr>${props.join("")}</w:pPr>` : "";
  const rPr = runProps.length > 0 ? `<w:rPr>${runProps.join("")}</w:rPr>` : "";

  return `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(
    para.text
  )}</w:t></w:r></w:p>`;
}

function documentXml(
  paragraphs: Paragraph[],
  bodySize: number,
  page: { width: number; height: number }
): string {
  // Carry the PDF's own page geometry across, so an A4 PDF opens as an A4
  // document rather than defaulting to US Letter.
  const sectPr =
    `<w:sectPr><w:pgSz w:w="${twips(page.width)}" w:h="${twips(page.height)}"` +
    `${page.width > page.height ? ' w:orient="landscape"' : ""}/>` +
    `<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document ${W_NS}><w:body>${paragraphs
    .map((p) => paragraphXml(p, bodySize))
    .join("")}${sectPr}</w:body></w:document>`;
}

function stylesXml(bodySize: number): string {
  const heading = (id: string, name: string, outline: number, size: number) =>
    `<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/>` +
    `<w:basedOn w:val="Normal"/><w:qFormat/>` +
    `<w:pPr><w:keepNext/><w:outlineLvl w:val="${outline}"/>` +
    `<w:spacing w:before="240" w:after="120"/></w:pPr>` +
    `<w:rPr><w:b/><w:sz w:val="${halfPoints(size)}"/></w:rPr></w:style>`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles ${W_NS}>
<w:docDefaults><w:rPrDefault><w:rPr>
<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
<w:sz w:val="${halfPoints(bodySize)}"/></w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="140" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault>
</w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
${heading("Heading1", "heading 1", 0, bodySize * 1.8)}
${heading("Heading2", "heading 2", 1, bodySize * 1.45)}
${heading("Heading3", "heading 3", 2, bodySize * 1.2)}
<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/>
<w:basedOn w:val="Normal"/><w:qFormat/>
<w:pPr><w:ind w:left="720"/><w:contextualSpacing/><w:spacing w:after="60"/></w:pPr></w:style>
</w:styles>`;
}

/**
 * One numbering definition per detected list.
 *
 * Sharing a single definition would make Word continue one sequence through
 * every list in the document — the second list starting at 7 because the first
 * ended at 6.
 */
function numberingXml(lists: { group: number; ordered: boolean; start: number }[]): string {
  const abstracts = lists
    .map(
      (list) =>
        `<w:abstractNum w:abstractNumId="${list.group}"><w:multiLevelType w:val="singleLevel"/>` +
        `<w:lvl w:ilvl="0"><w:start w:val="${list.start}"/>` +
        `<w:numFmt w:val="${list.ordered ? "decimal" : "bullet"}"/>` +
        `<w:lvlText w:val="${list.ordered ? "%1." : "&#8226;"}"/>` +
        `<w:lvlJc w:val="left"/>` +
        `<w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>` +
        `${list.ordered ? "" : '<w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol"/></w:rPr>'}` +
        `</w:lvl></w:abstractNum>`
    )
    .join("");

  const nums = lists
    .map(
      (list) =>
        `<w:num w:numId="${list.group}"><w:abstractNumId w:val="${list.group}"/></w:num>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering ${W_NS}>${abstracts}${nums}</w:numbering>`;
}

function corePropsXml(title: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${escapeXml(title)}</dc:title>
<dc:creator>JunglePDF</dc:creator>
<cp:lastModifiedBy>JunglePDF</cp:lastModifiedBy>
</cp:coreProperties>`;
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`;

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`;

const DOCUMENT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>`;

const DOCX_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

async function writeDocx(parts: Record<string, string>): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const [path, content] of Object.entries(parts)) zip.file(path, content);
  return zip.generateAsync({
    type: "blob",
    mimeType: DOCX_TYPE,
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

/* ────────────────────────── entry point ────────────────────────── */

export function describeLosses(): string[] {
  return [
    "Tables come across as text, not as Word tables",
    "Images, charts and drawings are not carried over",
    "Exact fonts, colors and page positions are replaced by ordinary styles",
    "Multi-column pages are read in the order the PDF stores them",
  ];
}

export async function pdfToWord(
  file: File,
  options: PdfToWordOptions,
  onProgress?: ProgressFn
): Promise<PdfToWordResult> {
  onProgress?.("Reading PDF…", 8);

  const session = await openForRender(await file.arrayBuffer(), file.name);

  try {
    const pageCount = session.doc.numPages;
    const pages: { lines: RawLine[]; width: number; height: number }[] = [];

    for (let n = 1; n <= pageCount; n++) {
      onProgress?.(
        `Reading page ${n} of ${pageCount}…`,
        10 + Math.round((n / pageCount) * 65)
      );

      const page = await session.doc.getPage(n);
      try {
        const viewport = page.getViewport({ scale: 1 });
        // Populates commonObjs with the page's fonts — see boldLookup.
        await page.getOperatorList();
        const content = await page.getTextContent();
        const isBold = boldLookup(page as unknown as PageLike);

        pages.push({
          lines: assembleLines(content.items as TextItemLike[], isBold),
          width: viewport.width,
          height: viewport.height,
        });
      } finally {
        page.cleanup();
      }
    }

    onProgress?.("Rebuilding paragraphs…", 80);

    const bodySize = bodyTextSize(pages.flatMap((p) => p.lines));
    const drop = options.stripRunningHeads
      ? findRunningHeads(pages, bodySize)
      : new Set<string>();
    const { paragraphs, removed } = buildParagraphs({ pages, options, drop });

    if (paragraphs.length === 0) {
      throw new Error(
        "No text was found in this PDF. It is almost certainly a scan — a picture of a page rather than text — and converting it would need OCR, which this tool does not do."
      );
    }

    // Deduplicate list definitions: one per group, taking its start number.
    const lists = new Map<number, { group: number; ordered: boolean; start: number }>();
    for (const para of paragraphs) {
      if (para.list && !lists.has(para.list.group)) {
        lists.set(para.list.group, { ...para.list });
      }
    }

    onProgress?.("Writing Word document…", 90);

    const first = pages[0];
    const blob = await writeDocx({
      "[Content_Types].xml": CONTENT_TYPES,
      "_rels/.rels": ROOT_RELS,
      "docProps/core.xml": corePropsXml(file.name.replace(/\.pdf$/i, "")),
      "word/_rels/document.xml.rels": DOCUMENT_RELS,
      "word/document.xml": documentXml(paragraphs, bodySize, first),
      "word/styles.xml": stylesXml(bodySize),
      "word/numbering.xml": numberingXml([...lists.values()]),
    });

    onProgress?.("Done", 100);

    const characterCount = paragraphs.reduce((n, p) => n + p.text.length, 0);

    const notes: string[] = [];
    if (removed > 0) {
      notes.push(
        `${removed} repeated header or footer line${removed === 1 ? " was" : "s were"} removed.`
      );
    }
    if (characterCount < pageCount * 200) {
      notes.push(
        "Very little text was found for the number of pages. If this PDF is mostly scanned images, only the parts that have a real text layer could be converted."
      );
    }

    return {
      blob,
      filename: file.name.replace(/\.pdf$/i, "") + ".docx",
      pageCount,
      paragraphCount: paragraphs.length,
      characterCount,
      removedRunningHeads: removed,
      notice: notes.length > 0 ? notes.join(" ") : null,
    };
  } finally {
    await session.destroy();
  }
}
