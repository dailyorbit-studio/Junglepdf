"use client";

import { useState } from "react";
import FileToolRunner, { OptionGroup } from "@/components/FileToolRunner";
import { pngToIco, ICO_SIZES, DEFAULT_ICO_SIZES, type IcoSize, type IcoResult } from "@/lib/ico";

export default function PngToIcoTool() {
  const [sizes, setSizes] = useState<IcoSize[]>(DEFAULT_ICO_SIZES);

  const toggle = (size: IcoSize) =>
    setSizes((current) =>
      current.includes(size) ? current.filter((s) => s !== size) : [...current, size].sort((a, b) => a - b)
    );

  return (
    <FileToolRunner<IcoResult>
      accept=".png,.jpg,.jpeg,.webp,.gif,.bmp"
      maxFileSizeMB={20}
      dropLabel="Drop a PNG here, or click to browse"
      dropSublabel="PNG, JPG, WebP, GIF or BMP — square works best"
      canRun={sizes.length > 0}
      run={(file, onProgress) => pngToIco(file, sizes, onProgress)}
      actionLabel="Create .ico"
      busyLabel="Building icon…"
      resultTitle="Icon created"
      resultDetail={(result) =>
        `${result.sizes.join(", ")}px in one file — ${(result.byteLength / 1024).toFixed(1)}KB`
      }
      downloadLabel="Download .ico"
      againLabel="Do another"
      hint="One .ico holds every size you pick, and Windows or the browser chooses the right one for each context. 16px is the browser tab, 32px the taskbar, 48px the desktop."
      options={(disabled) => (
        <OptionGroup
          label="Sizes to include"
          hint="More sizes means a slightly larger file and a sharper icon everywhere it appears."
        >
          <div className="flex flex-wrap gap-2">
            {ICO_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                disabled={disabled}
                onClick={() => toggle(size)}
                aria-pressed={sizes.includes(size)}
                className={`px-3 py-2 text-xs rounded-md border transition-colors disabled:opacity-50 ${
                  sizes.includes(size)
                    ? "border-accent bg-accent-subtle text-accent"
                    : "border-border text-ink-secondary hover:bg-surface-raised"
                }`}
              >
                {size}px
              </button>
            ))}
          </div>
          {sizes.length === 0 && (
            <p className="text-xs text-error mt-2">Pick at least one size.</p>
          )}
        </OptionGroup>
      )}
    />
  );
}
