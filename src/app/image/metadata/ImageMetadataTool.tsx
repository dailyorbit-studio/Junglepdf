"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  readMetadata,
  stripMetadata,
  type MetadataReport,
  type StripResult,
} from "@/lib/image-metadata";
import { downloadBlob } from "@/lib/download";

const FORMATS = [
  { value: "image/jpeg", label: "JPG", quality: 0.92 },
  { value: "image/png", label: "PNG", quality: 1 },
  { value: "image/webp", label: "WebP", quality: 0.92 },
];

export default function ImageMetadataTool() {
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<MetadataReport | null>(null);
  const [format, setFormat] = useState("image/jpeg");

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<StripResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const picked = files[0];
    setFile(picked);
    setResult(null);
    setError(null);
    setReport(null);

    try {
      setReport(await readMetadata(picked));
    } catch {
      // A metadata block we cannot parse is not a reason to block stripping —
      // re-encoding removes everything regardless of whether we could read it.
      setReport({ fields: [], gps: null, orientation: 1, empty: true });
    }
  }, []);

  const handleStrip = useCallback(async () => {
    if (!file || !report) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const spec = FORMATS.find((f) => f.value === format) ?? FORMATS[0];
      const output = await stripMetadata(file, spec.value, spec.quality, report, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while cleaning.");
    } finally {
      setProcessing(false);
    }
  }, [file, report, format]);

  const reset = () => {
    setFile(null);
    setReport(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const sensitiveCount = report?.fields.filter((f) => f.sensitive).length ?? 0;

  return (
    <>
      {!file && (
        <FileDropZone
          accept="image/*"
          maxFileSizeMB={50}
          onFiles={handleFiles}
          label="Choose an image"
          sublabel="JPG, PNG, WebP · up to 50MB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-6">
          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>

          {report && (
            <div>
              <span className="block text-xs font-medium text-ink-secondary mb-2">
                What this file reveals
              </span>

              {report.fields.length === 0 ? (
                <div className="p-4 bg-surface-raised rounded-lg">
                  <p className="text-sm text-ink-secondary">
                    No metadata found. Either it was already stripped, or this format stores
                    it somewhere this reader does not parse — only JPEG carries EXIF in the
                    form read here. Cleaning it still works.
                  </p>
                </div>
              ) : (
                <>
                  {report.gps && (
                    <div className="mb-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-800">
                        This photo contains your location
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        {report.gps.latitude.toFixed(6)}, {report.gps.longitude.toFixed(6)} —
                        accurate to within a few metres. Anyone who receives this file can read it.
                      </p>
                    </div>
                  )}

                  <dl className="divide-y divide-border-subtle border border-border rounded-lg overflow-hidden">
                    {report.fields.map((field, i) => (
                      <div key={i} className="flex items-start gap-4 px-3.5 py-2.5 bg-surface">
                        <dt className="text-xs text-ink-muted w-32 shrink-0">{field.label}</dt>
                        <dd
                          className={`text-xs min-w-0 flex-1 break-words ${
                            field.sensitive ? "text-ink font-medium" : "text-ink-secondary"
                          }`}
                        >
                          {field.value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {sensitiveCount > 0 && (
                    <p className="text-xs text-ink-muted mt-2">
                      {sensitiveCount} of these identify you, your device, or where you were.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">
              Output format
            </span>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                    format === f.value
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border text-ink-secondary hover:bg-surface-raised"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-ink-muted">
            Cleaning re-encodes the image, which removes every metadata block by
            construction. That also means one generation of re-compression — the pixels are
            preserved, but a JPEG saved again is very slightly softer than the original.
          </p>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleStrip}
              disabled={processing || !report}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Cleaning…" : "Remove all metadata"}
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
            title="Metadata removed"
            detail={`${result.removedCount} field${result.removedCount === 1 ? "" : "s"} stripped · ${(
              result.outputSize /
              (1024 * 1024)
            ).toFixed(2)} MB`}
          />

          <NoticeMessage>
            The cleaned image carries pixels and nothing else — no GPS, no camera, no
            timestamps. Check the result before sharing if the original was rotated by a tag.
          </NoticeMessage>

          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download clean image
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Clean another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
