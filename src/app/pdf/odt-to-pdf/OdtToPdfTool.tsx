"use client";

import DocumentToPdfTool from "@/components/DocumentToPdfTool";
import { odtToPDF } from "@/lib/office-open-to-pdf";

export default function OdtToPdfTool() {
  return (
    <DocumentToPdfTool
      convert={(file, options, onProgress) => odtToPDF(file, options, onProgress)}
      accept=".odt"
      maxFileSizeMB={50}
      dropLabel="Choose an ODT file"
      dropSublabel=".odt up to 50MB"
    />
  );
}
