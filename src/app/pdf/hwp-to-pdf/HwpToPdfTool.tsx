"use client";

import DocumentToPdfTool from "@/components/DocumentToPdfTool";
import { hwpToPDF, describeLosses } from "@/lib/hwp-to-pdf";

export default function HwpToPdfTool() {
  return (
    <DocumentToPdfTool
      convert={(file, options, onProgress) => hwpToPDF(file, options, onProgress)}
      accept=".hwpx"
      maxFileSizeMB={50}
      dropLabel="Choose an HWPX file"
      dropSublabel=".hwpx up to 50MB — classic .hwp is not readable"
      caveatTitle="What this can and cannot do"
      caveats={describeLosses()}
      footnote={
        <p className="text-xs text-ink-muted">
          Korean text will convert to question marks. Drawing Hangul in a PDF needs
          an embedded Korean font of several megabytes, which is not shipped here —
          so this is useful for a Latin-script HWPX and not for a Korean one.
        </p>
      }
    />
  );
}
