"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  applyFilters,
  toFilterString,
  isDefault,
  supportsCanvasFilters,
  DEFAULT_FILTERS,
  FILTER_PRESETS,
  type FilterSettings,
  type FilterResult,
} from "@/lib/image-filters";
import { downloadBlob } from "@/lib/download";

const FORMATS = [
  { value: "image/jpeg", label: "JPG", quality: 0.92 },
  { value: "image/png", label: "PNG", quality: 1 },
  { value: "image/webp", label: "WebP", quality: 0.92 },
];

const SLIDERS: {
  key: keyof FilterSettings;
  label: string;
  min: number;
  max: number;
  unit: string;
}[] = [
  { key: "brightness", label: "Brightness", min: 0, max: 200, unit: "%" },
  { key: "contrast", label: "Contrast", min: 0, max: 200, unit: "%" },
  { key: "saturate", label: "Saturation", min: 0, max: 200, unit: "%" },
  { key: "hueRotate", label: "Hue", min: 0, max: 360, unit: "°" },
  { key: "sepia", label: "Sepia", min: 0, max: 100, unit: "%" },
  { key: "grayscale", label: "Grayscale", min: 0, max: 100, unit: "%" },
  { key: "invert", label: "Invert", min: 0, max: 100, unit: "%" },
  { key: "blur", label: "Blur", min: 0, max: 20, unit: "px" },
];

export default function ImageFiltersTool() {
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [format, setFormat] = useState("image/jpeg");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Lazy initialiser rather than an effect: `ctx.filter` is a browser
  // capability, and the probe itself returns true when there is no document,
  // so the server render and the first client render agree. Nothing that
  // depends on this is visible until a file has been picked anyway.
  const [supported] = useState(() => supportsCanvasFilters());

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<FilterResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const urlRef = useRef<string | null>(null);
  useEffect(() => {
    urlRef.current = previewUrl;
  }, [previewUrl]);
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  const handleFiles = useCallback((files: File[]) => {
    const picked = files[0];
    setFile(picked);
    setResult(null);
    setError(null);
    setSettings(DEFAULT_FILTERS);
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(picked);
    });
  }, []);

  const handleApply = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const spec = FORMATS.find((f) => f.value === format) ?? FORMATS[0];
      const output = await applyFilters(file, settings, spec.value, spec.quality, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while applying filters.");
    } finally {
      setProcessing(false);
    }
  }, [file, settings, format]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setSettings(DEFAULT_FILTERS);
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
  };

  return (
    <>
      {!file && (
        <FileDropZone
          accept="image/*"
          maxFileSizeMB={50}
          onFiles={handleFiles}
          label="Choose an image"
          sublabel="JPG, PNG, WebP · up to 50MB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-6">
          {!supported && (
            <NoticeMessage>
              Your browser does not support canvas filters, so adjustments here would export
              unchanged. Try a current version of Chrome, Firefox, Edge or Safari.
            </NoticeMessage>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <span className="block text-xs font-medium text-ink-secondary mb-1.5">
                Live preview
              </span>
              <div className="bg-surface-raised border border-border rounded-lg overflow-hidden flex items-center justify-center min-h-[16rem]">
                {previewUrl && (
                  // The preview applies the same filter string the export will,
                  // so what you see is literally what gets encoded.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Preview with your adjustments applied"
                    style={{ filter: toFilterString(settings) }}
                    className="block max-w-full max-h-[26rem] h-auto"
                  />
                )}
              </div>
              <p className="text-xs text-ink-muted mt-1.5 truncate">{file.name}</p>
            </div>

            <div className="space-y-5">
              <div>
                <span className="block text-xs font-medium text-ink-secondary mb-1.5">Presets</span>
                <div className="flex flex-wrap gap-2">
                  {FILTER_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setSettings(preset.settings)}
                      className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                        toFilterString(settings) === toFilterString(preset.settings)
                          ? "border-accent bg-accent-subtle text-accent"
                          : "border-border text-ink-secondary hover:bg-surface-raised"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3.5 max-h-[22rem] overflow-y-auto pr-1">
                {SLIDERS.map(({ key, label, min, max, unit }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor={`f-${key}`} className="text-xs text-ink-secondary">
                        {label}
                      </label>
                      <span className="text-xs text-ink tabular-nums">
                        {settings[key]}
                        {unit}
                      </span>
                    </div>
                    <input
                      id={`f-${key}`}
                      type="range"
                      min={min}
                      max={max}
                      value={settings[key]}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, [key]: Number(e.target.value) }))
                      }
                      className="w-full accent-[var(--color-accent)]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-ink-secondary">Save as</span>
            {FORMATS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFormat(f.value)}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                  format === f.value
                    ? "border-accent bg-accent-subtle text-accent"
                    : "border-border text-ink-secondary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleApply}
              disabled={processing || isDefault(settings) || !supported}
              className="flex-1 btn btn-primary"
            >
              {processing
                ? "Applying…"
                : isDefault(settings)
                  ? "Move a slider or pick a preset"
                  : "Apply and export"}
            </button>
            <button
              onClick={() => setSettings(DEFAULT_FILTERS)}
              disabled={processing || isDefault(settings)}
              className="btn btn-secondary"
            >
              Reset
            </button>
            <button
              onClick={reset}
              disabled={processing}
              className="btn btn-secondary"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <ResultBanner
            title="Adjustments applied"
            detail={`${result.width} × ${result.height} · ${(result.blob.size / (1024 * 1024)).toFixed(2)} MB`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download edited image
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Another image
            </button>
          </div>
        </div>
      )}
    </>
  );
}
