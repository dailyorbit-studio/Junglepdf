"use client";

import FileToolRunner from "@/components/FileToolRunner";
import { pdfToCsv, type PdfToCsvResult } from "@/lib/pdf-to-excel";

export default function PdfToCsvTool() {
  return (
    <FileToolRunner<PdfToCsvResult>
      accept=".pdf"
      maxFileSizeMB={100}
      dropLabel="Drop a PDF here, or click to browse"
      dropSublabel="Up to 100MB"
      run={(file, onProgress) => pdfToCsv(file, onProgress)}
      actionLabel="Extract to CSV"
      busyLabel="Extracting…"
      resultTitle="Table extracted"
      resultDetail={(result) =>
        `${result.rowCount} rows × ${result.columnCount} columns from ${result.pageCount} page${
          result.pageCount === 1 ? "" : "s"
        }`
      }
      downloadLabel="Download CSV"
      againLabel="Do another"
      hint="Columns are reconstructed from where the text sits on the page, so a clean grid comes out clean and a ragged layout comes out ragged. This reads the text layer — a scanned PDF has none, and would need OCR."
    />
  );
}
