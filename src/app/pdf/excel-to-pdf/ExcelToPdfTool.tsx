"use client";

import { useState } from "react";
import DocumentToPdfTool from "@/components/DocumentToPdfTool";
import { excelToPDF, type ExcelToPdfOptions } from "@/lib/excel-to-pdf";

export default function ExcelToPdfTool() {
  const [landscape, setLandscape] = useState(true);
  const [headerRow, setHeaderRow] = useState(true);
  const [allSheets, setAllSheets] = useState(true);

  return (
    <DocumentToPdfTool
      convert={(file, options, onProgress) =>
        excelToPDF(file, options as unknown as ExcelToPdfOptions, onProgress)
      }
      accept=".xlsx"
      maxFileSizeMB={50}
      dropLabel="Drop an Excel workbook here, or click to browse"
      dropSublabel=".xlsx up to 50MB"
      extraOptions={{ landscape, headerRow, allSheets }}
      caveatTitle="What comes across from a spreadsheet"
      caveats={[
        "Cell values, including dates and the last computed value of formulas",
        "Every sheet, each starting on a new page",
        "Columns are given equal width — cell widths are not carried over",
        "Colours, borders, merged cells, charts and images are dropped",
      ]}
      extraControls={
        <div className="space-y-2">
          <span className="block text-xs font-medium text-ink-secondary">Sheet handling</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={landscape}
              onChange={(e) => setLandscape(e.target.checked)}
              className="accent-accent"
            />
            <span className="text-xs text-ink-secondary">
              Landscape pages — fits more columns
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={headerRow}
              onChange={(e) => setHeaderRow(e.target.checked)}
              className="accent-accent"
            />
            <span className="text-xs text-ink-secondary">
              Treat the first row as a header
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSheets}
              onChange={(e) => setAllSheets(e.target.checked)}
              className="accent-accent"
            />
            <span className="text-xs text-ink-secondary">
              Convert every sheet, not just the first
            </span>
          </label>
        </div>
      }
    />
  );
}
