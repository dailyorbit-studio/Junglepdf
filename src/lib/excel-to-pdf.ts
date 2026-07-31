/**
 * Excel to PDF — reading .xlsx without a spreadsheet library.
 *
 * An .xlsx is a zip of XML, so the parts that matter can be read with JSZip and
 * DOMParser, both already here. SheetJS would be about a megabyte to do the
 * same job, and most of what it does — formula evaluation, charts, pivot tables
 * — is irrelevant when the destination is a printed table.
 *
 * The four parts that matter:
 *
 *  - `xl/workbook.xml` names the sheets and their relationship ids
 *  - `xl/_rels/workbook.xml.rels` maps those ids to worksheet files
 *  - `xl/sharedStrings.xml` holds text, which cells reference by index rather
 *    than storing inline (the format deduplicates aggressively)
 *  - `xl/worksheets/sheetN.xml` holds the cells themselves
 *
 * Two things that look like details and are not:
 *
 *  - **Dates are numbers.** Excel stores a date as a day count from 1900 and
 *    tells you it is a date only through the cell's number format. Ignore that
 *    and every date in the document prints as 45678. So styles.xml is read and
 *    date-formatted cells are converted.
 *  - **Formulas are not evaluated.** The file caches each formula's last
 *    computed value, and that cached value is what gets used. A workbook saved
 *    by something that did not compute its formulas will show blanks — which is
 *    reported rather than silently rendered as empty cells.
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

export interface ExcelToPdfResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  sheetCount: number;
  /** Sheets that had no cells at all. */
  emptySheets: string[];
  unsupportedCharacters: number;
  notice: string | null;
}

/** Excel's built-in number format ids that mean "this is a date or a time". */
const BUILTIN_DATE_FORMATS = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 45, 46, 47]);

/** "BC12" → 12-ish: the zero-based column index encoded in a cell reference. */
function columnIndex(ref: string): number {
  const letters = ref.replace(/\d+$/, "");
  let n = 0;
  for (const char of letters) n = n * 26 + (char.charCodeAt(0) - 64);
  return n - 1;
}

/**
 * Excel's serial date → an ISO-ish string.
 *
 * Day 1 is 1900-01-01, but the epoch is offset by two: Excel deliberately
 * reproduces a Lotus 1-2-3 bug in which 1900 is treated as a leap year. Every
 * spreadsheet in existence depends on that bug, so it has to be reproduced too.
 */
function serialToDate(serial: number, timeOnly: boolean): string {
  const days = Math.floor(serial);
  const fraction = serial - days;
  const ms = Math.round(fraction * 86400) * 1000;
  const date = new Date(Date.UTC(1899, 11, 30) + days * 86400000 + ms);

  const pad = (n: number) => String(n).padStart(2, "0");
  const time = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;

  if (timeOnly) return time;

  const stamp = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  return fraction > 0 ? `${stamp} ${time}` : stamp;
}

type Zip = Awaited<ReturnType<typeof loadZip>>;

async function loadZip(file: File) {
  const { default: JSZip } = await import("jszip");
  try {
    return await JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    throw new Error(
      `"${file.name}" could not be opened. It is not a valid .xlsx archive — it may be corrupted, or an older .xls saved with the wrong extension.`
    );
  }
}

async function readXml(zip: Zip, path: string): Promise<Document | null> {
  const entry = zip.file(path);
  if (!entry) return null;
  return new DOMParser().parseFromString(await entry.async("string"), "application/xml");
}

/** Shared strings, in index order. Rich text runs are concatenated. */
async function readSharedStrings(zip: Zip): Promise<string[]> {
  const doc = await readXml(zip, "xl/sharedStrings.xml");
  if (!doc) return [];

  return [...doc.getElementsByTagName("*")]
    .filter((el) => el.localName === "si")
    .map((si) =>
      [...si.getElementsByTagName("*")]
        .filter((el) => el.localName === "t")
        .map((t) => t.textContent ?? "")
        .join("")
    );
}

