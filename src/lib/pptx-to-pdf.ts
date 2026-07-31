/**
 * PowerPoint to PDF — reading .pptx slide XML
 *
 * A .pptx is a zip of XML, so its slides can be read here the same way .docx
 * and .xlsx are. What comes out, though, is different in kind from those two,
 * and the difference is the whole story of this tool:
 *
 * **This extracts a deck's content, not its design.** Every visual property of
 * a slide — the background, the theme, the master layout, where each shape sits
 * on the canvas, images, charts, SmartArt, transitions — lives in DrawingML,
 * a full vector layout language. Rendering that faithfully means implementing a
 * presentation engine. What is recoverable without one is the text: the titles,
 * the bullets, their nesting, and the speaker notes.
 *
 * So the output is a readable document of what the deck *says*, one page per
 * slide, not a picture of what it looks like. That is genuinely useful for
 * reading, printing handouts, searching and quoting — and genuinely not a
 * substitute for PowerPoint's own Export to PDF, which the UI says plainly.
 *
 * The one structural subtlety: slide order comes from `sldIdLst` in
 * presentation.xml, resolved through the relationship file. Sorting slide
 * filenames instead puts slide10 before slide2.
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

export interface PptxToPdfResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  slideCount: number;
  /** Slides that held no text at all — usually image-only slides. */
  emptySlides: number;
  unsupportedCharacters: number;
  notice: string | null;
}

export interface PptxToPdfOptions extends DocLayoutOptions {
  /** Append each slide's speaker notes under its content. */
  includeNotes: boolean;
  /** Number each slide's heading, so the document tracks the deck. */
  numberSlides: boolean;
}

type Zip = Awaited<ReturnType<typeof loadZip>>;

async function loadZip(file: File) {
  const { default: JSZip } = await import("jszip");
  try {
    return await JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    throw new Error(
      `"${file.name}" could not be opened. It is not a valid .pptx archive — it may be corrupted, or an older .ppt saved with the wrong extension.`
    );
  }
}

async function readXml(zip: Zip, path: string): Promise<Document | null> {
  const entry = zip.file(path);
  if (!entry) return null;
  return new DOMParser().parseFromString(await entry.async("string"), "application/xml");
}

/** Resolve a relationship target against the folder its .rels file describes. */
function resolveTarget(baseFolder: string, target: string): string {
  const joined = `${baseFolder}/${target}`;
  const parts: string[] = [];
  for (const segment of joined.split("/")) {
    if (segment === "." || segment === "") continue;
    if (segment === "..") parts.pop();
    else parts.push(segment);
  }
  return parts.join("/");
}

async function readRels(zip: Zip, path: string, baseFolder: string): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const doc = await readXml(zip, path);
  if (!doc) return map;

  for (const rel of [...doc.getElementsByTagName("*")].filter((el) => el.localName === "Relationship")) {
    const id = rel.getAttribute("Id");
    const target = rel.getAttribute("Target");
    if (id && target && !/^https?:/i.test(target)) {
      map.set(id, resolveTarget(baseFolder, target));
    }
  }

  return map;
}

/** Slide paths in presentation order. */
async function readSlideOrder(zip: Zip): Promise<string[]> {
  const presentation = await readXml(zip, "ppt/presentation.xml");
  if (!presentation) {
    throw new Error(
      "This archive has no ppt/presentation.xml, so it is not a PowerPoint file. Check it was saved as .pptx."
    );
  }

  const rels = await readRels(zip, "ppt/_rels/presentation.xml.rels", "ppt");
  const ids = [...presentation.getElementsByTagName("*")]
    .filter((el) => el.localName === "sldId")
    .map(
      (el) =>
        el.getAttribute("r:id") ??
        el.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id")
    )
    .filter((id): id is string => Boolean(id));

  const paths = ids.map((id) => rels.get(id)).filter((p): p is string => Boolean(p));

  if (paths.length > 0) return paths;

  // No usable slide list — fall back to natural-sorted slide files so at least
  // slide10 does not land before slide2.
  return Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const n = (s: string) => Number(s.match(/(\d+)\.xml$/)?.[1] ?? 0);
      return n(a) - n(b);
    });
}

interface Paragraph {
  spans: Span[];
  /** Outline level: 0 is a top-level bullet. */
  level: number;
}

/** Read one shape's text body into paragraphs. */
function readTextBody(body: Element, sanitize: Sanitizer): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  for (const p of [...body.children].filter((el) => el.localName === "p")) {
    const spans: Span[] = [];
    let level = 0;

    for (const child of [...p.children]) {
      if (child.localName === "pPr") {
        level = Number(child.getAttribute("lvl") ?? "0") || 0;
        continue;
      }

      // a:br is an explicit line break inside a paragraph.
      if (child.localName === "br") {
        spans.push({ text: "\n", bold: false, italic: false });
        continue;
      }

      if (child.localName !== "r" && child.localName !== "fld") continue;

      const props = [...child.children].find((el) => el.localName === "rPr");
      const text = [...child.children]
        .filter((el) => el.localName === "t")
        .map((el) => el.textContent ?? "")
        .join("");

      if (text === "") continue;

      spans.push({
        text: sanitize(text),
        bold: props?.getAttribute("b") === "1",
        italic: props?.getAttribute("i") === "1",
      });
    }

    if (spans.some((s) => s.text.trim() !== "")) paragraphs.push({ spans, level });
  }

  return paragraphs;
}

/**
 * Whether a shape is the slide's title placeholder.
 *
 * The title is worth identifying: it becomes the page heading, which is what
 * makes the output navigable rather than an undifferentiated run of bullets.
 */
