"use client";

import DocumentToPdfTool from "@/components/DocumentToPdfTool";
import { rtfToPDF } from "@/lib/text-to-pdf";

export default function RtfToPdfTool() {
  return (
    <DocumentToPdfTool
      convert={(file, options, onProgress) => rtfToPDF(file, options, onProgress)}
      accept=".rtf"
      maxFileSizeMB={25}
      dropLabel="Drop an RTF file here, or click to browse"
      dropSublabel=".rtf up to 25MB"
      caveatTitle="What comes across from RTF"
      caveats={[
        "Paragraphs, bold and italic are kept",
        "Page breaks written into the file are honoured",
        "Fonts, colors, tables and embedded images are not carried over",
        "Headers, footers and footnotes are dropped",
      ]}
    />
  );
}