/** Style index → whether that style formats its number as a date or a time. */
async function readDateStyles(zip: Zip): Promise<Map<number, "date" | "time">> {
  const styles = new Map<number, "date" | "time">();
  const doc = await readXml(zip, "xl/styles.xml");
  if (!doc) return styles;

  const all = [...doc.getElementsByTagName("*")];

  // Custom formats are declared by id; a format string containing y/d or a
  // bare h is the only signal available.
  const custom = new Map<number, "date" | "time">();
  for (const fmt of all.filter((el) => el.localName === "numFmt")) {
    const id = Number(fmt.getAttribute("numFmtId"));
    const code = (fmt.getAttribute("formatCode") ?? "").toLowerCase();
    if (/[yd]/.test(code) || /\bm{3,}/.test(code)) custom.set(id, "date");
    else if (/h/.test(code)) custom.set(id, "time");
  }

  const cellXfs = all.find((el) => el.localName === "cellXfs");
  if (!cellXfs) return styles;

  [...cellXfs.children].forEach((xf, index) => {
    const id = Number(xf.getAttribute("numFmtId") ?? "0");
    if (BUILTIN_DATE_FORMATS.has(id)) {
      styles.set(index, id >= 45 && id <= 47 ? "time" : "date");
    } else if (custom.has(id)) {
      styles.set(index, custom.get(id)!);
    }
  });

  return styles;
}

interface SheetRef {
  name: string;
  path: string;
}

/** Sheet names and file paths, in the workbook's own tab order. */
async function readSheetList(zip: Zip): Promise<SheetRef[]> {
  const workbook = await readXml(zip, "xl/workbook.xml");
  const rels = await readXml(zip, "xl/_rels/workbook.xml.rels");
  if (!workbook) {
    throw new Error(
      "This archive has no xl/workbook.xml, so it is not an Excel workbook. Check the file was saved as .xlsx."
    );
  }

  const target = new Map<string, string>();
  if (rels) {
    for (const rel of [...rels.getElementsByTagName("*")].filter((el) => el.localName === "Relationship")) {
      const id = rel.getAttribute("Id");
      const path = rel.getAttribute("Target");
      if (id && path) target.set(id, path.replace(/^\/?(xl\/)?/, ""));
    }
  }

  const sheets: SheetRef[] = [];
  let fallback = 1;

  for (const sheet of [...workbook.getElementsByTagName("*")].filter((el) => el.localName === "sheet")) {
    const name = sheet.getAttribute("name") ?? `Sheet${fallback}`;
    // r:id is namespaced; getAttribute on the local name misses it in XML mode.
    const rid =
      sheet.getAttribute("r:id") ??
      sheet.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
    const path = rid ? target.get(rid) : undefined;
    sheets.push({ name, path: `xl/${path ?? `worksheets/sheet${fallback}.xml`}` });
    fallback += 1;
  }

  return sheets;
}

interface SheetData {
  name: string;
  rows: string[][];
}

async function readSheet(
  zip: Zip,
  ref: SheetRef,
  shared: string[],
  dateStyles: Map<number, "date" | "time">
): Promise<SheetData> {
  const doc = await readXml(zip, ref.path);
  if (!doc) return { name: ref.name, rows: [] };

  const rowsByNumber = new Map<number, string[]>();
  let widest = 0;

  for (const row of [...doc.getElementsByTagName("*")].filter((el) => el.localName === "row")) {
    const cells: string[] = [];

    for (const cell of [...row.children].filter((c) => c.localName === "c")) {
      const ref2 = cell.getAttribute("r") ?? "";
      const index = ref2 ? columnIndex(ref2) : cells.length;
      const type = cell.getAttribute("t");
      const styleIndex = Number(cell.getAttribute("s") ?? "-1");

      const kids = [...cell.children];
      const v = kids.find((k) => k.localName === "v");
      const is = kids.find((k) => k.localName === "is");

      let text = "";
      if (type === "s") {
        text = shared[Number(v?.textContent ?? "-1")] ?? "";
      } else if (type === "inlineStr") {
        text = is
          ? [...is.getElementsByTagName("*")]
              .filter((el) => el.localName === "t")
              .map((t) => t.textContent ?? "")
              .join("")
          : "";
      } else if (type === "b") {
        text = v?.textContent === "1" ? "TRUE" : "FALSE";
      } else if (type === "e") {
        text = v?.textContent ?? "#ERROR";
      } else {
        const raw = v?.textContent ?? "";
        const kind = dateStyles.get(styleIndex);
        if (kind && raw !== "" && Number.isFinite(Number(raw))) {
          text = serialToDate(Number(raw), kind === "time");
        } else {
          text = raw;
        }
      }

      // Sparse sheets skip empty cells entirely, so pad to the real column.
      while (cells.length < index) cells.push("");
      cells[index] = text;
    }

    const number = Number(row.getAttribute("r") ?? rowsByNumber.size + 1);
    rowsByNumber.set(number, cells);
    widest = Math.max(widest, cells.length);
  }

  // Blank rows are skipped in the file too; keep them so the table lines up.
  const numbers = [...rowsByNumber.keys()].sort((a, b) => a - b);
  const rows: string[][] = [];
  let previous = 0;
  for (const number of numbers) {
    for (let gap = previous + 1; gap < number; gap++) rows.push([]);
    const cells = rowsByNumber.get(number)!;
    while (cells.length < widest) cells.push("");
    rows.push(cells);
    previous = number;
  }

  // Trailing empty rows add pages of nothing.
  while (rows.length > 0 && rows[rows.length - 1].every((c) => c === "")) rows.pop();

  return { name: ref.name, rows };
}

