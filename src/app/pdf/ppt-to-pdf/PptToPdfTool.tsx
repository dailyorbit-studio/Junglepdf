"use client";

import { useState } from "react";
import DocumentToPdfTool from "@/components/DocumentToPdfTool";
import { pptxToPDF, describeLosses, type PptxToPdfOptions } from "@/lib/pptx-to-pdf";

export default function PptToPdfTool() {
  const [includeNotes, setIncludeNotes] = useState(false);
  const [numberSlides, setNumberSlides] = useState(true);
  const [landscape, setLandscape] = useState(false);

  return (
    <DocumentToPdfTool
      convert={(file, options, onProgress) =>
        pptxToPDF(file, options as unknown as PptxToPdfOptions, onProgress)
      }
      accept=".pptx"
      maxFileSizeMB={100}
      dropLabel="Drop a PowerPoint file here, or click to browse"
      dropSublabel=".pptx up to 100MB"
      extraOptions={{ includeNotes, numberSlides, landscape }}
      caveatTitle="Content, not slide design"
      caveats={describeLosses()}
      footnote={
        <p className="text-xs text-ink-muted">
          This produces a readable document of what the deck says — one page per
          slide. It does not render slides as pictures. For a visual copy, use
          PowerPoint&apos;s own Export to PDF.
        </p>
      }
      extraControls={
        <div className="space-y-2">
          <span className="block text-xs font-medium text-ink-secondary">Slide handling</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={numberSlides}
              onChange={(e) => setNumberSlides(e.target.checked)}
              className="accent-accent"
            />
            <span className="text-xs text-ink-secondary">Number each slide heading</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeNotes}
              onChange={(e) => setIncludeNotes(e.target.checked)}
              className="accent-accent"
            />
            <span className="text-xs text-ink-secondary">Include speaker notes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={landscape}
              onChange={(e) => setLandscape(e.target.checked)}
              className="accent-accent"
            />
            <span className="text-xs text-ink-secondary">
              Landscape pages — closer to a slide&apos;s shape
            </span>
          </label>
        </div>
      }
    />
  );
}
