"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import { compressVideo, CRF_PRESETS, type CompressResult } from "@/lib/video-tools";
import { downloadBlob } from "@/lib/download";

function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CompressVideoTool() {
  const [file, setFile] = useState<File | null>(null);
  const [crf, setCrf] = useState<number>(26);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<CompressResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError(null);
  }, []);

  const handleCompress = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await compressVideo(file, crf, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while compressing.");
    } finally {
      setProcessing(false);
    }
  }, [file, crf]);

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
          accept="video/*"
          maxFileSizeMB={500}
          onFiles={handleFiles}
          label="Choose a video"
          sublabel="MP4, MKV, AVI, WebM, MOV · up to 500MB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-6">
          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">{formatMB(file.size)}</p>
          </div>

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Quality</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {CRF_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setCrf(preset.value)}
                  className={`px-3 py-2.5 text-left rounded-lg border transition-colors ${
                    crf === preset.value
                      ? "border-accent bg-accent-subtle"
                      : "border-border hover:bg-surface-raised"
                  }`}
                >
                  <span
                    className={`block text-sm font-medium ${
                      crf === preset.value ? "text-accent" : "text-ink"
                    }`}
                  >
                    {preset.label}
                  </span>
                  <span className="block text-xs text-ink-muted mt-0.5 leading-relaxed">
                    {preset.note}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <NoticeMessage>
            Compressing re-encodes the whole video, and WebAssembly runs roughly ten times
            slower than native FFmpeg. Expect several minutes for a long clip, and keep this
            tab visible while it works.
          </NoticeMessage>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleCompress}
              disabled={processing}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Compressing…" : "Compress video"}
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
            title={result.saved > 0 ? `${Math.round(result.saved * 100)}% smaller` : "Compression finished"}
            detail={`${formatMB(result.originalSize)} → ${formatMB(result.outputSize)}`}
          />

          {result.saved <= 0 && (
            <NoticeMessage>
              The compressed file came out larger than the original. That happens when the
              source was already efficiently encoded at a lower bitrate than this quality
              setting targets — try the &ldquo;Small&rdquo; preset, or keep your original.
            </NoticeMessage>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download compressed video
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
