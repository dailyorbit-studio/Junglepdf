"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  pdfToPpt,
  describeLimits,
  PPT_DPI_OPTIONS,
  type PptDpi,
  type PdfToPptResult,
} from "@/lib/pdf-to-ppt";
import { downloadBlob } from "@/lib/download";

export default function PdfToPptTool() {
  const [file, setFile] = useState<File | null>(null);
  const [dpi, setDpi] = useState<PptDpi>(150);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<PdfToPptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError(null);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await pdfToPpt(file, { dpi }, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while converting.");
    } finally {
      setProcessing(false);
    }
  }, [file, dpi]);

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
          label="Drop a PDF here, or click to browse"
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
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Slide resolution</span>
            <div className="grid grid-cols-3 gap-2">
              {PPT_DPI_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setDpi(option)}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                    dpi === option
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border text-ink hover:bg-surface-raised"
                  }`}
                >
                  {option} DPI
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-muted mt-1.5">
              96 for screen sharing, 150 for projection, 200 if slides will be printed.
            </p>
          </div>

          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-xs font-medium text-ink-secondary mb-1.5">
              Pages become pictures, not editable slides
            </p>
            <ul className="text-xs text-ink-muted space-y-1 list-disc pl-4">
              {describeLimits().map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleConvert}
              disabled={processing}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
            >
              {processing ? "Converting…" : "Convert to PowerPoint"}
            </button>
            <button
              onClick={reset}
              disabled={processing}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-40 rounded-lg transition-colors duration-150"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <ResultBanner
            title="Presentation created"
            detail={`${result.slideCount} slide${result.slideCount === 1 ? "" : "s"} · ${(
              result.blob.size /
              (1024 * 1024)
            ).toFixed(1)} MB`}
          />

          {result.notice && <NoticeMessage>{result.notice}</NoticeMessage>}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 min-w-[10rem] py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
            >
              Download .pptx
            </button>
            <button
              onClick={reset}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised rounded-lg transition-colors duration-150"
            >
              Convert another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
