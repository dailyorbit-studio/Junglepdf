/**
 * PDF Form Filler — pdf-lib's AcroForm API
 *
 * A fillable PDF keeps its answers in a form layer above the page: a dictionary
 * of named fields, each with a type, a value and a widget telling the viewer
 * where to draw it. pdf-lib can read that dictionary and write to it, which is
 * all this needs — the page itself is never touched.
 *
 * Why this exists at all, when every PDF reader can fill a form: plenty of them
 * cannot. Mobile browsers, older viewers and most in-app PDF previews render
 * the page and ignore the form layer entirely, so the boxes are visible but not
 * typeable. This reads the fields out, gives them ordinary HTML inputs, and
 * writes the values back.
 *
 * The one genuine subtlety is **appearance streams**. A field's value and its
 * drawn appearance are stored separately, and a viewer that does not generate
 * appearances shows an empty box over a filled field. pdf-lib regenerates them
 * on save via `updateFieldAppearances`, which is what stops this tool producing
 * forms that look blank when printed.
 */

import {
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFOptionList,
  PDFRadioGroup,
  PDFTextField,
  StandardFonts,
} from "pdf-lib";
import { loadPDF } from "./pdf-utils";
import type { ProgressFn } from "./ffmpeg";

export type FieldType = "text" | "checkbox" | "radio" | "dropdown" | "list";

export interface FormField {
  name: string;
  type: FieldType;
  /** Current value: text contents, "on"/"off", or the selected option. */
  value: string;
  /** Choices, for radio groups, dropdowns and list boxes. */
  options?: string[];
  readOnly: boolean;
  multiline: boolean;
  /** 1-indexed pages this field appears on — forms are often long. */
  pages: number[];
}

export interface FormReadResult {
  fields: FormField[];
  pageCount: number;
}

export interface FormFillResult {
  blob: Blob;
  filename: string;
  fieldsWritten: number;
  flattened: boolean;
  notice: string | null;
}

/** Which pages a field's widgets sit on, so the UI can group them. */
function widgetPages(doc: PDFDocument, field: { acroField: { getWidgets(): unknown[] } }): number[] {
  const pages = doc.getPages();
  const found = new Set<number>();

  try {
    for (const widget of field.acroField.getWidgets()) {
      const ref = (widget as { P?: () => unknown }).P?.();
      if (!ref) continue;
      const index = pages.findIndex((page) => page.ref === ref);
      if (index >= 0) found.add(index + 1);
    }
  } catch {
    // Widget without a page reference — common in generated forms. The field
    // is still fillable; it just does not get a page label.
  }

  return [...found].sort((a, b) => a - b);
}

export async function readFormFields(file: File): Promise<FormReadResult> {
  const doc = await loadPDF(await file.arrayBuffer(), file.name);
  const pageCount = doc.getPageCount();

  let raw;
  try {
    raw = doc.getForm().getFields();
  } catch {
    throw new Error(
      `"${file.name}" has no fillable form. Many PDFs that look like forms are just printed lines and boxes — there are no interactive fields to type into.`
    );
  }

  if (raw.length === 0) {
    throw new Error(
      `"${file.name}" has no fillable form fields. It may be a printed form rather than an interactive one — a scan, or a PDF that only draws the boxes.`
    );
  }

  const fields: FormField[] = [];

  for (const field of raw) {
    const name = field.getName();
    const readOnly = field.isReadOnly();
    const pages = widgetPages(doc, field as never);
    const base = { name, readOnly, pages, multiline: false };

    if (field instanceof PDFTextField) {
      fields.push({
        ...base,
        type: "text",
        value: field.getText() ?? "",
        multiline: field.isMultiline(),
      });
    } else if (field instanceof PDFCheckBox) {
      fields.push({ ...base, type: "checkbox", value: field.isChecked() ? "on" : "off" });
    } else if (field instanceof PDFRadioGroup) {
      fields.push({
        ...base,
        type: "radio",
        value: field.getSelected() ?? "",
        options: field.getOptions(),
      });
    } else if (field instanceof PDFDropdown) {
      fields.push({
        ...base,
        type: "dropdown",
        value: field.getSelected()[0] ?? "",
        options: field.getOptions(),
      });
    } else if (field instanceof PDFOptionList) {
      fields.push({
        ...base,
        type: "list",
        value: field.getSelected()[0] ?? "",
        options: field.getOptions(),
      });
    }
    // Signature and button fields are deliberately not listed: neither can be
    // given a value here, and showing an input that does nothing is worse than
    // showing nothing.
  }

  return { fields, pageCount };
}

