"use client";

import DocumentToPdfTool from "@/components/DocumentToPdfTool";
import { epubToPDF } from "@/lib/office-open-to-pdf";

export default function EpubToPdfTool() {
  return (
    <DocumentToPdfTool
      convert={(file, options, onProgress) => epubToPDF(file, options, onProgress)}
      accept=".epub"
      maxFileSizeMB={100}
      dropLabel="Drop an EPUB here, or click to browse"
      dropSublabel=".epub up to 100MB"
      caveatTitle="How the book is laid out"
      caveats={[
        "Chapters are read in the book's own spine order",
        "Each chapter starts on a new page",
        "The publisher's typography and page design are replaced",
        "Covers, footnotes and the table of contents are not carried over",
      ]}
      footnote={
        <p className="text-xs text-ink-muted">
          DRM-protected books cannot be read. If you bought it from a store that
          locks its files, the chapters are encrypted and nothing here can open them.
        </p>
      }
    />
  );
}
