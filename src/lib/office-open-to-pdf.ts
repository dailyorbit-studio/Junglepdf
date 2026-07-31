/**
 * OpenDocument (.odt) and EPUB (.epub) → PDF.
 *
 * Both formats are zip archives of XML, which is what puts them within reach
 * here: JSZip is already a dependency, DOMParser is already in the browser, and
 * the shared layout engine already knows how to typeset the block model both
 * reduce to. No new library, no server.
 *
 *  - **ODT** keeps its text in `content.xml` under the OpenDocument text
 *    namespace. The element names differ from HTML (`text:h`, `text:p`,
 *    `text:list`) but map onto the same shapes one-for-one.
 *  - **EPUB** is a zip of XHTML chapters plus an OPF manifest that gives their
 *    reading order. Read the spine, convert each chapter, page-break between
 *    them. Without the spine the chapters would come out in zip order, which
 *    is arbitrary.
 *
 * Neither reader applies stylesheets: as everywhere else here, this is a
 * structural re-flow, not a facsimile.
 */

import type { ProgressFn } from "./ffmpeg";
import { documentToBlocks, inlineSpans } from "./html-blocks";
import {
  buildNotice,
  createSanitizer,
  renderBlocksToPdf,
  type Block,
  type DocLayoutOptions,
  type Sanitizer,
  type Span,
} from "./pdf-layout";

export interface OpenDocResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  /** EPUB only: chapters read from the spine. */
  chapterCount: number;
  skippedImages: number;
  unsupportedCharacters: number;
  notice: string | null;
}

type Zip = Awaited<ReturnType<typeof openZip>>;

async function openZip(file: File) {
  const { default: JSZip } = await import("jszip");
  try {
    return await JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    throw new Error(
      `"${file.name}" could not be opened. It is not a valid archive — the file may be corrupted or saved in a different format.`
    );
  }
}

async function readText(zip: Zip, path: string): Promise<string | null> {
  const entry = zip.file(path);
  return entry ? entry.async("string") : null;
}

/* ────────────────────────── ODT ────────────────────────── */

const ODT_HEADING = /^h$/;

/**
 * Walk OpenDocument content into blocks.
 *
 * `text:h` carries its level in `text:outline-level`; `text:list` nests the
 * same way HTML lists do; `table:table` holds `table:table-row` /
 * `table:table-cell`. Anything else is walked through.
 */
function odtBlocks(node: Element, indent: number, sanitize: Sanitizer, out: Block[]): void {
  for (const child of [...node.children]) {
    // localName drops the namespace prefix, which varies between writers.
    const name = child.localName;

    if (ODT_HEADING.test(name)) {
      const level = Number(child.getAttribute("text:outline-level") ?? "1") || 1;
      const spans = inlineSpans(child, sanitize);
      if (spans.some((s) => s.text.trim())) {
        out.push({ kind: "heading", level: Math.min(6, level), spans });
      }
      continue;
    }

    if (name === "p") {
      const spans = inlineSpans(child, sanitize);
      if (spans.some((s) => s.text.trim())) out.push({ kind: "para", spans, indent });
      continue;
    }

    if (name === "list") {
      let index = 1;
      for (const item of [...child.children]) {
        if (item.localName !== "list-item") continue;

        // The item's own paragraphs get the bullet; nested lists recurse.
        for (const para of [...item.children]) {
          if (para.localName === "list") {
            odtBlocks(item, indent + 1, sanitize, out);
            continue;
          }
          const spans = inlineSpans(para, sanitize);
          if (spans.some((s) => s.text.trim())) {
            out.push({ kind: "para", spans, indent: indent + 1, marker: "•" });
            index += 1;
          }
        }
      }
      void index;
      continue;
    }

    if (name === "table") {
      const rows: { cells: Span[][]; header: boolean }[] = [];
      for (const row of [...child.querySelectorAll("*")].filter((n) => n.localName === "table-row")) {
        const cells = [...row.children].filter((c) => c.localName === "table-cell");
        if (cells.length === 0) continue;
        rows.push({ cells: cells.map((c) => inlineSpans(c, sanitize)), header: false });
      }
      if (rows.length > 0) out.push({ kind: "table", rows });
      continue;
    }

    if (name === "soft-page-break") {
      continue;
    }

    odtBlocks(child, indent, sanitize, out);
  }
}

export async function odtToPDF(
  file: File,
  options: DocLayoutOptions,
  onProgress?: ProgressFn
): Promise<OpenDocResult> {
  onProgress?.("Opening document…", 8);

  const zip = await openZip(file);
  const content = await readText(zip, "content.xml");

  if (!content) {
    throw new Error(
      "This archive has no content.xml, so it is not an OpenDocument file. Check that it was saved from LibreOffice, OpenOffice or Google Docs as .odt."
    );
  }

  onProgress?.("Reading structure…", 25);

  const sanitize = createSanitizer();
  const doc = new DOMParser().parseFromString(content, "application/xml");
  const body = [...doc.getElementsByTagName("*")].find((el) => el.localName === "text");

  if (!body) {
    throw new Error("No document body was found inside this OpenDocument file.");
  }

  const blocks: Block[] = [];
  odtBlocks(body, 0, sanitize, blocks);

  if (blocks.length === 0) {
    throw new Error("This document appears to be empty — no text was found in it.");
  }

  onProgress?.("Laying out pages…", 40);

  const rendered = await renderBlocksToPdf(
    blocks,
    options,
    { title: file.name.replace(/\.od[tps]$/i, ""), creator: "JunglePDF ODT to PDF" },
    onProgress
  );

  onProgress?.("Done", 100);

  return {
    blob: rendered.blob,
    filename: file.name.replace(/\.od[tps]$/i, "") + ".pdf",
    pageCount: rendered.pageCount,
    chapterCount: 0,
    skippedImages: rendered.skippedImages,
    unsupportedCharacters: sanitize.dropped,
    notice: buildNotice(rendered.skippedImages, sanitize.dropped),
  };
}