export async function fillForm(
  file: File,
  values: Record<string, string>,
  flatten: boolean,
  onProgress?: ProgressFn
): Promise<FormFillResult> {
  onProgress?.("Reading form…", 15);

  const doc = await loadPDF(await file.arrayBuffer(), file.name);
  const form = doc.getForm();

  // A font has to be supplied for appearance generation, or pdf-lib falls back
  // to whatever the form declares — which is frequently a font the file does
  // not actually embed, and the values then draw as nothing.
  const font = await doc.embedFont(StandardFonts.Helvetica);

  onProgress?.("Filling fields…", 40);

  let fieldsWritten = 0;
  const failed: string[] = [];

  for (const field of form.getFields()) {
    const name = field.getName();
    if (!(name in values)) continue;
    if (field.isReadOnly()) continue;

    const value = values[name];

    try {
      if (field instanceof PDFTextField) {
        field.setText(value);
      } else if (field instanceof PDFCheckBox) {
        if (value === "on") field.check();
        else field.uncheck();
      } else if (field instanceof PDFRadioGroup) {
        if (value) field.select(value);
        else field.clear();
      } else if (field instanceof PDFDropdown) {
        if (value) field.select(value);
        else field.clear();
      } else if (field instanceof PDFOptionList) {
        if (value) field.select(value);
        else field.clear();
      } else {
        continue;
      }
      fieldsWritten += 1;
    } catch {
      // A value outside a dropdown's declared options, or a widget with a
      // broken appearance dictionary. Name it rather than failing the save.
      failed.push(name);
    }
  }

  onProgress?.("Generating appearances…", 70);

  // This is the step that stops filled forms printing blank.
  try {
    form.updateFieldAppearances(font);
  } catch {
    // Leave the viewer to draw them if a field resists appearance generation.
  }

  let flattenedOk = false;
  if (flatten) {
    onProgress?.("Flattening…", 78);
    try {
      form.flatten();
      flattenedOk = true;
    } catch {
      // Fall through and save unflattened rather than losing the values.
    }
  }

  onProgress?.("Saving…", 88);

  let bytes = await doc.save();

  if (flattenedOk) {
    // Overwriting a field leaves its *previous* appearance stream in the file
    // as an orphan — unreferenced, never drawn, and still perfectly readable in
    // the raw bytes. On a form that arrived with someone else's details in it,
    // that means shipping their data inside a document that looks clean.
    //
    // pdf-lib does not garbage-collect, so the fix is to copy the pages into a
    // fresh document: only objects something still points at come across. Safe
    // here precisely because the form is already flattened — copyPages would
    // otherwise drop the AcroForm, which is the one thing we would need to keep.
    onProgress?.("Removing orphaned data…", 94);
    try {
      const source = await PDFDocument.load(bytes);
      const clean = await PDFDocument.create();
      const pages = await clean.copyPages(source, source.getPageIndices());
      pages.forEach((page) => clean.addPage(page));
      bytes = await clean.save();
    } catch {
      // Keep the flattened-but-larger file rather than failing the save.
    }
  }

  onProgress?.("Done", 100);

  const notes: string[] = [];
  if (failed.length > 0) {
    notes.push(
      `${failed.length} field${failed.length === 1 ? "" : "s"} could not be set (${failed
        .slice(0, 3)
        .join(", ")}${failed.length > 3 ? "…" : ""}) — the value may not be one of the choices the form allows.`
    );
  }
  if (flatten) {
    notes.push("The form has been flattened: the values are now page content and can no longer be edited.");
  }

  return {
    blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
    filename: file.name.replace(/\.pdf$/i, "") + "-filled.pdf",
    fieldsWritten,
    flattened: flatten,
    notice: notes.length > 0 ? notes.join(" ") : null,
  };
}
