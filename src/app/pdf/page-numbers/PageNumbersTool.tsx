"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import {
  addPageNumbers,
  POSITION_LABELS,
  FORMAT_LABELS,
  type NumberPosition,
  type NumberFormat,
  type PageNumberResult,
} from "@/lib/pdf-page-numbers";
import { downloadBlob } from "@/lib/download";

const POSITIONS: NumberPosition[] = [
  "top-left", "top-center", "top-right",
  "bottom-left", "bottom-center", "bottom-right",
];

const FORMATS: NumberFormat[] = ["n", "page-n", "n-of-total", "page-n-of-total"];

export default function PageNumbersTool() {
  const [file, setFile] = useState<File | null>(null);

  const [position, setPosition] = useState<NumberPosition>("bottom-center");
  const [format, setFormat] = useState<NumberFormat>("n");
  const [fontSize, setFontSize] = useState(11);
  const [startAt, setStartAt] = useState(1);
  const [skipFirstPage, setSkipFirstPage] = useState(false);
  const [margin, setMargin] = useState(28);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<PageNumberResult | null>(null);
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
      const output = await addPageNumbers(
        file,
        { position, format, fontSize, startAt, skipFirstPage, margin },
        (step, pct) => {
          setProgressLabel(step);
          setProgress(pct);
        }
      );
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while numbering.");
    } finally {
      setProcessing(false);
    }
  }, [file, position, format, fontSize, startAt, skipFirstPage, margin]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

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
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Position</span>
            {/* A 3×2 grid mirroring where the number lands on the page. */}
            <div className="grid grid-cols-3 gap-1.5 max-w-xs">
              {POSITIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPosition(p)}
                  className={`py-3 text-[11px] rounded-md border transition-colors ${
                    position === p
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border text-ink-muted hover:text-ink"
                  }`}
                  aria-label={POSITION_LABELS[p]}
                  aria-pressed={position === p}
                >
                  {POSITION_LABELS[p].split(" ")[1] ?? POSITION_LABELS[p]}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-muted mt-1.5">{POSITION_LABELS[position]}</p>
          </div>

          <div>
            <label htmlFor="number-format" className="block text-xs font-medium text-ink-secondary mb-1">
              Format
            </label>
            <select
              id="number-format"
              value={format}
              onChange={(e) => setFormat(e.target.value as NumberFormat)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {FORMAT_LABELS[f]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="number-size" className="block text-xs font-medium text-ink-secondary mb-1">
                Size ({fontSize}pt)
              </label>
              <input
                id="number-size"
                type="range"
                min={7}
                max={24}
                step={1}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-full accent-accent mt-2"
              />
            </div>
            <div>
              <label htmlFor="number-margin" className="block text-xs font-medium text-ink-secondary mb-1">
                Margin ({margin}pt)
              </label>
              <input
                id="number-margin"
                type="range"
                min={10}
                max={72}
                step={2}
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                className="w-full accent-accent mt-2"
              />
            </div>
            <div>
              <label htmlFor="number-start" className="block text-xs font-medium text-ink-secondary mb-1">
                Start at
              </label>
              <input
                id="number-start"
                type="number"
                min={0}
                max={9999}
                value={startAt}
                onChange={(e) => setStartAt(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={skipFirstPage}
              onChange={(e) => setSkipFirstPage(e.target.checked)}
              className="accent-accent"
            />
            <span className="text-xs text-ink-secondary">
              Skip the first page (usual for a cover or title page)
            </span>
          </label>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleApply}
              disabled={processing}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Numbering…" : "Add page numbers"}
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
            title="Page numbers added"
            detail={`${result.pagesStamped} of ${result.totalPages} pages stamped`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download numbered PDF
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Number another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
