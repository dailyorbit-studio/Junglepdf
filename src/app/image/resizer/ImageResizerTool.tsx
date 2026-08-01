"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import { resizeImage, type ResizeOptions } from "@/lib/image-resizer";
import { downloadBlob } from "@/lib/download";
import { useObjectUrl } from "@/hooks/use-object-url";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const pxToMm = (px: number, dpi: number) => (px / dpi) * 25.4;
const mmToPx = (mm: number, dpi: number) => (mm / 25.4) * dpi;

export default function ImageResizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useObjectUrl();
  const [originalDimensions, setOriginalDimensions] = useState({ w: 0, h: 0 });

  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [unit, setUnit] = useState<"px" | "mm">("px");
  const [dpi, setDpi] = useState(300);
  const [format, setFormat] = useState<ResizeOptions["format"]>("image/jpeg");
  const [quality, setQuality] = useState(0.9);
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: File[]) => {
      const selected = files[0];
      setFile(selected);
      setResult(null);
      setError(null);
      setPreview(selected);
      setUnit("px");

      const url = URL.createObjectURL(selected);
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ w: img.naturalWidth, h: img.naturalHeight });
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
        setAspectRatio(img.naturalWidth / img.naturalHeight);
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        // Without this the URL would leak whenever decoding fails.
        URL.revokeObjectURL(url);
        setError("This image couldn't be read. It may be corrupted or in an unsupported format.");
        setFile(null);
        setPreview(null);
      };
      img.src = url;
    },
    [setPreview]
  );

  // Switching units converts the current values. Without this, "800" px
  // silently becomes "800" mm — a 9448px image at 300 DPI.
  const switchUnit = (next: "px" | "mm") => {
    if (next === unit) return;
    const convert = next === "mm" ? pxToMm : mmToPx;
    setWidth((w) => Math.max(1, Math.round(convert(w, dpi))));
    setHeight((h) => Math.max(1, Math.round(convert(h, dpi))));
    setUnit(next);
  };

  const updateWidth = (w: number) => {
    setWidth(w);
    if (lockAspect) setHeight(Math.max(1, Math.round(w / aspectRatio)));
  };

  const updateHeight = (h: number) => {
    setHeight(h);
    if (lockAspect) setWidth(Math.max(1, Math.round(h * aspectRatio)));
  };

  const handleResize = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const options: ResizeOptions = { width, height, unit, dpi, format, quality };
      const output = await resizeImage(file, options, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult({ blob: output.blob, width: output.width, height: output.height });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during resizing.");
    } finally {
      setProcessing(false);
    }
  }, [file, width, height, unit, dpi, format, quality]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const targetPixels =
    unit === "mm"
      ? { w: Math.round(mmToPx(width, dpi)), h: Math.round(mmToPx(height, dpi)) }
      : { w: width, h: height };

  const isUpscaling =
    originalDimensions.w > 0 &&
    (targetPixels.w > originalDimensions.w || targetPixels.h > originalDimensions.h);

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".jpg,.jpeg,.png,.webp,.bmp"
          maxFileSizeMB={50}
          onFiles={handleFiles}
          label="Choose an image"
          sublabel="JPEG, PNG, WebP, BMP — up to 50MB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-5">
            {preview && (
              <div className="sm:w-36 sm:h-36 w-full h-44 rounded-lg overflow-hidden bg-surface-raised border border-border-subtle flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview of the selected image" className="w-full h-full object-contain" />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <p className="text-sm font-medium text-ink truncate">{file.name}</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {originalDimensions.w} × {originalDimensions.h} px &middot; {formatBytes(file.size)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => switchUnit("px")}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${unit === "px" ? "border-accent bg-accent-subtle text-accent" : "border-border text-ink-muted"}`}
                >
                  Pixels
                </button>
                <button
                  onClick={() => switchUnit("mm")}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${unit === "mm" ? "border-accent bg-accent-subtle text-accent" : "border-border text-ink-muted"}`}
                >
                  Millimeters
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="resize-width" className="block text-xs font-medium text-ink-secondary mb-1">
                    Width ({unit})
                  </label>
                  <input
                    id="resize-width"
                    type="number"
                    min={1}
                    max={unit === "px" ? 10000 : 2000}
                    value={width}
                    onChange={(e) => updateWidth(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
                <div>
                  <label htmlFor="resize-height" className="block text-xs font-medium text-ink-secondary mb-1">
                    Height ({unit})
                  </label>
                  <input
                    id="resize-height"
                    type="number"
                    min={1}
                    max={unit === "px" ? 10000 : 2000}
                    value={height}
                    onChange={(e) => updateHeight(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
              </div>

              {unit === "mm" && (
                <p className="text-xs text-ink-muted">
                  → {targetPixels.w} × {targetPixels.h} px at {dpi} DPI
                </p>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => setLockAspect(e.target.checked)}
                  className="accent-accent"
                />
                <span className="text-xs text-ink-secondary">Lock aspect ratio</span>
              </label>

              {unit === "mm" && (
                <div>
                  <span className="block text-xs font-medium text-ink-secondary mb-1">DPI</span>
                  <div className="flex gap-2">
                    {[72, 150, 300].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDpi(d)}
                        className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${dpi === d ? "border-accent bg-accent-subtle text-accent" : "border-border text-ink-muted"}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="resize-format" className="block text-xs font-medium text-ink-secondary mb-1">
                    Format
                  </label>
                  <select
                    id="resize-format"
                    value={format}
                    onChange={(e) => setFormat(e.target.value as ResizeOptions["format"])}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink"
                  >
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WebP</option>
                  </select>
                </div>
                {format !== "image/png" && (
                  <div>
                    <label htmlFor="resize-quality" className="block text-xs font-medium text-ink-secondary mb-1">
                      Quality ({Math.round(quality * 100)}%)
                    </label>
                    <input
                      id="resize-quality"
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full accent-accent mt-2"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {isUpscaling && (
            <NoticeMessage>
              You&apos;re enlarging past the original {originalDimensions.w} × {originalDimensions.h}
              px. The extra pixels are interpolated, so the result will look softer than the source.
            </NoticeMessage>
          )}

          {format === "image/jpeg" && (
            <p className="text-xs text-ink-muted">
              JPEG has no transparency — any transparent areas will be filled with white.
            </p>
          )}

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleResize}
              disabled={processing}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Resizing…" : "Resize image"}
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

      {result && file && (
        <div className="space-y-5">
          <ResultBanner
            title="Image resized"
            detail={`${result.width} × ${result.height} px · ${formatBytes(result.blob.size)}`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                const ext =
                  format === "image/png" ? "png" : format === "image/webp" ? "webp" : "jpg";
                const baseName = file.name.replace(/\.[^.]+$/, "");
                downloadBlob(result.blob, `${baseName}_${result.width}x${result.height}.${ext}`);
              }}
              className="flex-1 btn btn-primary"
            >
              Download
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Resize another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
