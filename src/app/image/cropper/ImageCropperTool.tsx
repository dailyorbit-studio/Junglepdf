"use client";

import { useState, useCallback, useRef } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import {
  cropImage,
  ASPECT_PRESETS,
  type CropRect,
  type CropResult,
} from "@/lib/image-cropper";
import { FORMAT_LABELS, formatUsesQuality, type OutputFormat } from "@/lib/image-converter";
import { downloadBlob } from "@/lib/download";
import { useObjectUrl } from "@/hooks/use-object-url";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FORMATS: OutputFormat[] = ["image/jpeg", "image/png", "image/webp"];

/** Drag state lives in a ref — a re-render per pointermove would stutter. */
interface DragState {
  mode: "draw" | "move";
  startX: number;
  startY: number;
  origin: CropRect;
}

export default function ImageCropperTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useObjectUrl();
  const [natural, setNatural] = useState({ w: 0, h: 0 });

  // The selection is stored in *natural image pixels*, so it survives the
  // element being resized by a window resize or an orientation change.
  const [rect, setRect] = useState<CropRect | null>(null);
  const [aspectIndex, setAspectIndex] = useState(0);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState(0.9);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<CropResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const ratio = ASPECT_PRESETS[aspectIndex].ratio;

  const handleFiles = useCallback(
    (files: File[]) => {
      const selected = files[0];
      setFile(selected);
      setResult(null);
      setError(null);
      setRect(null);
      setPreview(selected);

      const url = URL.createObjectURL(selected);
      const img = new Image();
      img.onload = () => {
        setNatural({ w: img.naturalWidth, h: img.naturalHeight });
        // Start with a centred selection covering 80% — an empty canvas with
        // no visible affordance reads as "nothing happened".
        const w = Math.round(img.naturalWidth * 0.8);
        const h = Math.round(img.naturalHeight * 0.8);
        setRect({
          x: Math.round((img.naturalWidth - w) / 2),
          y: Math.round((img.naturalHeight - h) / 2),
          width: w,
          height: h,
        });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setError("This image couldn't be read. It may be corrupted or in an unsupported format.");
        setFile(null);
        setPreview(null);
      };
      img.src = url;
    },
    [setPreview]
  );

  /** Pixels-per-display-pixel, for converting pointer coords to image space. */
  const scaleFactor = () => {
    const el = imageRef.current;
    if (!el || el.clientWidth === 0) return 1;
    return natural.w / el.clientWidth;
  };

  const clampRect = useCallback(
    (candidate: CropRect): CropRect => {
      let { x, y, width, height } = candidate;

      width = Math.max(8, Math.min(width, natural.w));
      height = Math.max(8, Math.min(height, natural.h));
      x = Math.max(0, Math.min(x, natural.w - width));
      y = Math.max(0, Math.min(y, natural.h - height));

      return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
    },
    [natural]
  );

  /** Force a rect to the locked aspect ratio, shrinking rather than growing. */
  const applyRatio = useCallback(
    (candidate: CropRect): CropRect => {
      if (ratio === null) return candidate;
      const byWidth = candidate.width / ratio;
      if (byWidth <= candidate.height) {
        return { ...candidate, height: byWidth };
      }
      return { ...candidate, width: candidate.height * ratio };
    },
    [ratio]
  );

  const pointerToImage = (e: React.PointerEvent) => {
    const el = imageRef.current;
    if (!el) return { x: 0, y: 0 };
    const bounds = el.getBoundingClientRect();
    const s = scaleFactor();
    return {
      x: (e.clientX - bounds.left) * s,
      y: (e.clientY - bounds.top) * s,
    };
  };

  const handlePointerDown = (e: React.PointerEvent, mode: DragState["mode"]) => {
    if (processing) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    const p = pointerToImage(e);
    dragRef.current = {
      mode,
      startX: p.x,
      startY: p.y,
      origin: rect ?? { x: p.x, y: p.y, width: 0, height: 0 },
    };

    if (mode === "draw") {
      setRect({ x: p.x, y: p.y, width: 0, height: 0 });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    e.preventDefault();

    const p = pointerToImage(e);

    if (drag.mode === "move") {
      setRect(
        clampRect({
          ...drag.origin,
          x: drag.origin.x + (p.x - drag.startX),
          y: drag.origin.y + (p.y - drag.startY),
        })
      );
      return;
    }

    // Draw: the anchor is wherever the drag started, so dragging up or left
    // has to flip the rect rather than produce a negative width.
    const x = Math.min(drag.startX, p.x);
    const y = Math.min(drag.startY, p.y);
    const width = Math.abs(p.x - drag.startX);
    const height = Math.abs(p.y - drag.startY);

    setRect(clampRect(applyRatio({ x, y, width, height })));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    dragRef.current = null;

    // A click without a drag leaves a sliver. Treat it as "no change" rather
    // than silently cropping to 8×8.
    setRect((current) => {
      if (!current) return current;
      if (current.width < 16 || current.height < 16) {
        const w = Math.round(natural.w * 0.8);
        const h = Math.round(natural.h * 0.8);
        return clampRect(
          applyRatio({
            x: Math.round((natural.w - w) / 2),
            y: Math.round((natural.h - h) / 2),
            width: w,
            height: h,
          })
        );
      }
      return current;
    });
  };

  const selectAspect = (index: number) => {
    setAspectIndex(index);
    const preset = ASPECT_PRESETS[index];
    if (preset.ratio === null || !rect) return;

    // Re-fit the existing selection to the new ratio, keeping its centre.
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    let width = rect.width;
    let height = width / preset.ratio;
    if (height > natural.h) {
      height = natural.h;
      width = height * preset.ratio;
    }
    setRect(clampRect({ x: cx - width / 2, y: cy - height / 2, width, height }));
  };

  const selectAll = () => {
    setAspectIndex(0);
    setRect({ x: 0, y: 0, width: natural.w, height: natural.h });
  };

  const handleCrop = useCallback(async () => {
    if (!file || !rect) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await cropImage(file, { rect, format, quality }, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while cropping.");
    } finally {
      setProcessing(false);
    }
  }, [file, rect, format, quality]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setRect(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setAspectIndex(0);
  };

  // Selection rendered as percentages, so it tracks the image element at any
  // display size without a resize listener.
  const overlayStyle = rect
    ? {
        left: `${(rect.x / natural.w) * 100}%`,
        top: `${(rect.y / natural.h) * 100}%`,
        width: `${(rect.width / natural.w) * 100}%`,
        height: `${(rect.height / natural.h) * 100}%`,
      }
    : undefined;

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".jpg,.jpeg,.png,.webp,.avif,.bmp"
          maxFileSizeMB={50}
          onFiles={handleFiles}
          label="Choose an image"
          sublabel="JPEG, PNG, WebP, AVIF, BMP — up to 50MB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-6">
          <div className="relative select-none bg-surface-raised rounded-lg overflow-hidden border border-border-subtle">
            {preview && (
              <div
                className="relative touch-none cursor-crosshair"
                onPointerDown={(e) => handlePointerDown(e, "draw")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {/* No max-height on the image: the overlay is positioned in
                    percentages of this element, so its box has to stay exactly
                    the displayed image. A max-height would letterbox it and
                    shift every selection off the pixels it names. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={preview}
                  alt="Drag on this image to select the area to keep"
                  className="w-full h-auto block pointer-events-none"
                  draggable={false}
                />

                {rect && rect.width > 0 && (
                  /* The dim outside the selection is an enormous spread
                     shadow, clipped by the overflow-hidden wrapper — one
                     element instead of four positioned scrims. */
                  <div
                    className="absolute border-2 border-accent cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
                    style={overlayStyle}
                    onPointerDown={(e) => handlePointerDown(e, "move")}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  >
                    <span className="absolute -top-6 left-0 px-1.5 py-0.5 rounded bg-accent text-white text-[10px] font-medium whitespace-nowrap">
                      {Math.round(rect.width)} × {Math.round(rect.height)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-ink-muted">
            Drag on the image to draw a new selection, or drag inside the box to move it.
          </p>

          <div className="space-y-4">
            <div>
              <span className="block text-xs font-medium text-ink-secondary mb-1.5">
                Aspect ratio
              </span>
              <div className="flex flex-wrap gap-2">
                {ASPECT_PRESETS.map((preset, i) => (
                  <button
                    key={preset.label}
                    onClick={() => selectAspect(i)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                      aspectIndex === i
                        ? "border-accent bg-accent-subtle text-accent"
                        : "border-border text-ink-muted hover:text-ink"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  onClick={selectAll}
                  className="px-3 py-1.5 text-xs rounded-md border border-border text-ink-muted hover:text-ink transition-colors"
                >
                  Whole image
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="crop-format" className="block text-xs font-medium text-ink-secondary mb-1">
                  Format
                </label>
                <select
                  id="crop-format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as OutputFormat)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink"
                >
                  {FORMATS.map((f) => (
                    <option key={f} value={f}>
                      {FORMAT_LABELS[f]}
                    </option>
                  ))}
                </select>
              </div>
              {formatUsesQuality(format) && (
                <div>
                  <label htmlFor="crop-quality" className="block text-xs font-medium text-ink-secondary mb-1">
                    Quality ({Math.round(quality * 100)}%)
                  </label>
                  <input
                    id="crop-quality"
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

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleCrop}
              disabled={processing || !rect || rect.width < 8}
              className="flex-1 btn btn-primary"
            >
              {processing
                ? "Cropping…"
                : rect
                  ? `Crop to ${Math.round(rect.width)} × ${Math.round(rect.height)}`
                  : "Crop"}
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
            title="Image cropped"
            detail={`${result.width} × ${result.height} px · ${formatBytes(result.blob.size)}`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Crop another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
