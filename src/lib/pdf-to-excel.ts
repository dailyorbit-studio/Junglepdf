/**
 * PDF to Excel — column reconstruction, then a hand-written .xlsx
 *
 * This is the least certain conversion on the site, and it is worth being
 * honest about why. A PDF does not contain a table. It contains glyphs at
 * coordinates; the grid you see is drawn lines, and the "cells" are text that
 * happens to be positioned inside them. Nothing in the file says which runs
 * form a column.
 *
 * So the columns are inferred: every text run's left edge is collected across
 * the page, those positions are clustered, and each run is assigned to the
 * cluster it starts at. On a real table — an invoice, a statement, an exported
 * report — that recovers the grid well, because the producer aligned the
 * columns and the alignment is the only evidence there is. On prose it produces
 * one wide column, which is the correct answer to a question with no table in
 * it.
 *
 * Writing the .xlsx is the easy half: it is a zip of XML, and `inlineStr`
 * cells avoid needing a shared-string table at all. The same technique as
 * `pdf-to-word.ts` uses for .docx, for the same reason — no library needed.
 */

import { openForRender } from "./pdf-render";
import type { ProgressFn } from "./ffmpeg";

export interface PdfToExcelResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  /** Rows written across every sheet. */
  rowCount: number;
  /** Widest table found, in columns. */
  columnCount: number;
  notice: string | null;
}

export interface PdfToExcelOptions {
  /** One sheet per PDF page, or everything appended into one sheet. */
  sheetPerPage: boolean;
}

interface Run {
  text: string;
  x: number;
  y: number;
  width: number;
}

interface TextItemLike {
  str?: string;
  transform?: number[];
  width?: number;
  height?: number;
}

/** Pull positioned runs out of a page, dropping whitespace-only ones. */
function readRuns(items: TextItemLike[]): Run[] {
  const runs: Run[] = [];

  for (const item of items) {
    const text = (item.str ?? "").trim();
    if (text === "") continue;
    const transform = item.transform ?? [1, 0, 0, 1, 0, 0];
    runs.push({ text, x: transform[4], y: transform[5], width: item.width ?? 0 });
  }

  return runs;
}

/** Group runs sharing a baseline into rows, top of page first. */
function groupRows(runs: Run[], tolerance: number): Run[][] {
  const sorted = [...runs].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: Run[][] = [];

  for (const run of sorted) {
    const last = rows[rows.length - 1];
    if (last && Math.abs(last[0].y - run.y) <= tolerance) last.push(run);
    else rows.push([run]);
  }

  return rows.map((row) => row.sort((a, b) => a.x - b.x));
}

/**
 * Find the page's column positions.
 *
 * Left edges are collected from every run and clustered: positions within
 * `tolerance` of each other are the same column. A cluster has to be used by
 * more than one row to count — otherwise a single indented line invents a
 * column of its own and shifts everything after it.
 */
function findColumns(rows: Run[][], tolerance: number): number[] {
  const starts = rows.flatMap((row) => row.map((run) => run.x)).sort((a, b) => a - b);
  if (starts.length === 0) return [];

  const clusters: { position: number; count: number }[] = [];

  for (const x of starts) {
    const last = clusters[clusters.length - 1];
    if (last && x - last.position <= tolerance) {
      // Keep the leftmost position: cell text starts at the column edge.
      last.count += 1;
    } else {
      clusters.push({ position: x, count: 1 });
    }
  }

  const meaningful = clusters.filter((c) => c.count > 1);
  const chosen = (meaningful.length > 0 ? meaningful : clusters).map((c) => c.position);

  return chosen;
}

/** Place each row's runs into the column they start at. */
function buildGrid(rows: Run[][], columns: number[], tolerance: number): string[][] {
  if (columns.length === 0) return [];

  return rows.map((row) => {
    const cells = new Array<string>(columns.length).fill("");

    for (const run of row) {
      // The last column whose position is at or left of this run.
      let index = 0;
      for (let c = 0; c < columns.length; c++) {
        if (run.x >= columns[c] - tolerance) index = c;
        else break;
      }
      cells[index] = cells[index] ? `${cells[index]} ${run.text}` : run.text;
    }

    return cells;
  });
}

/* ────────────────────────── writing .xlsx ────────────────────────── */

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // Excel refuses to open a workbook containing raw control characters.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

