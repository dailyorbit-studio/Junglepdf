"use client";

import { useState } from "react";
import FileToolRunner, { OptionGroup, ChoiceRow, NumberField } from "@/components/FileToolRunner";
import {
  splitImage,
  COMPOSE_FORMAT_LABELS,
  type ComposeFormat,
  type SplitResult,
} from "@/lib/image-compose";

const FORMATS = (Object.keys(COMPOSE_FORMAT_LABELS) as ComposeFormat[]).map((value) => ({
  value,
  label: COMPOSE_FORMAT_LABELS[value],
}));

const PRESETS = [
  { columns: 3, rows: 1, label: "3 × 1" },
  { columns: 3, rows: 3, label: "3 × 3 (Instagram)" },
  { columns: 2, rows: 2, label: "2 × 2" },
  { columns: 4, rows: 4, label: "4 × 4" },
];

export default function SplitImageTool() {
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(3);
  const [format, setFormat] = useState<ComposeFormat>("image/png");

  return (
    <FileToolRunner<SplitResult & { notice?: string | null }>
      accept=".jpg,.jpeg,.png,.webp,.avif,.gif,.bmp"
      maxFileSizeMB={50}
      dropLabel="Drop an image here, or click to browse"
      dropSublabel="JPG, PNG, WebP, AVIF, GIF or BMP — up to 50MB"
      canRun={!(columns === 1 && rows === 1)}
      run={(file, onProgress) =>
        splitImage(file, { columns, rows, format, quality: 0.92 }, onProgress)
      }
      actionLabel="Split image"
      busyLabel="Cutting…"
      resultTitle="Image split"
      resultDetail={(result) =>
        `${result.tileCount} tiles, about ${result.tileWidth}×${result.tileHeight} each`
      }
      downloadLabel="Download tiles (ZIP)"
      againLabel="Split another"
      hint="Tiles are numbered left to right, top to bottom, with zero padding so they sort correctly in a file manager. The last column and row absorb any leftover pixels rather than losing them."
      options={(disabled) => (
        <div className="space-y-4">
          <OptionGroup label="Common grids">
            <ChoiceRow
              value={`${columns}x${rows}`}
              options={PRESETS.map((p) => ({ value: `${p.columns}x${p.rows}`, label: p.label }))}
              onChange={(value) => {
                const [c, r] = String(value).split("x").map(Number);
                setColumns(c);
                setRows(r);
              }}
              disabled={disabled}
            />
          </OptionGroup>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              id="split-columns"
              label="Columns"
              value={columns}
              min={1}
              max={20}
              disabled={disabled}
              onChange={setColumns}
            />
            <NumberField
              id="split-rows"
              label="Rows"
              value={rows}
              min={1}
              max={20}
              disabled={disabled}
              onChange={setRows}
            />
          </div>

          <OptionGroup label="Tile format">
            <ChoiceRow value={format} options={FORMATS} onChange={setFormat} disabled={disabled} />
          </OptionGroup>

          <p className="text-xs text-ink-muted">
            {columns} × {rows} = <span className="text-ink">{columns * rows} tiles</span>
          </p>
        </div>
      )}
    />
  );
}
