/**
 * CSV parsing and serialising, plus the three tools built on it.
 *
 * The parser is written out rather than pulled from a library because the
 * whole of RFC 4180 is about 60 lines and the alternative is shipping a
 * dependency to every visitor of every tool that imports this.
 *
 * The two writers deliberately reuse engines that already exist:
 * `renderBlocksToPdf` from pdf-layout for the PDF, and `writeXlsx` from
 * pdf-to-excel for the workbook. Neither needed a change to serve a second
 * caller, which is the point of both having been factored that way.
 */
import {
  renderBlocksToPdf,
  createSanitizer,
  buildNotice,
  plain,
  type Block,
  type DocLayoutOptions,
} from "./pdf-layout";
import { writeXlsx } from "./pdf-to-excel";
import type { ProgressFn } from "./ffmpeg";

/* ────────────────────────────── parsing ────────────────────────────── */

/**
 * Delimiter sniffing.
 *
 * Counts candidates outside quoted regions on the first few lines and takes
 * the winner. Worth doing rather than assuming a comma: European exports use
 * semicolons as a matter of course, because the comma is their decimal
 * separator, and treating one of those as a single-column file is the most
 * common way a CSV tool appears broken.
 */
export function sniffDelimiter(text: string): string {
  const sample = text.slice(0, 8192);
  const candidates = [",", ";", "\t", "|"];
  let best = ",";
  let bestScore = -1;

  for (const delimiter of candidates) {
    let count = 0;
    let inQuotes = false;
    for (let i = 0; i < sample.length; i++) {
      const ch = sample[i];
      if (ch === '"') inQuotes = !inQuotes;
      else if (!inQuotes && ch === delimiter) count++;
    }
    if (count > bestScore) {
      bestScore = count;
      best = delimiter;
    }
  }

  return best;
}

/**
 * RFC 4180 parse: quoted fields may contain the delimiter, newlines, and
 * doubled quotes to mean a literal one.
 *
 * Handles CRLF, LF and lone-CR line endings, because a CSV exported from an
 * old Mac application still turns up occasionally and splitting on "\n" alone
 * would return it as a single enormous row.
 */
export function parseCsv(text: string, delimiter?: string): string[][] {
  // A UTF-8 BOM survives as U+FEFF and would otherwise become part of the
  // first header cell, so "Name" silently stops matching "Name".
  const input = text.replace(/^﻿/, "");
  const sep = delimiter ?? sniffDelimiter(input);

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const endField = () => {
    row.push(field);
    field = "";
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') inQuotes = true;
    else if (ch === sep) endField();
    else if (ch === "\r") {
      endRow();
      if (input[i + 1] === "\n") i++;
    } else if (ch === "\n") endRow();
    else field += ch;
  }

  // Trailing field, unless the file ended on a line break.
  if (field.length > 0 || row.length > 0) endRow();

  // Drop a single trailing empty row — the artefact of a file ending in a
  // newline, which almost every well-formed CSV does.
  if (rows.length > 0 && rows[rows.length - 1].every((cell) => cell === "")) rows.pop();

  return rows;
}

/** Serialise back to CSV, quoting only where the spec requires it. */
export function toCsv(rows: string[][], delimiter = ","): string {
  const needsQuotes = (value: string) =>
    value.includes(delimiter) || value.includes('"') || /[\r\n]/.test(value);

  return rows
    .map((row) =>
      row
        .map((cell) => (needsQuotes(cell) ? `"${cell.replace(/"/g, '""')}"` : cell))
        .join(delimiter)
    )
    .join("\r\n");
}

/** Pad short rows so every row has the same length as the widest. */
function rectangular(rows: string[][]): string[][] {
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
  return rows.map((row) => (row.length === width ? row : [...row, ...Array(width - row.length).fill("")]));
}

/* ─────────────────────────── CSV → PDF ─────────────────────────── */

export interface CsvToPdfOptions extends DocLayoutOptions {
  /** Treat the first row as a header — bold, and repeated on later pages. */
  headerRow: boolean;
  /** Show the file name as a heading above the table. */
  includeTitle: boolean;
}

