"use client";

import { useState, useCallback } from "react";
import FileDropZone from "./FileDropZone";
import ProgressBar from "./ProgressBar";
import ResultBanner from "./ResultBanner";
import ErrorMessage from "./ErrorMessage";
import NoticeMessage from "./NoticeMessage";
import { extractPages, removePages, type PageOpResult } from "@/lib/pdf-pages";
import { downloadBlob } from "@/lib/download";

/**
 * Shared client for Extract Pages and Remove Pages.
 *
 * The two routes differ in wording and in which side of the selection they
 * keep, and in nothing else. They stay separate routes because the search
 * terms are different, but a second copy of this component would just be two
 * places to fix the same range-parsing bug.
 */

interface Props {
  mode: "extract" | "remove";
}

const COPY = {
  extract: {
    action: "Extract pages",
    working: "Extracting…",
    field: "Pages to keep",
    hint: "Everything you don't name is left out.",
    download: "Download extracted PDF",
    again: "Extract from another",
    success: "Pages extracted",
  },
  remove: {
    action: "Remove pages",
    working: "Removing…",
    field: "Pages to remove",
    hint: "Everything you don't name is kept, in its original order.",
    download: "Download trimmed PDF",
    again: "Trim another",
    success: "Pages removed",
  },
} as const;

export default function PdfPageSelectTool({ mode }: Props) {
  const copy = COPY[mode];

  const [file, setFile] = useState<File | null>(null);
  const [selection, setSelection] = useState("");

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<PageOpResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError(null);
  }, []);

  const handleRun = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const run = mode === "extract" ? extractPages : removePages;
      const output = await run(file, selection, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setProcessing(false);
    }
  }, [file, selection, mode]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setSelection("");
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

      {/* Rendered outside the `file &&` branch — setError also clears the file,
          so an error gated behind it would never be seen. */}
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
            <label htmlFor="page-selection" className="block text-xs font-medium text-ink-secondary mb-1.5">
              {copy.field}
            </label>
            <input
              id="page-selection"
              type="text"
              value={selection}
              onChange={(e) => setSelection(e.target.value)}
              placeholder="e.g. 1-3, 5, 8-10"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
            <p className="text-xs text-ink-muted mt-1.5">
              Comma-separated page numbers and ranges. {copy.hint}
            </p>
          </div>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleRun}
              disabled={processing || !selection.trim()}
              className="flex-1 btn btn-primary"
            >
              {processing ? copy.working : copy.action}
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
            title={copy.success}
            detail={`${result.pageCount} of ${result.originalPageCount} page${
              result.originalPageCount === 1 ? "" : "s"
            } in the new document`}
          />

          {result.notice && <NoticeMessage>{result.notice}</NoticeMessage>}

          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              {copy.download}
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              {copy.again}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
