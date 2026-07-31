"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  readMetadata,
  writeMetadata,
  emptyMetadata,
  type PdfMetadata,
  type MetadataResult,
} from "@/lib/pdf-metadata";
import { downloadBlob } from "@/lib/download";

const FIELDS: { key: keyof PdfMetadata; label: string; hint?: string }[] = [
  { key: "title", label: "Title", hint: "What a viewer shows in its window title bar." },
  { key: "author", label: "Author", hint: "Often your real name, put there by Word or your printer driver." },
  { key: "subject", label: "Subject" },
  { key: "keywords", label: "Keywords", hint: "Comma separated." },
  { key: "creator", label: "Creator", hint: "The application the document was written in." },
  { key: "producer", label: "Producer", hint: "The library that wrote the PDF itself." },
];

/**
 * Bespoke rather than FileToolRunner: this tool has to read the file and show
 * what it found *before* anything is run, which is the opposite order from
 * every other tool here.
 */
export default function PdfMetadataTool() {
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState<PdfMetadata | null>(null);
  const [draft, setDraft] = useState<PdfMetadata | null>(null);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [reading, setReading] = useState(false);
  const [result, setResult] = useState<MetadataResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const next = files[0];
    setFile(next);
    setResult(null);
    setError(null);
    setReading(true);

    try {
      const meta = await readMetadata(next);
      setOriginal(meta);
      setDraft(meta);
    } catch (err) {
      setFile(null);
      setError(err instanceof Error ? err.message : "This PDF could not be read.");
    } finally {
      setReading(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!file || !draft) return;

    setProcessing(true);
    setError(null);

    try {
      const output = await writeMetadata(file, draft, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setProcessing(false);
    }
  }, [file, draft]);

  const reset = () => {
    setFile(null);
    setOriginal(null);
    setDraft(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const populated = original
    ? FIELDS.filter((f) => String(original[f.key] ?? "").trim().length > 0).length
    : 0;

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

      {reading && <p className="mt-4 text-sm text-ink-muted">Reading properties…</p>}

      {file && draft && !result && (
        <div className="space-y-6">
          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {populated === 0
                ? "No metadata fields are set on this file."
                : `${populated} of ${FIELDS.length} fields carry a value.`}
            </p>
          </div>

          <div className="space-y-3">
            {FIELDS.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={`meta-${field.key}`}
                  className="block text-xs font-medium text-ink-secondary mb-1.5"
                >
                  {field.label}
                </label>
                <input
                  id={`meta-${field.key}`}
                  type="text"
                  value={String(draft[field.key] ?? "")}
                  disabled={processing}
                  placeholder="—"
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, [field.key]: e.target.value } : d))
                  }
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent disabled:opacity-50"
                />
                {field.hint && <p className="text-xs text-ink-muted mt-1">{field.hint}</p>}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDraft(emptyMetadata())}
              disabled={processing}
              className="px-3 py-2 text-xs rounded-md border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-40 transition-colors"
            >
              Clear every field
            </button>
            <button
              onClick={() => setDraft(original)}
              disabled={processing || !original}
              className="px-3 py-2 text-xs rounded-md border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-40 transition-colors"
            >
              Restore original values
            </button>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            Clearing these fields rewrites the document information dictionary. A PDF
            can also carry the same details in an XMP stream, which pdf-lib cannot
            reach — so for a file that must be genuinely anonymous, check it in a
            metadata viewer afterwards.
          </p>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={processing}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium rounded-lg transition-colors duration-150"
            >
              {processing ? "Saving…" : "Save metadata"}
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
            title="Metadata updated"
            detail={
              result.clearedFields.length > 0
                ? `Previously held: ${result.clearedFields.join(", ")}`
                : "The original had no metadata set"
            }
          />
          {result.notice && <NoticeMessage>{result.notice}</NoticeMessage>}
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
            >
              Download PDF
            </button>
            <button
              onClick={reset}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised rounded-lg transition-colors duration-150"
            >
              Do another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
