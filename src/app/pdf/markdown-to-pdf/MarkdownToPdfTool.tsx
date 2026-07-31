"use client";

import DocumentToPdfTool from "@/components/DocumentToPdfTool";
import { markdownToPDF, describeMarkdownLimits } from "@/lib/markdown-to-pdf";
import type { DocLayoutOptions } from "@/lib/pdf-layout";

/**
 * Thin client wrapper: the page shell is a server component and a function
 * cannot cross that boundary, so the engine is bound here.
 */
export default function MarkdownToPdfTool() {
  return (
    <DocumentToPdfTool
      convert={(file, options, onProgress) =>
        markdownToPDF(file, options as DocLayoutOptions, onProgress)
      }
      accept=".md,.markdown,.mdown,.mkd,.txt"
      maxFileSizeMB={10}
      dropLabel="Drop a Markdown file here, or click to browse"
      dropSublabel=".md, .markdown or .txt — up to 10MB"
      actionLabel="Convert to PDF"
      caveatTitle="What converts"
      caveats={describeMarkdownLimits()}
    />
  );
}
