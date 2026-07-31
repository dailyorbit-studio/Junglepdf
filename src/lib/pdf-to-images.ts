/**
 * PDF to Images — pdf.js rasterisation
 *
 * pdf-lib cannot draw, so this is the one PDF tool that reaches for pdf.js.
 * Each page is rendered to a canvas at the requested DPI and encoded, then
 * the set is bundled as a ZIP because handing someone 40 download clicks is
 * not an export feature.
 */

import { openForRender, renderPage, clampScale } from "./pdf-render";
import { parsePageSelection } from "./pdf-utils";
import { createZip, type ZipEntry } from "./zip";

export type ImageFormat = "image/png" | "image/jpeg";

export const DPI_PRESETS = [72, 150, 300] as const;

export interface PdfToImagesOptions {
  format: ImageFormat;
  dpi: number;
  quality: number;
  /** Range string like "1-5, 9", or null for every page. */
  pageSelection: string | null;
}

export interface PageImage {
  pageNumber: number;
  blob: Blob;
  width: number;
  height: number;
}

export interface PdfToImagesResult {
  images: PageImage[];
  zipBlob: Blob;
  totalPages: number;
  /** Set when a page was too large to render at the requested DPI. */
  warning: string | null;
}

export async function pdfToImages(
  file: File,
  options: PdfToImagesOptions,
  onProgress?: (step: string, pct: number) => void
): Promise<PdfToImagesResult> {
  onProgress?.("Reading PDF…", 3);

  const arrayBuffer = await file.arrayBuffer();
  const session = await openForRender(arrayBuffer, file.name);
  const { doc } = session;

  try {
    const totalPages = doc.numPages;

    // Parsed here rather than in the caller: the page count is only known
    // once the document is open, and rendering everything then discarding
    // most of it would be the expensive way to honour a range.
    const targets =
      options.pageSelection && options.pageSelection.trim()
        ? parsePageSelection(options.pageSelection, totalPages)
        : Array.from({ length: totalPages }, (_, i) => i + 1);

    // PDF user space is 72 units per inch, so this is the scale factor that
    // turns "300 DPI" into something the renderer understands.
    const requestedScale = options.dpi / 72;

    const images: PageImage[] = [];
    let downscaled = false;

    const baseName = file.name.replace(/\.pdf$/i, "");
    const extension = options.format === "image/png" ? "png" : "jpg";
    const pad = String(totalPages).length;

    for (let i = 0; i < targets.length; i++) {
      const pageNumber = targets[i];
      onProgress?.(
        `Rendering page ${pageNumber}…`,
        3 + Math.round((i / targets.length) * 72)
      );

      const page = await doc.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      page.cleanup();

      const scale = clampScale(base.width, base.height, requestedScale);
      if (scale < requestedScale - 0.001) downscaled = true;

      const rendered = await renderPage(
        doc,
        pageNumber,
        scale,
        options.format,
        options.quality
      );

      images.push({
        pageNumber,
        blob: rendered.blob,
        width: rendered.width,
        height: rendered.height,
      });
    }

    onProgress?.("Bundling…", 78);

    const entries: ZipEntry[] = images.map((image) => ({
      // Zero-padded so a file manager sorts page 10 after page 9.
      filename: `${baseName}_page${String(image.pageNumber).padStart(pad, "0")}.${extension}`,
      blob: image.blob,
    }));

    const zipBlob = await createZip(entries, (step, pct) =>
      onProgress?.(step, 78 + Math.round(pct * 0.22))
    );

    onProgress?.("Done", 100);

    return {
      images,
      zipBlob,
      totalPages,
      warning: downscaled
        ? `Some pages were too large to render at ${options.dpi} DPI and were rendered smaller ` +
          `instead, to stay inside your browser's canvas limit. Lower the DPI to make this exact.`
        : null,
    };
  } finally {
    await session.destroy();
  }
}
