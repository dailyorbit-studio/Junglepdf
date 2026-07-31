"use client";

import { useState } from "react";
import FileToolRunner, { OptionGroup, ChoiceRow } from "@/components/FileToolRunner";
import { csvToPDF, type CsvTableResult } from "@/lib/csv";
import {
  DEFAULT_LAYOUT,
  PAGE_SIZE_LABELS,
  type DocPageSize,
} from "@/lib/pdf-layout";

const PAGE_SIZES = (Object.keys(PAGE_SIZE_LABELS) as DocPageSize[]).map((value) => ({
  value,
  label: PAGE_SIZE_LABELS[value],
}));

const ORIENTATIONS = [
  { value: "auto", label: "Auto" },
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
] as const;

type Orientation = (typeof ORIENTATIONS)[number]["value"];

export default function CsvToPdfTool() {
  const [pageSize, setPageSize] = useState<DocPageSize>(DEFAULT_LAYOUT.pageSize);
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [headerRow, setHeaderRow] = useState(true);
  const [includeTitle, setIncludeTitle] = useState(false);

  return (
    <FileToolRunner<CsvTableResult>
      accept=".csv,.tsv,.txt"
      maxFileSizeMB={25}
      dropLabel="Drop a CSV here, or click to browse"
      dropSublabel="CSV or TSV — up to 25MB"
      run={(file, onProgress) =>
        csvToPDF(
          file,
          {
            ...DEFAULT_LAYOUT,
            pageSize,
            // "auto" leaves it undefined so the engine's own rule applies:
            // landscape past six columns.
            landscape: orientation === "auto" ? undefined : orientation === "landscape",
            headerRow,
            includeTitle,
          },
          onProgress
        )
      }
      actionLabel="Convert to PDF"
      busyLabel="Converting…"
      resultTitle="CSV converted"
      resultDetail={(result) => `${result.rowCount} rows × ${result.columnCount} columns`}
      downloadLabel="Download PDF"
      againLabel="Convert another"
      hint="The delimiter is detected automatically — comma, semicolon, tab or pipe — so a European export with semicolons works without being told."
      options={(disabled) => (
        <div className="space-y-4">
          <OptionGroup label="Page size">
            <ChoiceRow value={pageSize} options={PAGE_SIZES} onChange={setPageSize} disabled={disabled} />
          </OptionGroup>

          <OptionGroup
            label="Orientation"
            hint="Auto turns the page sideways once there are more than six columns."
          >
            <ChoiceRow
              value={orientation}
              options={ORIENTATIONS.map((o) => ({ value: o.value, label: o.label }))}
              onChange={setOrientation}
              disabled={disabled}
            />
          </OptionGroup>

          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={headerRow}
                disabled={disabled}
                onChange={(e) => setHeaderRow(e.target.checked)}
                className="accent-accent"
              />
              <span className="text-sm text-ink-secondary">
                First row is a header — bold, and repeated on every page
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTitle}
                disabled={disabled}
                onChange={(e) => setIncludeTitle(e.target.checked)}
                className="accent-accent"
              />
              <span className="text-sm text-ink-secondary">
                Put the file name at the top as a heading
              </span>
            </label>
          </div>
        </div>
      )}
    />
  );
}
