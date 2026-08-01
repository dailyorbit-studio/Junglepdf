"use client";

import { useState, useCallback, type ReactNode } from "react";
import FileDropZone from "./FileDropZone";
import ProgressBar from "./ProgressBar";
import ResultBanner from "./ResultBanner";
import ErrorMessage from "./ErrorMessage";
import NoticeMessage from "./NoticeMessage";
import {
  describeLosses,
  FONT_LABELS,
  MARGIN_PRESETS,
  PAGE_SIZE_LABELS,
  type DocFontFamily,
  type DocLayoutOptions,
  type DocPageSize,
} from "@/lib/pdf-layout";
import { downloadBlob } from "@/lib/download";

/**
 * The shared front end for every "X to PDF" converter.
 *
 * Six routes — Word, TXT, RTF, HTML, ODT, EPUB — differ only in which reader
 * they call and what they accept. Their panels were otherwise going to be six
 * copies of the same page size / typeface / margin controls, which is how
 * `PdfPageSelectTool` came about for Extract and Remove Pages.
 *
 * The converter itself is passed in as a prop, so each route keeps a small
 * client wrapper: a function cannot cross the server/client boundary, and the
 * page shells are server components.
 */

export interface DocumentResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  notice: string | null;
}

interface DocumentToPdfToolProps {
  /** The engine. Receives the layout options plus any extra state below. */
  convert: (
    file: File,
    options: DocLayoutOptions & Record<string, unknown>,
    onProgress: (step: string, pct: number) => void
  ) => Promise<DocumentResult>;
  /** File input filter, e.g. ".txt,.log". */
  accept: string;
  maxFileSizeMB: number;
  dropLabel: string;
  dropSublabel: string;
  /** Verb for the primary button, e.g. "Convert to PDF". */
  actionLabel?: string;
  /** Extra controls rendered above the layout options. */
  extraControls?: ReactNode;
  /** Extra values merged into the options passed to `convert`. */
  extraOptions?: Record<string, unknown>;
  /** Replaces the standard caveat list when a format needs its own. */
  caveats?: string[];
  caveatTitle?: string;
  /** Rendered under the caveat list — format-specific warnings. */
  footnote?: ReactNode;
}

export default function DocumentToPdfTool({
  convert,
  accept,
  maxFileSizeMB,
  dropLabel,
  dropSublabel,
  actionLabel = "Convert to PDF",
  extraControls,
  extraOptions,
  caveats,
  caveatTitle = "This is a re-flow, not a photocopy",
  footnote,
}: DocumentToPdfToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pageSize, setPageSize] = useState<DocPageSize>("a4");
  const [fontFamily, setFontFamily] = useState<DocFontFamily>("sans");
  const [margin, setMargin] = useState(54);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<DocumentResult | null>(null);
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
      const output = await convert(
        file,
        { pageSize, fontFamily, margin, ...extraOptions },
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
  }, [file, pageSize, fontFamily, margin, convert, extraOptions]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const optionButton = (active: boolean) =>
    `px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
      active
        ? "border-accent bg-accent-subtle text-accent"
        : "border-border text-ink hover:bg-surface-raised"
    }`;

  return (
    <>
      {!file && (
        <FileDropZone
          accept={accept}
          maxFileSizeMB={maxFileSizeMB}
          onFiles={handleFiles}
          label={dropLabel}
          sublabel={dropSublabel}
        />
      )}

      {/* Outside the {file && …} branch: a rejected file clears `file`. */}
      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-6">
          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {file.size < 1024 * 1024
                ? `${(file.size / 1024).toFixed(0)} KB`
                : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
            </p>
          </div>

          {extraControls}

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Page size</span>
            <div className="grid grid-cols-2 gap-2">
              {(["a4", "letter"] as DocPageSize[]).map((size) => (
                <button key={size} onClick={() => setPageSize(size)} className={optionButton(pageSize === size)}>
                  {PAGE_SIZE_LABELS[size]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Typeface</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(["sans", "serif"] as DocFontFamily[]).map((option) => (
                <button key={option} onClick={() => setFontFamily(option)} className={optionButton(fontFamily === option)}>
                  {FONT_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Margins</span>
            <div className="grid grid-cols-3 gap-2">
              {MARGIN_PRESETS.map((option) => (
                <button key={option.value} onClick={() => setMargin(option.value)} className={optionButton(margin === option.value)}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-xs font-medium text-ink-secondary mb-1.5">{caveatTitle}</p>
            <ul className="text-xs text-ink-muted space-y-1 list-disc pl-4">
              {(caveats ?? describeLosses()).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          {footnote}

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleConvert}
              disabled={processing}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Converting…" : actionLabel}
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
