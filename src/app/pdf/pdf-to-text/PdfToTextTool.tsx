"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import { pdfToText, type TextFormat, type TextResult } from "@/lib/pdf-text";
import { downloadBlob } from "@/lib/download";

const FORMATS: { value: TextFormat; label: string; note: string }[] = [
  { value: "txt", label: "Plain text", note: "Just the words, pages separated by blank lines." },
  { value: "md", label: "Markdown", note: "A heading per page, ready for notes or an LLM." },
];

export default function PdfToTextTool() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<TextFormat>("txt");

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<TextResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError(null);
  }, []);

  const handleExtract = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const output = await pdfToText(file, format, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while extracting.");
    } finally {
      setProcessing(false);
    }
  }, [file, format]);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access is denied in some embedded contexts. The textarea
      // below is selectable, so this is a convenience rather than the only path.
      setError("Your browser blocked clipboard access. Select the text below and copy it manually.");
    }
  }, [result]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setCopied(false);
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
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Output format</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FORMATS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormat(option.value)}
                  className={`px-3 py-2.5 text-left rounded-lg border transition-colors ${
                    format === option.value
                      ? "border-accent bg-accent-subtle"
                      : "border-border hover:bg-surface-raised"
                  }`}
                >
                  <span
                    className={`block text-sm font-medium ${
                      format === option.value ? "text-accent" : "text-ink"
                    }`}
                  >
                    {option.label}
                  </span>
                  <span className="block text-xs text-ink-muted mt-0.5">{option.note}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-ink-muted">
            This reads the text layer that is already in the PDF. It is not OCR — a
            scanned document (a photo of a page) has no text layer and will come back empty.
          </p>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleExtract}
              disabled={processing}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
            >
              {processing ? "Extracting…" : "Extract text"}
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
            title="Text extracted"
            detail={`${result.characterCount.toLocaleString()} characters from ${result.pageCount} page${
              result.pageCount === 1 ? "" : "s"
            }`}
          />

          {result.notice && <NoticeMessage>{result.notice}</NoticeMessage>}

          {result.text.length > 0 && (
            <div>
              <label htmlFor="extracted-text" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Extracted text
              </label>
              <textarea
                id="extracted-text"
                readOnly
                value={result.text}
                rows={12}
                className="w-full px-3 py-2 text-xs font-mono border border-border rounded-lg bg-surface-raised text-ink-secondary resize-y focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              disabled={result.text.length === 0}
              className="flex-1 min-w-[10rem] py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium rounded-lg transition-colors duration-150"
            >
              Download .{result.filename.split(".").pop()}
            </button>
            <button
              onClick={handleCopy}
              disabled={result.text.length === 0}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-40 rounded-lg transition-colors duration-150"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={reset}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised rounded-lg transition-colors duration-150"
            >
              Another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
