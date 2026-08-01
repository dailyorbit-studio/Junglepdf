"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import { splitPDF, type SplitResult } from "@/lib/pdf-splitter";
import { loadPDF } from "@/lib/pdf-utils";
import { downloadBlob } from "@/lib/download";
import { createZip } from "@/lib/zip";

export default function SplitPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rangeInput, setRangeInput] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [reading, setReading] = useState(false);
  const [results, setResults] = useState<SplitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  // The ZIP is built on demand rather than alongside the split: most people
  // splitting into two parts just want the two files, and compressing a
  // 100MB document they will not download is pure waste.
  const downloadAll = useCallback(async () => {
    if (!results || !file) return;

    setZipping(true);
    setZipError(null);

    try {
      const blob = await createZip(
        results.parts.map((part) => ({ filename: part.label, blob: part.blob }))
      );
      downloadBlob(blob, file.name.replace(/\.pdf$/i, "") + "_split.zip");
    } catch (err) {
      setZipError(
        err instanceof Error ? err.message : "The ZIP could not be built. Download the files individually."
      );
    } finally {
      setZipping(false);
    }
  }, [results, file]);

  const handleFiles = useCallback(async (files: File[]) => {
    const selected = files[0];
    setFile(selected);
    setResults(null);
    setError(null);
    setReading(true);

    try {
      const pdf = await loadPDF(await selected.arrayBuffer(), selected.name);
      const count = pdf.getPageCount();
      setPageCount(count);
      setRangeInput(`1-${count}`);
    } catch (err) {
      // Clearing the file here means the error has to render outside the
      // file-loaded branch, or nothing at all would be shown.
      setError(err instanceof Error ? err.message : "Could not read this PDF file.");
      setFile(null);
      setPageCount(0);
    } finally {
      setReading(false);
    }
  }, []);

  const handleSplit = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResults(null);

    try {
      const output = await splitPDF(file, rangeInput, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResults(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during splitting.");
    } finally {
      setProcessing(false);
    }
  }, [file, rangeInput]);

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setRangeInput("");
    setResults(null);
    setError(null);
    setZipError(null);
    setProgress(0);
  };

  return (
    <>
      {!file && !reading && (
        <FileDropZone
          accept=".pdf"
          maxFileSizeMB={100}
          onFiles={handleFiles}
          label="Choose a PDF file"
          sublabel="PDF — up to 100MB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {reading && <ProgressBar progress={40} label="Reading PDF…" />}

      {file && !results && !reading && (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-surface-raised rounded-lg">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{file.name}</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {pageCount} pages &middot; {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <button
              onClick={reset}
              disabled={processing}
              className="text-xs text-ink-muted hover:text-error disabled:opacity-40 transition-colors shrink-0 ml-3"
            >
              Remove
            </button>
          </div>

          <div>
            <label htmlFor="page-ranges" className="block text-xs font-medium text-ink-secondary mb-1.5">
              Page ranges
            </label>
            <input
              id="page-ranges"
              type="text"
              value={rangeInput}
              onChange={(e) => setRangeInput(e.target.value)}
              placeholder="e.g. 1-3, 5, 7-10"
              className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
            />
            <p className="text-xs text-ink-muted mt-1.5">
              Each comma-separated range becomes a separate file. Pages 1–{pageCount}.
            </p>
          </div>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <button
            onClick={handleSplit}
            disabled={processing || !rangeInput.trim()}
            className="btn btn-primary btn-block"
          >
            {processing ? "Splitting…" : "Split PDF"}
          </button>
        </div>
      )}

      {results && (
        <div className="space-y-5">
          <ResultBanner
            title={`Split into ${results.parts.length} file${results.parts.length > 1 ? "s" : ""}`}
          />
          {results.warning && <NoticeMessage>{results.warning}</NoticeMessage>}

          <ul className="space-y-2">
            {results.parts.map((part, i) => (
              <li key={i} className="flex items-center justify-between gap-3 p-3 bg-surface-raised rounded-lg">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{part.label}</p>
                  <p className="text-xs text-ink-muted">
                    {part.pageCount} page{part.pageCount > 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => downloadBlob(part.blob, part.label)}
                  className="px-3 py-1.5 text-xs font-medium text-accent border border-accent/30 rounded-md hover:bg-accent-subtle transition-colors shrink-0"
                >
                  Download
                </button>
              </li>
            ))}
          </ul>

          {zipError && <ErrorMessage>{zipError}</ErrorMessage>}

          <div className="flex gap-3">
            {results.parts.length > 1 && (
              <button
                onClick={downloadAll}
                disabled={zipping}
                className="flex-1 btn btn-primary"
              >
                {zipping ? "Bundling…" : `Download all ${results.parts.length} as ZIP`}
              </button>
            )}
            <button
              onClick={reset}
              disabled={zipping}
              className={`btn btn-secondary ${
                results.parts.length > 1 ? "" : "w-full"
              }`}
            >
              Split another PDF
            </button>
          </div>
        </div>
      )}
    </>
  );
}