/** 0 → A, 25 → Z, 26 → AA. */
function columnLetter(index: number): string {
  let n = index + 1;
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

/** Numbers are written as numbers so Excel can sum them; everything else is text. */
function cellXml(value: string, ref: string): string {
  if (value === "") return "";

  // Strip thousands separators and currency before testing — "1,234.50" and
  // "$99" are numbers to a person, and staying text makes the sheet useless.
  const numeric = value.replace(/[,\s]/g, "").replace(/^[$£€]/, "");
  if (/^-?\d+(\.\d+)?%?$/.test(numeric) && numeric !== "-") {
    if (numeric.endsWith("%")) {
      const asNumber = Number(numeric.slice(0, -1)) / 100;
      if (Number.isFinite(asNumber)) return `<c r="${ref}"><v>${asNumber}</v></c>`;
    } else if (Number.isFinite(Number(numeric))) {
      return `<c r="${ref}"><v>${Number(numeric)}</v></c>`;
    }
  }

  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function sheetXml(rows: string[][]): string {
  const body = rows
    .map((cells, r) => {
      const inner = cells
        .map((value, c) => cellXml(value, `${columnLetter(c)}${r + 1}`))
        .join("");
      return inner ? `<row r="${r + 1}">${inner}</row>` : "";
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`;
}

/** Excel rejects these characters in a sheet name, and duplicates. */
function safeSheetName(name: string, used: Set<string>): string {
  let clean = name.replace(/[\\/?*[\]:]/g, " ").trim().slice(0, 31) || "Sheet";
  let n = 2;
  while (used.has(clean.toLowerCase())) {
    const suffix = ` (${n})`;
    clean = clean.slice(0, 31 - suffix.length) + suffix;
    n += 1;
  }
  used.add(clean.toLowerCase());
  return clean;
}

async function writeXlsx(sheets: { name: string; rows: string[][] }[]): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  const sheetEntries = sheets.map((sheet, i) => ({
    ...sheet,
    id: i + 1,
    path: `xl/worksheets/sheet${i + 1}.xml`,
  }));

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
${sheetEntries
  .map(
    (s) =>
      `<Override PartName="/${s.path}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
  )
  .join("\n")}
</Types>`
  );

  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  );

  zip.file(
    "xl/workbook.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${sheetEntries
      .map((s) => `<sheet name="${escapeXml(s.name)}" sheetId="${s.id}" r:id="rId${s.id}"/>`)
      .join("")}</sheets></workbook>`
  );

  zip.file(
    "xl/_rels/workbook.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheetEntries
  .map(
    (s) =>
      `<Relationship Id="rId${s.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${s.id}.xml"/>`
  )
  .join("\n")}
</Relationships>`
  );

  for (const sheet of sheetEntries) zip.file(sheet.path, sheetXml(sheet.rows));

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

/* ────────────────────────── entry point ────────────────────────── */

export function describeLimits(): string[] {
  return [
    "Columns are inferred from where text sits — a PDF stores no table structure",
    "Works well on aligned tables; prose comes out as a single column",
    "Merged cells, borders, colours and formulas are not recovered",
    "Numbers are written as numbers so you can sum them",
  ];
}

export async function pdfToExcel(
  file: File,
  options: PdfToExcelOptions,
  onProgress?: ProgressFn
): Promise<PdfToExcelResult> {
  onProgress?.("Reading PDF…", 8);

  const session = await openForRender(await file.arrayBuffer(), file.name);

  try {
    const pageCount = session.doc.numPages;
    const sheets: { name: string; rows: string[][] }[] = [];
    const used = new Set<string>();
    const combined: string[][] = [];
    let columnCount = 0;
    let rowCount = 0;

    for (let n = 1; n <= pageCount; n++) {
      onProgress?.(`Reading page ${n} of ${pageCount}…`, 10 + Math.round((n / pageCount) * 70));

      const page = await session.doc.getPage(n);
      try {
        const content = await page.getTextContent();
        const runs = readRuns(content.items as TextItemLike[]);
        if (runs.length === 0) continue;

        // Tolerances scale with the text size so a 6pt statement and a 14pt
        // report both group sensibly.
        const heights = runs.map((r) => r.width / Math.max(1, r.text.length));
        const scale = heights.reduce((a, b) => a + b, 0) / heights.length || 5;
        const rowTolerance = Math.max(2, scale * 0.8);
        const columnTolerance = Math.max(4, scale * 1.8);

        const rows = groupRows(runs, rowTolerance);
        const columns = findColumns(rows, columnTolerance);
        const grid = buildGrid(rows, columns, columnTolerance);

        if (grid.length === 0) continue;

        columnCount = Math.max(columnCount, columns.length);
        rowCount += grid.length;

        if (options.sheetPerPage) {
          sheets.push({ name: safeSheetName(`Page ${n}`, used), rows: grid });
        } else {
          if (combined.length > 0) combined.push([]);
          combined.push(...grid);
        }
      } finally {
        page.cleanup();
      }
    }

    if (!options.sheetPerPage && combined.length > 0) {
      sheets.push({ name: safeSheetName("Extracted", used), rows: combined });
    }

    if (sheets.length === 0) {
      throw new Error(
        "No text was found in this PDF. It is almost certainly a scan — a picture of a page rather than text — and reading it would need OCR, which this tool does not do."
      );
    }

    onProgress?.("Writing workbook…", 88);

    const blob = await writeXlsx(sheets);

    onProgress?.("Done", 100);

    const notes: string[] = [];
    if (columnCount <= 1) {
      notes.push(
        "Only one column was detected, which usually means this PDF is prose rather than a table. The text is there, but there was no grid to recover."
      );
    }
    if (rowCount > 20000) {
      notes.push("This is a large extraction — expect the workbook to be slow to open.");
    }

    return {
      blob,
      filename: file.name.replace(/\.pdf$/i, "") + ".xlsx",
      pageCount,
      rowCount,
      columnCount,
      notice: notes.length > 0 ? notes.join(" ") : null,
    };
  } finally {
    await session.destroy();
  }
}
