"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  wordToPDF,
  describeLosses,
  FONT_LABELS,
  PAGE_SIZE_LABELS,
  type WordFontFamily,
  type WordPageSize,
  type WordToPdfResult,
} from "@/lib/word-to-pdf";
import { downloadBlob } from "@/lib/download";

const PAGE_SIZES: WordPageSize[] = ["a4", "letter"];
const FONTS: WordFontFamily[] = ["sans", "serif"];

const MARGINS: { value: number; label: string }[] = [
  { value: 36, label: "Narrow" },
  { value: 54, label: "Normal" },
  { value: 72, label: "Wide" },
];

export default function WordToPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageSize, setPageSize] = useState<WordPageSize>("a4");
  const [fontFamily, setFontFamily] = useState<WordFontFamily>("sans");
  const [margin, setMargin] = useState(54);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<WordToPdfResult | null>(null);
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
      const output = await wordToPDF(
        file,
        { pageSize, fontFamily, margin },
        (step, pct) => {
          setProgressLabel(step);
          setProgress(pct);
        }
      );
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while converting.");
    } finally {
      setProcessing(false);
    }
  }, [file, pageSize, fontFamily, margin]);

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
          accept=".docx"
          maxFileSizeMB={50}
          onFiles={handleFiles}
          label="Choose a Word document"
          sublabel=".docx up to 50MB"
        />
      )}

      {/*
        The error lives outside the {file && …} branch as well, because a
        rejected file clears `file` — gating it below would mean the message
        never renders.
      */}
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
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Page size</span>
            <div className="grid grid-cols-2 gap-2">
              {PAGE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setPageSize(size)}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                    pageSize === size
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border text-ink hover:bg-surface-raised"
                  }`}
                >
                  {PAGE_SIZE_LABELS[size]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Typeface</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FONTS.map((option) => (
                <button
                  key={option}
                  onClick={() => setFontFamily(option)}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                    fontFamily === option
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border text-ink hover:bg-surface-raised"
                  }`}
                >
                  {FONT_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Margins</span>
            <div className="grid grid-cols-3 gap-2">
              {MARGINS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMargin(option.value)}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                    margin === option.value
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border text-ink hover:bg-surface-raised"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-xs font-medium text-ink-secondary mb-1.5">
              This is a re-flow, not a photocopy
            </p>
            <ul className="text-xs text-ink-muted space-y-1 list-disc pl-4">
              {describeLosses().map((line) => (
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
              className="flex-1 btn btn-primary"
            >
              {processing ? "Converting…" : "Convert to PDF"}
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
            title="PDF created"
            detail={`${result.pageCount} page${result.pageCount === 1 ? "" : "s"} · ${(
              result.blob.size /
              (1024 * 1024)
            ).toFixed(2)} MB`}
          />

          {result.notice && <NoticeMessage>{result.notice}</NoticeMessage>}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 min-w-[10rem] btn btn-primary"
            >
              Download PDF
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Convert another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
