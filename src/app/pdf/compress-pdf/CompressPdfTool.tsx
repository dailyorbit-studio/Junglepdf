"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import { compressPDF, type CompressPDFResult } from "@/lib/pdf-compressor";
import { downloadBlob } from "@/lib/download";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CompressPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<CompressPDFResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  const handleCompress = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await compressPDF(file, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during compression.");
    } finally {
      setProcessing(false);
    }
  }, [file]);

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
          label="Choose a PDF file"
          sublabel="PDF — up to 100MB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-surface-raised rounded-lg">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{file.name}</p>
              <p className="text-xs text-ink-muted mt-0.5">{formatBytes(file.size)}</p>
            </div>
            <button
              onClick={reset}
              disabled={processing}
              className="text-xs text-ink-muted hover:text-error disabled:opacity-40 transition-colors shrink-0 ml-3"
            >
              Remove
            </button>
          </div>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <button
            onClick={handleCompress}
            disabled={processing}
            className="btn btn-primary btn-block"
          >
            {processing ? "Compressing…" : "Compress PDF"}
          </button>
        </div>
      )}

      {result && file && (
        <div className="space-y-5">
          <ResultBanner
            title={result.keptOriginal ? "Already optimized" : "PDF compressed"}
          >
            <div className="mt-3 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-green-700">Original</p>
                <p className="text-sm font-semibold text-green-900">{formatBytes(result.originalSize)}</p>
              </div>
              <div>
                <p className="text-xs text-green-700">Result</p>
                <p className="text-sm font-semibold text-green-900">{formatBytes(result.compressedSize)}</p>
              </div>
              <div>
                <p className="text-xs text-green-700">Reduction</p>
                <p className="text-sm font-semibold text-green-900">{result.reduction}%</p>
              </div>
            </div>
          </ResultBanner>

          {/* Claiming success on a file we couldn't shrink would be a lie. */}
          {result.keptOriginal && (
            <NoticeMessage>
              This PDF is already efficiently structured — re-encoding it came out larger,
              so the download below is your original file, untouched.
            </NoticeMessage>
          )}

          {result.warning && <NoticeMessage>{result.warning}</NoticeMessage>}

          <div className="flex gap-3">
            <button
              onClick={() =>
                downloadBlob(result.blob, `${file.name.replace(/\.pdf$/i, "")}_compressed.pdf`)
              }
              className="flex-1 btn btn-primary"
            >
              Download PDF
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
