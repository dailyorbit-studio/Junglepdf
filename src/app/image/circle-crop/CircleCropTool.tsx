"use client";

import { useState } from "react";
import FileToolRunner, { OptionGroup, ChoiceRow } from "@/components/FileToolRunner";
import {
  circleCrop,
  CIRCLE_CROP_DEFAULTS,
  COMPOSE_FORMAT_LABELS,
  type ComposeFormat,
  type ComposeResult,
} from "@/lib/image-compose";

const FORMATS = (Object.keys(COMPOSE_FORMAT_LABELS) as ComposeFormat[]).map((value) => ({
  value,
  label: COMPOSE_FORMAT_LABELS[value],
}));

export default function CircleCropTool() {
  const [options, setOptions] = useState(CIRCLE_CROP_DEFAULTS);
  const transparent = options.format !== "image/jpeg";

  return (
    <FileToolRunner<ComposeResult & { notice?: string | null }>
      accept=".jpg,.jpeg,.png,.webp,.avif,.gif,.bmp"
      maxFileSizeMB={50}
      dropLabel="Drop an image here, or click to browse"
      dropSublabel="JPG, PNG, WebP, AVIF, GIF or BMP — up to 50MB"
      run={(file, onProgress) => circleCrop(file, options, onProgress)}
      actionLabel="Crop to circle"
      busyLabel="Cropping…"
      resultTitle="Circle cropped"
      resultDetail={(result) => `${result.width}×${result.height}, square canvas`}
      downloadLabel="Download image"
      againLabel="Crop another"
      hint="The output is square and taken from the centre of the picture — a circle has to crop something, and the middle is where a face usually is. Crop it yourself first if you want a different part."
      options={(disabled) => (
        <div className="space-y-4">
          <OptionGroup
            label="Format"
            hint={
              transparent
                ? "PNG and WebP keep the corners transparent."
                : "JPEG cannot store transparency, so the corners get the background colour."
            }
          >
            <ChoiceRow
              value={options.format}
              options={FORMATS}
              onChange={(format) => setOptions((o) => ({ ...o, format }))}
              disabled={disabled}
            />
          </OptionGroup>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="circle-border" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Ring width — {options.borderWidth}px
              </label>
              <input
                id="circle-border"
                type="range"
                min={0}
                max={40}
                value={options.borderWidth}
                disabled={disabled}
                onChange={(e) => setOptions((o) => ({ ...o, borderWidth: Number(e.target.value) }))}
                className="w-full accent-accent"
              />
            </div>

            <div>
              <label htmlFor="circle-ring-color" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Ring colour
              </label>
              <input
                id="circle-ring-color"
                type="color"
                value={options.borderColor}
                disabled={disabled || options.borderWidth === 0}
                onChange={(e) => setOptions((o) => ({ ...o, borderColor: e.target.value }))}
                className="w-full h-9 rounded border border-border bg-surface disabled:opacity-40"
              />
            </div>
          </div>

          {!transparent && (
            <div>
              <label htmlFor="circle-bg" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Corner colour
              </label>
              <input
                id="circle-bg"
                type="color"
                value={options.background}
                disabled={disabled}
                onChange={(e) => setOptions((o) => ({ ...o, background: e.target.value }))}
                className="w-full h-9 rounded border border-border bg-surface"
              />
            </div>
          )}
        </div>
      )}
    />
  );
}