function toSpans(text: string, sanitize: Sanitizer, bold: boolean): Span[] {
  return [{ text: sanitize(text), bold, italic: false }];
}

export interface ExcelToPdfOptions extends DocLayoutOptions {
  /** Treat each sheet's first row as a header. */
  headerRow: boolean;
  /** Convert every sheet, or only the first. */
  allSheets: boolean;
}

export async function excelToPDF(
  file: File,
  options: ExcelToPdfOptions,
  onProgress?: ProgressFn
): Promise<ExcelToPdfResult> {
  if (/\.xls$/i.test(file.name)) {
    throw new Error(
      "This is a legacy .xls file. Open it in Excel, LibreOffice or Google Sheets and save it as .xlsx, then try again — the old binary format cannot be read in a browser."
    );
  }

  onProgress?.("Opening workbook…", 8);

  const zip = await loadZip(file);
  const [shared, dateStyles, sheetRefs] = await Promise.all([
    readSharedStrings(zip),
    readDateStyles(zip),
    readSheetList(zip),
  ]);

  if (sheetRefs.length === 0) {
    throw new Error("This workbook has no sheets in it.");
  }

  const chosen = options.allSheets ? sheetRefs : sheetRefs.slice(0, 1);

  onProgress?.("Reading cells…", 20);

  const sanitize = createSanitizer();
  const blocks: Block[] = [];
  const emptySheets: string[] = [];
  let widestSheet = 0;

  for (let i = 0; i < chosen.length; i++) {
    onProgress?.(
      `Reading ${chosen[i].name}…`,
      20 + Math.round((i / chosen.length) * 18)
    );

    const sheet = await readSheet(zip, chosen[i], shared, dateStyles);

    if (sheet.rows.length === 0) {
      emptySheets.push(sheet.name);
      continue;
    }

    widestSheet = Math.max(widestSheet, ...sheet.rows.map((r) => r.length));

    if (blocks.length > 0) blocks.push({ kind: "pagebreak" });
    // The sheet name is the only label the data has; without it a multi-sheet
    // workbook becomes an unlabelled run of tables.
    if (chosen.length > 1) {
      blocks.push({ kind: "heading", level: 2, spans: toSpans(sheet.name, sanitize, true) });
    }

    blocks.push({
      kind: "table",
      rows: sheet.rows.map((cells, index) => ({
        cells: cells.map((cell) => toSpans(cell, sanitize, options.headerRow && index === 0)),
        header: options.headerRow && index === 0,
      })),
    });
  }

  if (blocks.length === 0) {
    throw new Error(
      "Every sheet in this workbook is empty — there were no cells to convert."
    );
  }

  onProgress?.("Laying out pages…", 40);

  const rendered = await renderBlocksToPdf(
    blocks,
    options,
    { title: file.name.replace(/\.xlsx$/i, ""), creator: "JunglePDF Excel to PDF" },
    onProgress
  );

  onProgress?.("Done", 100);

  const notes: string[] = [];
  const base = buildNotice(0, sanitize.dropped);
  if (base) notes.push(base);
  if (emptySheets.length > 0) {
    notes.push(
      `${emptySheets.length} empty sheet${emptySheets.length === 1 ? " was" : "s were"} skipped (${emptySheets.slice(0, 3).join(", ")}).`
    );
  }
  if (widestSheet > 8) {
    notes.push(
      `The widest sheet has ${widestSheet} columns. Columns are given equal width, so beyond about eight the text gets tight — landscape and narrow margins help.`
    );
  }

  return {
    blob: rendered.blob,
    filename: file.name.replace(/\.xlsx$/i, "") + ".pdf",
    pageCount: rendered.pageCount,
    sheetCount: chosen.length - emptySheets.length,
    emptySheets,
    unsupportedCharacters: sanitize.dropped,
    notice: notes.length > 0 ? notes.join(" ") : null,
  };
}
