"use client";

import { useState } from "react";
import FileToolRunner, { OptionGroup, ChoiceRow } from "@/components/FileToolRunner";
import { nupPDF, NUP_LABELS, type NupLayout, type PageOpResult } from "@/lib/pdf-page-ops";

const LAYOUTS = (Object.keys(NUP_LABELS) as unknown as NupLayout[]).map((value) => ({
  value: Number(value) as NupLayout,
  label: NUP_LABELS[Number(value) as NupLayout],
}));

const GAPS = [
  { value: 0, label: "None" },
  { value: 8, label: "Small" },
  { value: 16, label: "Medium" },
  { value: 28, label: "Large" },
];

export default function NupPdfTool() {
  const [layout, setLayout] = useState<NupLayout>(2);
  const [gap, setGap] = useState(16);
  const [drawBorders, setDrawBorders] = useState(false);

  return (
    <FileToolRunner<PageOpResult>
      accept=".pdf"
      maxFileSizeMB={100}
      dropLabel="Drop a PDF here, or click to browse"
      dropSublabel="Up to 100MB"
      run={(file, onProgress) => nupPDF(file, { layout, gap, drawBorders }, onProgress)}
      actionLabel="Combine pages"
      busyLabel="Arranging…"
      resultTitle="Pages combined"
      resultDetail={(result) =>
        `${result.pageCount} pages onto ${result.outputPageCount} sheet${
          result.outputPageCount === 1 ? "" : "s"
        }`
      }
      downloadLabel="Download combined PDF"
      againLabel="Do another"
      hint="Pages are embedded rather than rasterised, so the text in a 4-up handout is still selectable and searchable — just smaller."
      options={(disabled) => (
        <div className="space-y-4">
          <OptionGroup label="Layout">
            <ChoiceRow value={layout} options={LAYOUTS} onChange={setLayout} disabled={disabled} />
          </OptionGroup>

          <OptionGroup label="Gap between pages">
            <ChoiceRow value={gap} options={GAPS} onChange={setGap} disabled={disabled} />
          </OptionGroup>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={drawBorders}
              disabled={disabled}
              onChange={(e) => setDrawBorders(e.target.checked)}
              className="accent-accent"
            />
            <span className="text-sm text-ink-secondary">
              Draw a hairline around each page
            </span>
          </label>
        </div>
      )}
    />
  );
}
