"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import { pdfToExcel, describeLimits, type PdfToExcelResult } from "@/lib/pdf-to-excel";
import { downloadBlob } from "@/lib/download";

export default function PdfToExcelTool() {
  const [file, setFile] = useState<File | null>(null);
  const [sheetPerPage, setSheetPerPage] = useState(true);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<PdfToExcelResult | null>(null);
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
      const output = await pdfToExcel(file, { sheetPerPage }, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while converting.");
    } finally {
      setProcessing(false);
    }
  }, [file, sheetPerPage]);

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
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Sheets</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { value: true, label: "One sheet per page", note: "Keeps each page's table separate." },
                { value: false, label: "Everything in one sheet", note: "Best when one table runs across pages." },
              ].map((option) => (
                <button
                  key={String(option.value)}
                  onClick={() => setSheetPerPage(option.value)}
                  className={`px-3 py-2.5 text-left rounded-lg border transition-colors ${
                    sheetPerPage === option.value
                      ? "border-accent bg-accent-subtle"
                      : "border-border hover:bg-surface-raised"
                  }`}
                >
                  <span
                    className={`block text-sm font-medium ${
                      sheetPerPage === option.value ? "text-accent" : "text-ink"
                    }`}
                  >
                    {option.label}
                  </span>
                  <span className="block text-xs text-ink-muted mt-0.5">{option.note}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-xs font-medium text-ink-secondary mb-1.5">
              This is a reconstruction, not an export
            </p>
            <ul className="text-xs text-ink-muted space-y-1 list-disc pl-4">
              {describeLimits().map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-ink-muted">
            This reads the text layer that is already in the PDF. It is not OCR — a
            scanned document has no text layer and cannot be converted.
          </p>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleConvert}
              disabled={processing}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
            >
              {processing ? "Converting…" : "Convert to Excel"}
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
            title="Workbook created"
            detail={`${result.rowCount.toLocaleString()} rows · ${result.columnCount} column${
              result.columnCount === 1 ? "" : "s"
            } · from ${result.pageCount} page${result.pageCount === 1 ? "" : "s"}`}
          />

          {result.notice && <NoticeMessage>{result.notice}</NoticeMessage>}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 min-w-[10rem] py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
            >
              Download .xlsx
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