/* ────────────────────────── EPUB ────────────────────────── */

/** Resolve an href that is relative to the OPF's own folder. */
function resolveFrom(base: string, href: string): string {
  const folder = base.includes("/") ? base.slice(0, base.lastIndexOf("/") + 1) : "";
  const joined = folder + href.split("#")[0];
  // Collapse "a/../b" the way a real resolver would.
  const parts: string[] = [];
  for (const segment of joined.split("/")) {
    if (segment === "." || segment === "") continue;
    if (segment === "..") parts.pop();
    else parts.push(segment);
  }
  return parts.join("/");
}

/** Find the OPF package file via META-INF/container.xml. */
async function findOpfPath(zip: Zip): Promise<string> {
  const container = await readText(zip, "META-INF/container.xml");
  if (container) {
    const doc = new DOMParser().parseFromString(container, "application/xml");
    const rootfile = [...doc.getElementsByTagName("*")].find((el) => el.localName === "rootfile");
    const path = rootfile?.getAttribute("full-path");
    if (path) return path;
  }

  // Some older files omit the container; fall back to any .opf in the archive.
  const guess = Object.keys(zip.files).find((name) => name.toLowerCase().endsWith(".opf"));
  if (guess) return guess;

  throw new Error(
    "This does not look like an EPUB — no package file was found inside the archive."
  );
}

export async function epubToPDF(
  file: File,
  options: DocLayoutOptions,
  onProgress?: ProgressFn
): Promise<OpenDocResult> {
  onProgress?.("Opening book…", 6);

  const zip = await openZip(file);
  const opfPath = await findOpfPath(zip);
  const opf = await readText(zip, opfPath);

  if (!opf) throw new Error("The EPUB's package file could not be read.");

  const opfDoc = new DOMParser().parseFromString(opf, "application/xml");
  const all = [...opfDoc.getElementsByTagName("*")];

  // manifest id → href, then the spine's itemrefs give the reading order.
  const manifest = new Map<string, string>();
  for (const item of all.filter((el) => el.localName === "item")) {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    if (id && href) manifest.set(id, href);
  }

  const spine = all
    .filter((el) => el.localName === "itemref")
    .map((ref) => ref.getAttribute("idref"))
    .filter((id): id is string => Boolean(id))
    .map((id) => manifest.get(id))
    .filter((href): href is string => Boolean(href))
    .map((href) => resolveFrom(opfPath, href));

  const chapters = spine.length > 0
    ? spine
    : Object.keys(zip.files).filter((n) => /\.x?html?$/i.test(n)).sort();

  if (chapters.length === 0) {
    throw new Error("This EPUB has no readable chapters.");
  }

  const title =
    all.find((el) => el.localName === "title")?.textContent?.trim() ||
    file.name.replace(/\.epub$/i, "");

  const sanitize = createSanitizer();
  const blocks: Block[] = [];
  let converted = 0;

  for (let i = 0; i < chapters.length; i++) {
    onProgress?.(
      `Reading chapter ${i + 1} of ${chapters.length}…`,
      10 + Math.round((i / chapters.length) * 25)
    );

    const xhtml = await readText(zip, chapters[i]);
    if (!xhtml) continue;

    // Parsed as HTML rather than XML: EPUB 2 files are frequently not
    // well-formed XML, and the HTML parser recovers where the XML one throws.
    const chapterDoc = new DOMParser().parseFromString(xhtml, "text/html");
    const chapterBlocks = documentToBlocks(chapterDoc, chapterDoc.body, sanitize);
    if (chapterBlocks.length === 0) continue;

    // Chapters start on their own page — the one place a book's structure
    // genuinely maps onto page breaks.
    if (blocks.length > 0) blocks.push({ kind: "pagebreak" });
    blocks.push(...chapterBlocks);
    converted += 1;
  }

  if (blocks.length === 0) {
    throw new Error(
      "No text was found in this EPUB. If it is a fixed-layout or DRM-protected book, the chapters cannot be read."
    );
  }

  onProgress?.("Laying out pages…", 40);

  const rendered = await renderBlocksToPdf(
    blocks,
    options,
    { title, creator: "JunglePDF EPUB to PDF" },
    onProgress
  );

  onProgress?.("Done", 100);

  return {
    blob: rendered.blob,
    filename: file.name.replace(/\.epub$/i, "") + ".pdf",
    pageCount: rendered.pageCount,
    chapterCount: converted,
    skippedImages: rendered.skippedImages,
    unsupportedCharacters: sanitize.dropped,
    notice: buildNotice(rendered.skippedImages, sanitize.dropped),
  };
}
