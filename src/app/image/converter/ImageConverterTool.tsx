"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  convertImage,
  FORMAT_LABELS,
  formatUsesQuality,
  type OutputFormat,
  type ConvertResult,
} from "@/lib/image-converter";
import { downloadBlob } from "@/lib/download";
import { useObjectUrl } from "@/hooks/use-object-url";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FORMATS: OutputFormat[] = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function ImageConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useObjectUrl();
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  const [format, setFormat] = useState<OutputFormat>("image/webp");
  const [quality, setQuality] = useState(0.9);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: File[]) => {
      const selected = files[0];
      setFile(selected);
      setResult(null);
      setError(null);
      setPreview(selected);

      const url = URL.createObjectURL(selected);
      const img = new Image();
      img.onload = () => {
        setDimensions({ w: img.naturalWidth, h: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setError("This image couldn't be read. It may be corrupted or in an unsupported format.");
        setFile(null);
        setPreview(null);
      };
      img.src = url;
    },
    [setPreview]
  );

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await convertImage(file, { format, quality }, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during conversion.");
    } finally {
      setProcessing(false);
    }
  }, [file, format, quality]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".jpg,.jpeg,.png,.webp,.avif,.bmp,.gif"
          maxFileSizeMB={50}
          onFiles={handleFiles}
          label="Drop an image here, or click to browse"
          sublabel="JPEG, PNG, WebP, AVIF, BMP, GIF — up to 50MB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-5">
            {preview && (
              <div className="sm:w-36 sm:h-36 w-full h-44 rounded-lg overflow-hidden bg-surface-raised border border-border-subtle flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview of the selected image" className="w-full h-full object-contain" />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <p className="text-sm font-medium text-ink truncate">{file.name}</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {dimensions.w} × {dimensions.h} px &middot; {formatBytes(file.size)}
                </p>
              </div>

              <div>
                <span className="block text-xs font-medium text-ink-secondary mb-1.5">
                  Convert to
                </span>
                <div className="flex flex-wrap gap-2">
                  {FORMATS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                        format === f
                          ? "border-accent bg-accent-subtle text-accent"
                          : "border-border text-ink-muted hover:text-ink"
                      }`}
                    >
                      {FORMAT_LABELS[f]}
                    </button>
                  ))}
                </div>
              </div>

              {formatUsesQuality(format) && (
                <div>
                  <label htmlFor="convert-quality" className="block text-xs font-medium text-ink-secondary mb-1">
                    Quality ({Math.round(quality * 100)}%)
                  </label>
                  <input
                    id="convert-quality"
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-accent mt-1"
                  />
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-ink-muted">
            Dimensions are left at {dimensions.w} × {dimensions.h} px — this tool only changes the
            format. Use the resizer if you also need different dimensions.
          </p>

          {format === "image/jpeg" && (
            <p className="text-xs text-ink-muted">
              JPG has no transparency — any transparent areas will be filled with white.
            </p>
          )}

          {format === "image/avif" && (
            <NoticeMessage>
              AVIF encoding is not supported by every browser. If yours can&apos;t produce it, the
              tool will say so rather than hand you a mislabelled file.
            </NoticeMessage>
          )}

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleConvert}
              disabled={processing}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
            >
              {processing ? "Converting…" : `Convert to ${FORMAT_LABELS[format]}`}
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
            title={`Converted to ${FORMAT_LABELS[format]}`}
            detail={`${formatBytes(result.originalSize)} → ${formatBytes(result.blob.size)}`}
          />
          {result.grew && (
            <NoticeMessage>
              The {FORMAT_LABELS[format]}{" "}
              came out larger than the original. That&apos;s normal when
              converting a lossy source to a lossless format, or when the source was already
              well-compressed. Lower the quality or pick a different format if size matters.
            </NoticeMessage>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
            >
              Download {result.filename}
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
