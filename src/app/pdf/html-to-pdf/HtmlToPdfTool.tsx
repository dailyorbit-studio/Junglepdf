"use client";

import DocumentToPdfTool from "@/components/DocumentToPdfTool";
import { htmlToPDF } from "@/lib/html-to-pdf";

export default function HtmlToPdfTool() {
  return (
    <DocumentToPdfTool
      convert={(file, options, onProgress) => htmlToPDF(file, options, onProgress)}
      accept=".html,.htm,.xhtml"
      maxFileSizeMB={25}
      dropLabel="Drop an HTML file here, or click to browse"
      dropSublabel=".html or .htm up to 25MB"
      caveatTitle="Structure, not styling"
      caveats={[
        "Headings, lists, tables, links and code blocks are kept",
        "CSS is not applied — this is not a screenshot of the page",
        "Remote images, stylesheets and scripts are never downloaded",
        "Images embedded in the file as data: URIs are included",
      ]}
      footnote={
        <p className="text-xs text-ink-muted">
          Nothing in the file is fetched over the network. A page that builds itself
          with JavaScript will convert as whatever text is actually in the saved
          HTML, which is often very little.
        </p>
      }
    />
  );
}
