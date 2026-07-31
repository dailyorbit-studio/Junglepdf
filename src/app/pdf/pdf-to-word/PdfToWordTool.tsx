"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  pdfToWord,
  describeLosses,
  LAYOUT_LABELS,
  type WordLayout,
  type PdfToWordResult,
} from "@/lib/pdf-to-word";
import { downloadBlob } from "@/lib/download";

const LAYOUTS: { value: WordLayout; note: string }[] = [
  { value: "flowing", note: "Best for prose you intend to edit." },
  { value: "lines", note: "Best for forms, addresses, poetry or code." },
];

export default function PdfToWordTool() {
  const [file, setFile] = useState<File | null>(null);
  const [layout, setLayout] = useState<WordLayout>("flowing");
  const [keepPageBreaks, setKeepPageBreaks] = useState(false);
  const [stripRunningHeads, setStripRunningHeads] = useState(true);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<PdfToWordResult | null>(null);
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
      const output = await pdfToWord(
        file,
        { layout, keepPageBreaks, stripRunningHeads },
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
  }, [file, layout, keepPageBreaks, stripRunningHeads]);

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

      {/* Outside the {file && …} branch: a rejected file clears `file`. */}
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
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">
              Paragraph handling
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {LAYOUTS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLayout(option.value)}
                  className={`px-3 py-2.5 text-left rounded-lg border transition-colors ${
                    layout === option.value
                      ? "border-accent bg-accent-subtle"
                      : "border-border hover:bg-surface-raised"
                  }`}
                >
                  <span
                    className={`block text-sm font-medium ${
                      layout === option.value ? "text-accent" : "text-ink"
                    }`}
                  >
                    {LAYOUT_LABELS[option.value]}
                  </span>
                  <span className="block text-xs text-ink-muted mt-0.5">{option.note}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stripRunningHeads}
                onChange={(e) => setStripRunningHeads(e.target.checked)}
                className="accent-accent"
              />
              <span className="text-xs text-ink-secondary">
                Remove repeated headers, footers and page numbers
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={keepPageBreaks}
                onChange={(e) => setKeepPageBreaks(e.target.checked)}
                className="accent-accent"
              />
              <span className="text-xs text-ink-secondary">
                Start a new Word page where each PDF page ended
              </span>
            </label>
          </div>

          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-xs font-medium text-ink-secondary mb-1.5">
              You get editable text, not a copy of the page
            </p>
            <ul className="text-xs text-ink-muted space-y-1 list-disc pl-4">
              {describeLosses().map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-ink-muted">
            This reads the text layer that is already in the PDF. It is not OCR — a
            scanned document (a photo of a page) has no text layer and cannot be converted.
          </p>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleConvert}
              disabled={processing}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
            >
              {processing ? "Converting…" : "Convert to Word"}
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
            title="Word document created"
            detail={`${result.paragraphCount.toLocaleString()} paragraphs from ${
              result.pageCount
            } page${result.pageCount === 1 ? "" : "s"} · ${result.characterCount.toLocaleString()} characters`}
          />

          {result.notice && <NoticeMessage>{result.notice}</NoticeMessage>}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 min-w-[10rem] py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
            >
              Download .docx
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
