"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  watermarkPDF,
  findUnsupportedCharacter,
  type WatermarkResult,
} from "@/lib/pdf-watermark";
import { downloadBlob } from "@/lib/download";

const PRESETS = ["CONFIDENTIAL", "DRAFT", "COPY", "SAMPLE", "DO NOT COPY"];

export default function WatermarkPdfTool() {
  const [file, setFile] = useState<File | null>(null);

  const [text, setText] = useState("CONFIDENTIAL");
  const [angle, setAngle] = useState(45);
  const [opacity, setOpacity] = useState(0.18);
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#DC2626");

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
      const output = await watermarkPDF(
        file,
        { text, angle, opacity, fontSize, color },
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
  }, [file, text, angle, opacity, fontSize, color]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  // Checked as you type rather than only on submit — the built-in PDF fonts
  // cover Latin-1 only, and finding out after a 200-page run is worse.
  const unsupported = findUnsupportedCharacter(text);

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".pdf"
          maxFileSizeMB={100}
          onFiles={handleFiles}
          label="Choose a PDF"
          sublabel="Up to 100MB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-6">
          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {(file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          </div>

          <div>
            <label htmlFor="watermark-text" className="block text-xs font-medium text-ink-secondary mb-1">
              Watermark text
            </label>
            <input
              id="watermark-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={60}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setText(preset)}
                  className="px-2 py-1 text-[11px] rounded border border-border text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Live preview — the real stamp is drawn by pdf-lib, but the CSS
              approximation is close enough to judge angle and opacity. */}
          <div className="relative h-40 rounded-lg border border-border-subtle bg-surface-raised overflow-hidden flex items-center justify-center">
            <span
              className="font-bold whitespace-nowrap select-none"
              style={{
                color,
                opacity,
                fontSize: `${Math.max(12, fontSize * 0.5)}px`,
                transform: `rotate(${-angle}deg)`,
              }}
            >
              {text || " "}
            </span>
            <span className="absolute bottom-2 right-2 text-[10px] uppercase tracking-wide text-ink-muted">
              Preview
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="watermark-angle" className="block text-xs font-medium text-ink-secondary mb-1">
                Angle ({angle}°)
              </label>
              <input
                id="watermark-angle"
                type="range"
                min={0}
                max={90}
                step={5}
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                className="w-full accent-accent mt-2"
              />
            </div>
            <div>
              <label htmlFor="watermark-opacity" className="block text-xs font-medium text-ink-secondary mb-1">
                Opacity ({Math.round(opacity * 100)}%)
              </label>
              <input
                id="watermark-opacity"
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-accent mt-2"
              />
            </div>
            <div>
              <label htmlFor="watermark-size" className="block text-xs font-medium text-ink-secondary mb-1">
                Size ({fontSize}pt)
              </label>
              <input
                id="watermark-size"
                type="range"
                min={12}
                max={120}
                step={2}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-full accent-accent mt-2"
              />
            </div>
            <div>
              <span className="block text-xs font-medium text-ink-secondary mb-1">Colour</span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 rounded border border-border cursor-pointer bg-surface"
                  aria-label="Watermark colour"
                />
                <span className="text-xs font-mono text-ink-muted">{color.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {unsupported && (
            <ErrorMessage>
              &ldquo;{unsupported}&rdquo; can&apos;t be drawn with the built-in PDF fonts, which
              only cover Latin characters. Use text without accented or non-Latin symbols.
            </ErrorMessage>
          )}

          <NoticeMessage>
            A watermark is a visual mark, not a security control. The text sits in the page content
            and can be removed by anyone with a PDF editor. Don&apos;t rely on it to stop copying.
          </NoticeMessage>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleApply}
              disabled={processing || !text.trim() || unsupported !== null}
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
            title="Watermark applied"
            detail={`${result.pageCount} page${result.pageCount === 1 ? "" : "s"} stamped`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download watermarked PDF
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Watermark another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
