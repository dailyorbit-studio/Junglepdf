/**
 * Flatten PDF — pdf-lib
 *
 * "Flatten" means: take the parts of a PDF that are still live — form fields
 * that can be typed into, checkboxes that can be ticked — and bake their
 * current appearance into the page as ordinary content. What was an editable
 * field becomes printed text.
 *
 * This is the thing people actually want when they say "make my filled-in form
 * final": the values stop being changeable, and every viewer renders them
 * identically instead of depending on its own form support. It is also what
 * fixes a filled form that prints blank, which happens when a viewer saves the
 * field values without generating appearance streams for them.
 *
 * What it is not: encryption. A flattened PDF is not locked, protected or
 * read-only — the page content can still be edited by a tool that edits page
 * content. Saying that plainly matters, because "flatten" gets sold elsewhere
 * as a security measure and it is not one.
 */

import { PDFDocument } from "pdf-lib";
import { loadPDF, inspectFeatures } from "./pdf-utils";
import type { ProgressFn } from "./ffmpeg";

export interface FlattenResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  /** Form fields that were baked into the page. */
  fieldsFlattened: number;
  /** True when there was nothing to flatten and the file came back unchanged. */
  nothingToDo: boolean;
  notice: string | null;
}

export async function flattenPDF(
  file: File,
  onProgress?: ProgressFn
): Promise<FlattenResult> {
  onProgress?.("Reading PDF…", 10);

  const doc = await loadPDF(await file.arrayBuffer(), file.name);
  const pageCount = doc.getPageCount();

  onProgress?.("Looking for form fields…", 30);

  let fieldsFlattened = 0;
  let partial = false;

  try {
    const form = doc.getForm();
    const fields = form.getFields();
    fieldsFlattened = fields.length;

    if (fields.length > 0) {
      onProgress?.(`Flattening ${fields.length} fields…`, 55);
      try {
        form.flatten();
      } catch {
        // A field with a missing or malformed appearance stream takes the
        // whole flatten down with it. Retry field by field so one bad widget
        // costs one field instead of the entire document.
        partial = true;
        fieldsFlattened = 0;
        for (const field of fields) {
          try {
            field.enableReadOnly();
            form.flatten({ updateFieldAppearances: false });
            fieldsFlattened += 1;
          } catch {
            // Leave this one live rather than failing the conversion.
          }
        }
      }
    }
  } catch {
    // No AcroForm at all — getForm() throws on some malformed catalogs.
    fieldsFlattened = 0;
  }

  onProgress?.("Saving…", 85);

  const bytes = await doc.save();
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });

  onProgress?.("Done", 100);

  const notes: string[] = [];
  if (fieldsFlattened === 0) {
    // Distinguish "already flat" from "failed" — an unchanged file with no
    // explanation reads as the tool doing nothing.
    notes.push(
      "No interactive form fields were found, so there was nothing to flatten. The file has been re-saved unchanged — if you were trying to lock it against editing, flattening is not what does that."
    );
  }
  if (partial) {
    notes.push(
      "Some fields had damaged appearance data and were left interactive rather than dropped."
    );
  }

  return {
    blob,
    filename: file.name.replace(/\.pdf$/i, "") + "-flattened.pdf",
    pageCount,
    fieldsFlattened,
    nothingToDo: fieldsFlattened === 0,
    notice: notes.length > 0 ? notes.join(" ") : null,
  };
}

/** Whether a PDF has anything worth flattening — used for the pre-run hint. */
export async function hasFormFields(file: File): Promise<boolean> {
  try {
    const doc = await PDFDocument.load(await file.arrayBuffer());
    return inspectFeatures(doc).hasFormFields;
  } catch {
    return false;
  }
}
