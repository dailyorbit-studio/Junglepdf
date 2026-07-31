"use client";

import { useState, useCallback, type ReactNode } from "react";
import FileDropZone from "./FileDropZone";
import ProgressBar from "./ProgressBar";
import ResultBanner from "./ResultBanner";
import ErrorMessage from "./ErrorMessage";
import NoticeMessage from "./NoticeMessage";
import { downloadBlob } from "@/lib/download";

/**
 * The shared front end for a one-file-in, one-file-out tool.
 *
 * Every tool here runs the same state machine — pick a file, set options,
 * watch a progress bar, download or start again — and the interesting part is
 * only ever the options panel and the engine call. Written out per route that
 * is about seventy lines of identical `useState` before anything specific
 * happens, and the copies drift: the error placement rule in particular
 * (`{!file && error && …}`, so a handler that clears the file still shows why)
 * was already wrong in a couple of places before this existed.
 *
 * Same reasoning as `DocumentToPdfTool` and `PdfPageSelectTool`, generalised
 * one step further. Tools whose shape genuinely differs — a listing, two
 * inputs, a live preview — still write their own.
 */

export interface RunnerResult {
  blob: Blob;
  filename: string;
  /** Amber caveat shown under the success banner. */
  notice?: string | null;
}

interface FileToolRunnerProps<T extends RunnerResult> {
  accept: string;
  maxFileSizeMB: number;
  dropLabel: string;
  dropSublabel: string;

  /** The engine. Rejections surface as the error message verbatim. */
  run: (file: File, onProgress: (step: string, pct: number) => void) => Promise<T>;

  /** Controls shown once a file is chosen. Disabled while a job is running. */
  options?: (disabled: boolean) => ReactNode;
  /** Extra copy under the options — a caveat, a hint about the defaults. */
  hint?: ReactNode;

  actionLabel: string;
  busyLabel: string;
  /** Blocks the run button when the options are not yet valid. */
  canRun?: boolean;

  resultTitle: string;
  resultDetail: (result: T) => string;
  downloadLabel: string;
  againLabel: string;

  /** Called when the file changes or is cleared, for tools with derived state. */
  onFileChange?: (file: File | null) => void;
}

export default function FileToolRunner<T extends RunnerResult>({
  accept,
  maxFileSizeMB,
  dropLabel,
  dropSublabel,
  run,
  options,
  hint,
  actionLabel,
  busyLabel,
  canRun = true,
  resultTitle,
  resultDetail,
  downloadLabel,
  againLabel,
  onFileChange,
}: FileToolRunnerProps<T>) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: File[]) => {
      setFile(files[0]);
      setResult(null);
      setError(null);
      onFileChange?.(files[0] ?? null);
    },
    [onFileChange]
  );

  const handleRun = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await run(file, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setProcessing(false);
    }
  }, [file, run]);

  const reset = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    onFileChange?.(null);
  }, [onFileChange]);

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

      {/*
        Outside the `file &&` branch on purpose: a run that fails and clears
        the file would otherwise unmount the only place the reason was shown.
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

          {options?.(processing)}

          {hint && <div className="text-xs text-ink-muted leading-relaxed">{hint}</div>}

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleRun}
              disabled={processing || !canRun}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
            >
              {processing ? busyLabel : actionLabel}
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
          <ResultBanner title={resultTitle} detail={resultDetail(result)} />

          {result.notice && <NoticeMessage>{result.notice}</NoticeMessage>}

          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
            >
              {downloadLabel}
            </button>
            <button
              onClick={reset}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised rounded-lg transition-colors duration-150"
            >
              {againLabel}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Small shared controls, so each tool's options panel stays declarative ── */

export function OptionGroup({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <span className="block text-xs font-medium text-ink-secondary mb-1.5">{label}</span>
      {children}
      {hint && <p className="text-xs text-ink-muted mt-1">{hint}</p>}
    </div>
  );
}

export function ChoiceRow<V extends string | number>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: V;
  options: { value: V; label: string }[];
  onChange: (value: V) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={`px-3 py-2 text-xs rounded-md border transition-colors disabled:opacity-50 ${
            value === option.value
              ? "border-accent bg-accent-subtle text-accent"
              : "border-border text-ink-secondary hover:bg-surface-raised"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  disabled,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-ink-secondary mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isFinite(next)) onChange(next);
          }}
          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent disabled:opacity-50"
        />
        {suffix && <span className="text-xs text-ink-muted shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}