function isTitleShape(shape: Element): boolean {
  const nv = [...shape.getElementsByTagName("*")].find((el) => el.localName === "ph");
  const type = nv?.getAttribute("type") ?? "";
  return type === "title" || type === "ctrTitle";
}

interface SlideContent {
  title: Paragraph[];
  body: Paragraph[];
}

function readSlide(doc: Document, sanitize: Sanitizer): SlideContent {
  const title: Paragraph[] = [];
  const body: Paragraph[] = [];

  for (const shape of [...doc.getElementsByTagName("*")].filter((el) => el.localName === "sp")) {
    const textBody = [...shape.children].find((el) => el.localName === "txBody");
    if (!textBody) continue;

    const paragraphs = readTextBody(textBody, sanitize);
    if (paragraphs.length === 0) continue;

    if (isTitleShape(shape) && title.length === 0) title.push(...paragraphs);
    else body.push(...paragraphs);
  }

  // Tables live in graphicFrame rather than sp, and their cells hold text
  // bodies of their own. Read them as ordinary paragraphs — a slide table is
  // usually a short list wearing a grid.
  for (const cell of [...doc.getElementsByTagName("*")].filter((el) => el.localName === "tc")) {
    const textBody = [...cell.children].find((el) => el.localName === "txBody");
    if (textBody) body.push(...readTextBody(textBody, sanitize));
  }

  return { title, body };
}

export function describeLosses(): string[] {
  return [
    "Slide text, titles, bullets and their nesting come across",
    "Speaker notes can be included underneath each slide",
    "Backgrounds, themes, images, charts and SmartArt are not rendered",
    "Shape positions and animations have no equivalent on a page",
  ];
}

export async function pptxToPDF(
  file: File,
  options: PptxToPdfOptions,
  onProgress?: ProgressFn
): Promise<PptxToPdfResult> {
  if (/\.ppt$/i.test(file.name)) {
    throw new Error(
      "This is a legacy .ppt file. Open it in PowerPoint, LibreOffice or Google Slides and save it as .pptx, then try again — the old binary format cannot be read in a browser."
    );
  }

  onProgress?.("Opening presentation…", 8);

  const zip = await loadZip(file);
  const slidePaths = await readSlideOrder(zip);

  if (slidePaths.length === 0) {
    throw new Error("This presentation has no slides in it.");
  }

  const sanitize = createSanitizer();
  const blocks: Block[] = [];
  let emptySlides = 0;

  for (let i = 0; i < slidePaths.length; i++) {
    onProgress?.(
      `Reading slide ${i + 1} of ${slidePaths.length}…`,
      10 + Math.round((i / slidePaths.length) * 28)
    );

    const doc = await readXml(zip, slidePaths[i]);
    if (!doc) continue;

    const { title, body } = readSlide(doc, sanitize);

    if (title.length === 0 && body.length === 0) {
      emptySlides += 1;
      continue;
    }

    // One slide per page: a deck's page breaks are the one piece of its layout
    // that maps onto paper exactly.
    if (blocks.length > 0) blocks.push({ kind: "pagebreak" });

    const heading = title.flatMap((p) => p.spans);
    blocks.push({
      kind: "heading",
      level: 2,
      spans:
        options.numberSlides
          ? [{ text: sanitize(`${i + 1}. `), bold: true, italic: false }, ...heading]
          : heading.length > 0
            ? heading
            : [{ text: sanitize(`Slide ${i + 1}`), bold: true, italic: false }],
    });

    for (const paragraph of body) {
      blocks.push({
        kind: "para",
        spans: paragraph.spans,
        indent: Math.min(4, paragraph.level + 1),
        marker: "•",
      });
    }

    if (options.includeNotes) {
      const notesPath = slidePaths[i]
        .replace("/slides/", "/notesSlides/")
        .replace("slide", "notesSlide");
      const notesDoc = await readXml(zip, notesPath);
      if (notesDoc) {
        const notes = readSlide(notesDoc, sanitize);
        // A notes slide repeats the slide's own text in a placeholder; only the
        // body is the actual note.
        const lines = notes.body.filter((p) => p.spans.some((s) => s.text.trim() !== ""));
        if (lines.length > 0) {
          blocks.push({ kind: "rule" });
          for (const line of lines) {
            blocks.push({ kind: "para", spans: line.spans, indent: 0, quote: true });
          }
        }
      }
    }
  }

  if (blocks.length === 0) {
    throw new Error(
      "No text was found on any slide. If this deck is built from images or SmartArt, there is nothing here that can be read as text."
    );
  }

  onProgress?.("Laying out pages…", 40);

  const rendered = await renderBlocksToPdf(
    blocks,
    options,
    { title: file.name.replace(/\.pptx$/i, ""), creator: "JunglePDF PPT to PDF" },
    onProgress
  );

  onProgress?.("Done", 100);

  const notes: string[] = [];
  const base = buildNotice(0, sanitize.dropped);
  if (base) notes.push(base);
  if (emptySlides > 0) {
    notes.push(
      `${emptySlides} slide${emptySlides === 1 ? "" : "s"} had no text and ${emptySlides === 1 ? "was" : "were"} skipped — they are probably images or diagrams, which cannot be read here.`
    );
  }

  return {
    blob: rendered.blob,
    filename: file.name.replace(/\.pptx$/i, "") + ".pdf",
    pageCount: rendered.pageCount,
    slideCount: slidePaths.length - emptySlides,
    emptySlides,
    unsupportedCharacters: sanitize.dropped,
    notice: notes.length > 0 ? notes.join(" ") : null,
  };
}
