"use client";

import FileToolRunner from "@/components/FileToolRunner";
import { csvToExcel, type CsvToExcelResult } from "@/lib/csv";

export default function CsvToExcelTool() {
  return (
    <FileToolRunner<CsvToExcelResult>
      accept=".csv,.tsv,.txt"
      maxFileSizeMB={25}
      dropLabel="Drop a CSV here, or click to browse"
      dropSublabel="CSV or TSV — up to 25MB"
      run={(file, onProgress) => csvToExcel(file, onProgress)}
      actionLabel="Convert to Excel"
      busyLabel="Converting…"
      resultTitle="Workbook created"
      resultDetail={(result) => `${result.rowCount} rows × ${result.columnCount} columns`}
      downloadLabel="Download .xlsx"
      againLabel="Convert another"
      hint="Every cell is written as text, so a leading zero on a phone number survives and “3-4” stays “3-4” instead of becoming a date. That is the whole reason to do this rather than double-clicking the CSV."
    />
  );
}
