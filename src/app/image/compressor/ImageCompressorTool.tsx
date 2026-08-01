"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import { compressImage } from "@/lib/image-compressor";
import { downloadBlob } from "@/lib/download";
import { useObjectUrl } from "@/hooks/use-object-url";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  quality: number;
  iterations: number;
  targetMissed: boolean;
}

export default function ImageCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useObjectUrl();
  const [targetKB, setTargetKB] = useState(100);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: File[]) => {
      const selected = files[0];
      setFile(selected);
      setResult(null);
      setError(null);
      setProgress(0);
      setPreview(selected);
    },
    [setPreview]
  );

  const handleCompress = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await compressImage(file, targetKB, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during compression.");
    } finally {
      setProcessing(false);
    }
  }, [file, targetKB]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const reduction = result
    ? Math.round(((result.originalSize - result.compressedSize) / result.originalSize) * 100)
    : 0;

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".jpg,.jpeg,.png,.webp"
          maxFileSizeMB={50}
          onFiles={handleFiles}
          label="Choose an image"
          sublabel="JPEG, PNG, WebP — up to 50MB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-5">
            {preview && (
              <div className="sm:w-40 sm:h-40 w-full h-48 rounded-lg overflow-hidden bg-surface-raised border border-border-subtle flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview of the selected image" className="w-full h-full object-contain" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{file.name}</p>
              <p className="text-xs text-ink-muted mt-1">
                Original size: {formatBytes(file.size)}
              </p>

              <div className="mt-4">
                <label htmlFor="target-kb" className="block text-xs font-medium text-ink-secondary mb-1.5">
                  Target file size (KB)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="target-kb"
                    type="number"
                    min={5}
                    max={10000}
                    value={targetKB}
                    onChange={(e) =>
                      setTargetKB(Math.min(10000, Math.max(5, parseInt(e.target.value, 10) || 100)))
                    }
                    className="w-28 px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                  />
                  <span className="text-xs text-ink-muted">KB</span>
                </div>

                <div className="flex gap-2 mt-2">
                  {[50, 100, 200, 500].map((kb) => (
                    <button
                      key={kb}
                      onClick={() => setTargetKB(kb)}
                      className={`px-2.5 py-1 text-xs rounded-md border transition-colors duration-150 ${
                        targetKB === kb
                          ? "border-accent bg-accent-subtle text-accent"
                          : "border-border text-ink-muted hover:border-ink-muted"
                      }`}
                    >
                      {kb}KB
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleCompress}
              disabled={processing}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Compressing…" : `Compress to ~${targetKB}KB`}
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

      {result && file && (
        <div className="space-y-5">
          <ResultBanner title="Compression complete">
            <div className="mt-3 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-green-700">Original</p>
                <p className="text-sm font-semibold text-green-900">{formatBytes(result.originalSize)}</p>
              </div>
              <div>
                <p className="text-xs text-green-700">Compressed</p>
                <p className="text-sm font-semibold text-green-900">{formatBytes(result.compressedSize)}</p>
              </div>
              <div>
                <p className="text-xs text-green-700">Reduction</p>
                <p className="text-sm font-semibold text-green-900">{Math.max(0, reduction)}%</p>
              </div>
            </div>
          </ResultBanner>

          {/* Say so rather than quietly handing back an oversized file. */}
          {result.targetMissed && (
            <NoticeMessage>
              Even at the lowest quality this image compresses to{" "}
              {formatBytes(result.compressedSize)}, above your {targetKB}KB target. To go
              smaller, reduce the dimensions first with the Image Resizer.
            </NoticeMessage>
          )}

          <div className="flex gap-3">
            <button
              onClick={() =>
                downloadBlob(result.blob, `${file.name.replace(/\.[^.]+$/, "")}_compressed.jpg`)
              }
              className="flex-1 btn btn-primary"
            >
              Download compressed image
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Compress another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
