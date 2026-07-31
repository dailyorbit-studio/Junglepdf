/**
 * Shared PDF loading and inspection helpers.
 */

import { PDFDocument, PDFName, PDFDict } from "pdf-lib";

/**
 * Load a PDF, translating pdf-lib's internal errors into messages a user
 * can act on.
 */
export async function loadPDF(
  bytes: ArrayBuffer,
  filename?: string
): Promise<PDFDocument> {
  const label = filename ? `"${filename}"` : "This PDF";
  try {
    const doc = await PDFDocument.load(bytes);

    // load() accepts a valid header with a broken body, and the failure only
    // surfaces later as a raw TypeError from deep inside pdf-lib. Touch the
    // page tree here so a malformed document is caught while we still have
    // the context to explain it.
    doc.getPageCount();

    return doc;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // pdf-lib throws EncryptedPDFError for password-protected documents.
    if (/encrypt/i.test(message)) {
      throw new Error(
        `${label} is password-protected. Remove the password in your PDF reader, then try again.`
      );
    }
    throw new Error(
      `${label} could not be read. It may be corrupted or not a valid PDF.`
    );
  }
}

export interface PDFFeatures {
  /** Interactive form fields (AcroForm) that page copying will not carry. */
  hasFormFields: boolean;
  /** Bookmarks / outline tree that page copying will not carry. */
  hasOutline: boolean;
}

/**
 * Detect document-level structures that `copyPages` leaves behind.
 *
 * pdf-lib copies page content and per-page annotations, but the AcroForm
 * dictionary and outline tree live on the catalog and are not carried over.
 * Callers surface this so we never silently drop a user's filled-in form.
 */
export function inspectFeatures(doc: PDFDocument): PDFFeatures {
  let hasFormFields = false;
  let hasOutline = false;

  try {
    const acroForm = doc.catalog.lookup(PDFName.of("AcroForm"));
    if (acroForm instanceof PDFDict) {
      const fields = acroForm.lookup(PDFName.of("Fields"));
      // An empty Fields array is an artifact of some writers, not a real form.
      hasFormFields = Boolean(
        fields && "size" in fields && (fields as { size: () => number }).size() > 0
      );
    }
  } catch {
    // Malformed catalog — treat as no form rather than failing the operation.
  }

  try {
    hasOutline = doc.catalog.lookup(PDFName.of("Outlines")) instanceof PDFDict;
  } catch {
    // Same.
  }

  return { hasFormFields, hasOutline };
}

/**
 * Parse a page range string like "1-3, 5, 7-10" into [start, end] tuples,
 * 1-indexed and inclusive.
 *
 * Lives here rather than in the splitter because four tools now accept the
 * same syntax, and they must reject the same typos in the same words.
 */
export function parsePageRanges(input: string, maxPage: number): [number, number][] {
  const ranges: [number, number][] = [];
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const bounds = part.split("-").map((s) => s.trim());

      // "1-3-5" is a typo, not a range — don't silently read it as 1-3.
      if (bounds.length !== 2) {
        throw new Error(
          `Invalid page range "${part}". Use a single dash, like "1-3".`
        );
      }

      const [startStr, endStr] = bounds;
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (
        !/^\d+$/.test(startStr) ||
        !/^\d+$/.test(endStr) ||
        start < 1 ||
        end > maxPage ||
        start > end
      ) {
        throw new Error(`Invalid page range "${part}". Pages must be between 1 and ${maxPage}.`);
      }

      ranges.push([start, end]);
    } else {
      const page = parseInt(part, 10);
      if (!/^\d+$/.test(part) || page < 1 || page > maxPage) {
        throw new Error(`Invalid page number "${part}". Must be between 1 and ${maxPage}.`);
      }
      ranges.push([page, page]);
    }
  }

  if (ranges.length === 0) {
    throw new Error("No valid page ranges provided.");
  }

  return ranges;
}

/**
 * Parse a range string into a sorted, de-duplicated list of 1-indexed pages.
 *
 * For tools that act on a *set* of pages rather than producing one output per
 * range — "1-3, 2" means three pages, not four.
 */
export function parsePageSelection(input: string, maxPage: number): number[] {
  const pages = new Set<number>();
  for (const [start, end] of parsePageRanges(input, maxPage)) {
    for (let p = start; p <= end; p++) pages.add(p);
  }
  return [...pages].sort((a, b) => a - b);
}

/** Human-readable warning for features that will be lost, or null. */
export function describeLostFeatures(features: PDFFeatures): string | null {
  const lost: string[] = [];
  if (features.hasFormFields) lost.push("interactive form fields");
  if (features.hasOutline) lost.push("bookmarks");
  if (lost.length === 0) return null;

  return `Heads up: ${lost.join(" and ")} can't be carried across this operation and won't appear in the output. Page content, text, and images are unaffected.`;
}
