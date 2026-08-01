"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import {
  watermarkImage,
  WATERMARK_POSITIONS,
  type WatermarkPosition,
  type WatermarkResult,
} from "@/lib/image-watermark";
import { downloadBlob } from "@/lib/download";

const FORMATS = [
  { value: "image/jpeg", label: "JPG", quality: 0.92 },
  { value: "image/png", label: "PNG", quality: 1 },
  { value: "image/webp", label: "WebP", quality: 0.92 },
];

const COLORS = ["#FFFFFF", "#1C1917", "#DC2626", "#0D9488"];

export default function ImageWatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [position, setPosition] = useState<WatermarkPosition>("bottom-right");
  const [scale, setScale] = useState(0.06);
  const [opacity, setOpacity] = useState(0.6);
  const [rotation, setRotation] = useState(0);
  const [color, setColor] = useState("#FFFFFF");
  const [format, setFormat] = useState("image/jpeg");

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<WatermarkResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError(null);
  }, []);

  const handleApply = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const spec = FORMATS.find((f) => f.value === format) ?? FORMATS[0];
      const output = await watermarkImage(
        file,
        {
          text,
          position,
          scale,
          opacity,
          color,
          rotation: position === "tile" && rotation === 0 ? -30 : rotation,
          outputFormat: spec.value,
          quality: spec.quality,
        },
        (step, pct) => {
          setProgressLabel(step);
          setProgress(pct);
        }
      );
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while watermarking.");
    } finally {
      setProcessing(false);
    }
  }, [file, text, position, scale, opacity, color, rotation, format]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setText("");
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
          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>

          <div>
            <label htmlFor="wm-text" className="block text-xs font-medium text-ink-secondary mb-1.5">
              Watermark text
            </label>
            <input
              id="wm-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="© Your Name 2026"
              maxLength={120}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Position</span>
            <div className="grid grid-cols-3 gap-1.5 max-w-[16rem]">
              {WATERMARK_POSITIONS.filter((p) => p.value !== "tile").map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPosition(p.value)}
                  aria-label={p.label}
                  className={`h-9 rounded-md border text-[0.625rem] transition-colors ${
                    position === p.value
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border text-ink-muted hover:bg-surface-raised"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPosition("tile")}
              className={`mt-2 px-3 py-1.5 text-xs rounded-md border transition-colors ${
                position === "tile"
                  ? "border-accent bg-accent-subtle text-accent"
                  : "border-border text-ink-secondary hover:bg-surface-raised"
              }`}
            >
              Tile across the whole image
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="wm-size" className="text-xs font-medium text-ink-secondary">Size</label>
                <span className="text-xs text-ink tabular-nums">{Math.round(scale * 100)}%</span>
              </div>
              <input
                id="wm-size" type="range" min={1} max={25} value={scale * 100}
                onChange={(e) => setScale(Number(e.target.value) / 100)}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="wm-opacity" className="text-xs font-medium text-ink-secondary">Opacity</label>
                <span className="text-xs text-ink tabular-nums">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                id="wm-opacity" type="range" min={5} max={100} value={opacity * 100}
                onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="wm-angle" className="text-xs font-medium text-ink-secondary">Angle</label>
                <span className="text-xs text-ink tabular-nums">{rotation}°</span>
              </div>
              <input
                id="wm-angle" type="range" min={-90} max={90} value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-ink-secondary">Colour</span>
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={`Use ${c}`}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    color === c ? "border-accent scale-110" : "border-border"
                  }`}
                />
              ))}
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
          </div>

          <p className="text-xs text-ink-muted">
            The mark is drawn at the image&apos;s full resolution and sized as a fraction of it,
            so it looks the same on a phone snapshot and a 40-megapixel original.
          </p>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleApply}
              disabled={processing || !text.trim()}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Applying…" : "Add watermark"}
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
            title="Watermark added"
            detail={`${result.width} × ${result.height} · ${(result.blob.size / (1024 * 1024)).toFixed(2)} MB`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download watermarked image
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
