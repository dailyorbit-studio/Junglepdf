"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import { rotatePDF, type PdfRotation, type RotateResult } from "@/lib/pdf-rotator";
import { downloadBlob } from "@/lib/download";

const ROTATIONS: { value: PdfRotation; label: string }[] = [
  { value: 90, label: "90° right" },
  { value: 180, label: "180°" },
  { value: 270, label: "90° left" },
];

export default function RotatePdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState<PdfRotation>(90);
  const [allPages, setAllPages] = useState(true);
  const [pageSelection, setPageSelection] = useState("");

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<RotateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError(null);
  }, []);

  const handleRotate = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await rotatePDF(
        file,
        rotation,
        allPages ? null : pageSelection,
        (step, pct) => {
          setProgressLabel(step);
          setProgress(pct);
        }
      );
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while rotating.");
    } finally {
      setProcessing(false);
    }
  }, [file, rotation, allPages, pageSelection]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setAllPages(true);
    setPageSelection("");
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
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Rotate by</span>
            <div className="flex flex-wrap gap-2">
              {ROTATIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRotation(option.value)}
                  className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                    rotation === option.value
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border text-ink-secondary hover:bg-surface-raised"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-medium text-ink-secondary">Apply to</span>
            <div className="flex gap-2">
              <button
                onClick={() => setAllPages(true)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  allPages ? "border-accent bg-accent-subtle text-accent" : "border-border text-ink-muted"
                }`}
              >
                Every page
              </button>
              <button
                onClick={() => setAllPages(false)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  !allPages ? "border-accent bg-accent-subtle text-accent" : "border-border text-ink-muted"
                }`}
              >
                Specific pages
              </button>
            </div>

            {!allPages && (
              <div>
                <label htmlFor="rotate-pages" className="sr-only">
                  Pages to rotate
                </label>
                <input
                  id="rotate-pages"
                  type="text"
                  value={pageSelection}
                  onChange={(e) => setPageSelection(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
                <p className="text-xs text-ink-muted mt-1">
                  Comma-separated page numbers and ranges.
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-ink-muted">
            Rotation adds to whatever the page already had. A page a scanner saved sideways plus a
            90° turn here ends up at 180°, not back at 90°.
          </p>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleRotate}
              disabled={processing || (!allPages && !pageSelection.trim())}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Rotating…" : "Rotate PDF"}
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
            title="PDF rotated"
            detail={`${result.pagesRotated} of ${result.totalPages} page${result.totalPages === 1 ? "" : "s"} turned`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download rotated PDF
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Rotate another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