export interface CsvTableResult {
  blob: Blob;
  filename: string;
  rowCount: number;
  columnCount: number;
  notice: string | null;
}

/**
 * Render a CSV as a real table in a PDF.
 *
 * Landscape is forced past six columns: `drawTable` divides the content width
 * evenly, and at portrait A4 a seven-column table gives each cell about 65pt,
 * which is roughly one short word per line.
 */
export async function csvToPDF(
  file: File,
  options: CsvToPdfOptions,
  onProgress?: ProgressFn
): Promise<CsvTableResult> {
  onProgress?.("Reading CSV…", 10);

  const rows = rectangular(parseCsv(await file.text()));

  if (rows.length === 0) {
    throw new Error("This file has no rows in it. An empty CSV has nothing to lay out.");
  }

  const columnCount = rows[0].length;

  onProgress?.("Laying out the table…", 40);

  // The caller owns the sanitizer so one count covers the whole file — cell
  // text goes through it before it reaches the renderer, which assumes clean
  // input.
  const sanitize = createSanitizer();

  const blocks: Block[] = [];

  if (options.includeTitle) {
    blocks.push({
      kind: "heading",
      level: 1,
      spans: plain(sanitize(file.name.replace(/\.(csv|tsv|txt)$/i, ""))),
    });
  }

  blocks.push({
    kind: "table",
    rows: rows.map((cells, index) => ({
      cells: cells.map((cell) => plain(sanitize(cell))),
      header: options.headerRow && index === 0,
    })),
  });

  const result = await renderBlocksToPdf(
    blocks,
    { ...options, landscape: options.landscape ?? columnCount > 6 },
    { title: file.name.replace(/\.[^.]+$/, ""), creator: "JunglePDF CSV to PDF" },
    onProgress
  );

  onProgress?.("Done", 100);

  const notes: string[] = [];
  if (columnCount > 12) {
    notes.push(
      `${columnCount} columns is more than a page can show legibly — every column gets an equal share of the width, so wide tables end up with one word per line.`
    );
  }
  const encodingNotice = buildNotice(result.skippedImages, sanitize.dropped);
  if (encodingNotice) notes.push(encodingNotice);

  return {
    blob: result.blob,
    filename: file.name.replace(/\.[^.]+$/, "") + ".pdf",
    rowCount: rows.length,
    columnCount,
    notice: notes.length > 0 ? notes.join(" ") : null,
  };
}

/* ────────────────────────── CSV → Excel ────────────────────────── */

export interface CsvToExcelResult {
  blob: Blob;
  filename: string;
  rowCount: number;
  columnCount: number;
  notice: string | null;
}

/**
 * Wrap a CSV in a real .xlsx.
 *
 * Worth a tool of its own because opening a CSV in Excel is where phone
 * numbers lose their leading zeros and "3-4" becomes a date: the import
 * guesses types per cell, and it guesses badly. `writeXlsx` writes every cell
 * as an inline string, so what you typed is what the sheet holds.
 */
export async function csvToExcel(
  file: File,
  onProgress?: ProgressFn
): Promise<CsvToExcelResult> {
  onProgress?.("Reading CSV…", 15);

  const rows = rectangular(parseCsv(await file.text()));

  if (rows.length === 0) {
    throw new Error("This file has no rows in it. There is nothing to put in a sheet.");
  }

  onProgress?.("Writing workbook…", 60);

  const sheetName = file.name.replace(/\.[^.]+$/, "").slice(0, 31) || "Sheet1";
  const blob = await writeXlsx([{ name: sheetName, rows }], { textOnly: true });

  onProgress?.("Done", 100);

  return {
    blob,
    filename: file.name.replace(/\.[^.]+$/, "") + ".xlsx",
    rowCount: rows.length,
    columnCount: rows[0].length,
    notice:
      rows.length > 50000
        ? "This is a large sheet — expect the workbook to take a moment to open."
        : null,
  };
}
