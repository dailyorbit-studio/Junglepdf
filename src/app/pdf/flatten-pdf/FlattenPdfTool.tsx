"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import { flattenPDF, type FlattenResult } from "@/lib/pdf-flatten";
import { downloadBlob } from "@/lib/download";

export default function FlattenPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<FlattenResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError(null);
  }, []);

  const handleFlatten = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await flattenPDF(file, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while flattening.");
    } finally {
      setProcessing(false);
    }
  }, [file]);

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

          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-xs font-medium text-ink-secondary mb-1.5">What flattening does</p>
            <ul className="text-xs text-ink-muted space-y-1 list-disc pl-4">
              <li>Form field values are baked into the page as ordinary text</li>
              <li>Fields stop being editable and print identically everywhere</li>
              <li>Fixes filled forms that print blank in some viewers</li>
              <li>Page content, text and images are otherwise untouched</li>
            </ul>
          </div>

          <p className="text-xs text-ink-muted">
            Flattening is not encryption. The result is not password-protected or
            read-only — it simply no longer contains live form fields.
          </p>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleFlatten}
              disabled={processing}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
            >
              {processing ? "Flattening…" : "Flatten PDF"}
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
            title={result.nothingToDo ? "PDF re-saved" : "PDF flattened"}
            detail={
              result.nothingToDo
                ? `${result.pageCount} page${result.pageCount === 1 ? "" : "s"} · no form fields found`
                : `${result.fieldsFlattened} field${
                    result.fieldsFlattened === 1 ? "" : "s"
                  } baked in across ${result.pageCount} page${result.pageCount === 1 ? "" : "s"}`
            }
          />

          {result.notice && <NoticeMessage>{result.notice}</NoticeMessage>}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 min-w-[10rem] py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
            >
              Download PDF
            </button>
            <button
              onClick={reset}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised rounded-lg transition-colors duration-150"
            >
              Flatten another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
