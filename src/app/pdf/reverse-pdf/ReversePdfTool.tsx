"use client";

import FileToolRunner from "@/components/FileToolRunner";
import { reversePDF, type PageOpResult } from "@/lib/pdf-page-ops";

export default function ReversePdfTool() {
  return (
    <FileToolRunner<PageOpResult>
      accept=".pdf"
      maxFileSizeMB={100}
      dropLabel="Drop a PDF here, or click to browse"
      dropSublabel="Up to 100MB"
      run={(file, onProgress) => reversePDF(file, onProgress)}
      actionLabel="Reverse page order"
      busyLabel="Reversing…"
      resultTitle="Page order reversed"
      resultDetail={(result) => `${result.pageCount} pages, last to first`}
      downloadLabel="Download reversed PDF"
      againLabel="Reverse another"
      hint="Nothing is re-rendered — the pages are copied into a new document in the opposite order, so text stays text and images keep their resolution."
    />
  );
}
