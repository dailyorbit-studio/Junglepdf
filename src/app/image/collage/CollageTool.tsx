"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import { OptionGroup, ChoiceRow } from "@/components/FileToolRunner";
import {
  createCollage,
  COLLAGE_DEFAULTS,
  COLLAGE_LAYOUT_LABELS,
  COMPOSE_FORMAT_LABELS,
  type CollageLayout,
  type ComposeFormat,
  type ComposeResult,
} from "@/lib/image-compose";
import { downloadBlob } from "@/lib/download";

const LAYOUTS = (Object.keys(COLLAGE_LAYOUT_LABELS) as CollageLayout[]).map((value) => ({
  value,
  label: COLLAGE_LAYOUT_LABELS[value],
}));

const FORMATS = (Object.keys(COMPOSE_FORMAT_LABELS) as ComposeFormat[]).map((value) => ({
  value,
  label: COMPOSE_FORMAT_LABELS[value],
}));

/** Multi-file, and the order matters, so this does not use FileToolRunner. */
export default function CollageTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState(COLLAGE_DEFAULTS);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ComposeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback((incoming: File[]) => {
    setFiles((current) => [...current, ...incoming].slice(0, 20));
    setResult(null);
    setError(null);
  }, []);

  const move = (index: number, delta: number) => {
    setFiles((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleRun = useCallback(async () => {
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await createCollage(files, options, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setProcessing(false);
    }
  }, [files, options]);

  const reset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  if (result) {
    return (
      <div className="space-y-5">
        <ResultBanner
          title="Collage created"
          detail={`${result.width}×${result.height} — ${(result.blob.size / (1024 * 1024)).toFixed(1)}MB`}
        />
        <div className="flex gap-3">
          <button
            onClick={() => downloadBlob(result.blob, result.filename)}
            className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
          >
            Download collage
          </button>
          <button
            onClick={reset}
            className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised rounded-lg transition-colors duration-150"
          >
            Start again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FileDropZone
        accept=".jpg,.jpeg,.png,.webp,.avif,.gif,.bmp"
        multiple
        maxFiles={20}
        maxFileSizeMB={30}
        onFiles={addFiles}
        label={files.length === 0 ? "Drop images here, or click to browse" : "Add more images"}
        sublabel="Two or more, up to 20 — JPG, PNG, WebP, AVIF, GIF or BMP"
      />

      {files.length > 0 && (
        <div className="border border-border rounded-lg divide-y divide-border-subtle">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center gap-3 px-3 py-2.5">
              <span className="text-xs text-ink-muted w-5 shrink-0">{index + 1}</span>
              <p className="text-sm text-ink truncate flex-1">{file.name}</p>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || processing}
                  aria-label={`Move ${file.name} earlier`}
                  className="px-2 py-1 text-xs rounded border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(index, 1)}
                  disabled={index === files.length - 1 || processing}
                  aria-label={`Move ${file.name} later`}
                  className="px-2 py-1 text-xs rounded border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  onClick={() => setFiles((c) => c.filter((_, i) => i !== index))}
                  disabled={processing}
                  aria-label={`Remove ${file.name}`}
                  className="px-2 py-1 text-xs rounded border border-border text-ink-muted hover:bg-surface-raised disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length >= 2 && (
        <>
          <OptionGroup label="Layout">
            <ChoiceRow
              value={options.layout}
              options={LAYOUTS}
              onChange={(layout) => setOptions((o) => ({ ...o, layout }))}
              disabled={processing}
            />
          </OptionGroup>

          {options.layout === "grid" && (
            <div>
              <label htmlFor="collage-columns" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Columns — {options.columns}
              </label>
              <input
                id="collage-columns"
                type="range"
                min={2}
                max={6}
                value={options.columns}
                disabled={processing}
                onChange={(e) => setOptions((o) => ({ ...o, columns: Number(e.target.value) }))}
                className="w-full accent-accent"
              />
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="collage-gap" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Gap — {options.gap}px
              </label>
              <input
                id="collage-gap"
                type="range"
                min={0}
                max={80}
                value={options.gap}
                disabled={processing}
                onChange={(e) => setOptions((o) => ({ ...o, gap: Number(e.target.value) }))}
                className="w-full accent-accent"
              />
            </div>

            <div>
              <label htmlFor="collage-bg" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Background
              </label>
              <input
                id="collage-bg"
                type="color"
                value={options.background}
                disabled={processing}
                onChange={(e) => setOptions((o) => ({ ...o, background: e.target.value }))}
                className="w-full h-9 rounded border border-border bg-surface"
              />
            </div>

            <OptionGroup label="Format">
              <ChoiceRow
                value={options.format}
                options={FORMATS}
                onChange={(format) => setOptions((o) => ({ ...o, format }))}
                disabled={processing}
              />
            </OptionGroup>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            Every cell is sized to the largest image, and each picture is centred in
            its cell at its own proportions — nothing is stretched to fit.
          </p>
        </>
      )}

      {processing && <ProgressBar progress={progress} label={progressLabel} />}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <div className="flex gap-3">
        <button
          onClick={handleRun}
          disabled={processing || files.length < 2}
          className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
        >
          {processing ? "Composing…" : "Create collage"}
        </button>
        {files.length > 0 && (
          <button
            onClick={reset}
            disabled={processing}
            className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-40 rounded-lg transition-colors duration-150"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
