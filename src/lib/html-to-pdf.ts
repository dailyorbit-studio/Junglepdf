/**
 * HTML → PDF.
 *
 * The browser already has the parser, so this is mostly about what *not* to
 * do. Two things are worth being explicit about:
 *
 *  - **No CSS is applied.** This renders the document's structure through the
 *    shared typesetter, not the page as a browser would paint it. A styled
 *    marketing page will come out as its underlying content. Reproducing CSS
 *    layout means running a browser engine, which is what a headless-Chrome
 *    service does on a server — exactly the thing this site does not have.
 *  - **Nothing is fetched.** Remote images, stylesheets and scripts are not
 *    loaded. Fetching them would leak the document's contents (and the reader's
 *    IP) to whatever hosts it references, which is not a reasonable thing for a
 *    privacy tool to do quietly. Images embedded as data: URIs do convert.
 */

import type { ProgressFn } from "./ffmpeg";
import { htmlToBlocks } from "./html-blocks";
import {
  buildNotice,
  createSanitizer,
  renderBlocksToPdf,
  type DocLayoutOptions,
} from "./pdf-layout";

export interface HtmlToPdfResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  skippedImages: number;
  unsupportedCharacters: number;
  /** Remote assets that were deliberately not fetched. */
  remoteAssets: number;
  notice: string | null;
}

/** Strip everything that would otherwise reach for the network. */
function stripRemote(html: string): { html: string; remote: number } {
  const doc = new DOMParser().parseFromString(html, "text/html");
  let remote = 0;

  doc.querySelectorAll("script, style, link, iframe, video, audio, object, embed").forEach((el) => {
    el.remove();
  });

  doc.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src") ?? "";
    if (!src.startsWith("data:")) {
      remote += 1;
      img.remove();
    }
  });

  return { html: doc.body.innerHTML, remote };
}

export async function htmlToPDF(
  file: File,
  options: DocLayoutOptions,
  onProgress?: ProgressFn
): Promise<HtmlToPdfResult> {
  onProgress?.("Reading file…", 10);

  const source = await file.text();
  const { html, remote } = stripRemote(source);

  onProgress?.("Reading structure…", 25);

  const sanitize = createSanitizer();
  const blocks = htmlToBlocks(html, sanitize);

  if (blocks.length === 0) {
    throw new Error(
      "No readable content was found in this file. If the page builds itself with JavaScript, the saved HTML holds only the script, not the text."
    );
  }

  onProgress?.("Laying out pages…", 40);

  const rendered = await renderBlocksToPdf(
    blocks,
    options,
    {
      title: file.name.replace(/\.x?html?$/i, ""),
      creator: "JunglePDF HTML to PDF",
    },
    onProgress
  );

  onProgress?.("Done", 100);

  const notes: string[] = [];
  const base = buildNotice(rendered.skippedImages, sanitize.dropped);
  if (base) notes.push(base);
  if (remote > 0) {
    notes.push(
      `${remote} image${remote === 1 ? "" : "s"} referenced a remote URL and ${remote === 1 ? "was" : "were"} not downloaded — fetching them would send this document's references to another server. Images embedded directly in the file are included.`
    );
  }

  return {
    blob: rendered.blob,
    filename: file.name.replace(/\.x?html?$/i, "") + ".pdf",
    pageCount: rendered.pageCount,
    skippedImages: rendered.skippedImages,
    unsupportedCharacters: sanitize.dropped,
    remoteAssets: remote,
    notice: notes.length > 0 ? notes.join(" ") : null,
  };
}
