"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import { extractFrames, MAX_FRAMES, type FramesResult } from "@/lib/video-tools";
import { downloadBlob } from "@/lib/download";

const RATES = [
  { value: 0.2, label: "1 every 5s", note: "Contact sheet of a long clip." },
  { value: 1, label: "1 per second", note: "The usual choice." },
  { value: 5, label: "5 per second", note: "Catching a fast moment." },
  { value: 15, label: "15 per second", note: "Near every frame. Hits the cap quickly." },
];

const FORMATS = [
  { value: "png" as const, label: "PNG", note: "Lossless, larger files." },
  { value: "jpg" as const, label: "JPG", note: "Smaller, slight quality loss." },
];

export default function ExtractFramesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [fps, setFps] = useState(1);
  const [format, setFormat] = useState<"png" | "jpg">("jpg");

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<FramesResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError(null);
  }, []);

  const handleExtract = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await extractFrames(file, fps, format, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while extracting.");
    } finally {
      setProcessing(false);
    }
  }, [file, fps, format]);

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
            <p className="text-xs text-ink-muted mt-0.5">
              {(file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          </div>

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">
              How often to grab a frame
            </span>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {RATES.map((rate) => (
                <button
                  key={rate.value}
                  onClick={() => setFps(rate.value)}
                  className={`px-3 py-2.5 text-left rounded-lg border transition-colors ${
                    fps === rate.value
                      ? "border-accent bg-accent-subtle"
                      : "border-border hover:bg-surface-raised"
                  }`}
                >
                  <span
                    className={`block text-sm font-medium ${
                      fps === rate.value ? "text-accent" : "text-ink"
                    }`}
                  >
                    {rate.label}
                  </span>
                  <span className="block text-xs text-ink-muted mt-0.5 leading-relaxed">
                    {rate.note}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Image format</span>
            <div className="flex gap-2">
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
                  {f.label} — {f.note}
                </button>
              ))}
            </div>
          </div>

          <NoticeMessage>
            Capped at {MAX_FRAMES} frames per run. Beyond that the browser tab runs out of
            memory bundling the ZIP rather than producing a download.
          </NoticeMessage>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleExtract}
              disabled={processing}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Extracting…" : "Extract frames"}
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
            title={`${result.frameCount} frame${result.frameCount === 1 ? "" : "s"} extracted`}
            detail={`${(result.blob.size / (1024 * 1024)).toFixed(1)} MB ZIP`}
          />

          {result.frameCount >= MAX_FRAMES && (
            <NoticeMessage>
              The {MAX_FRAMES}-frame cap was reached, so extraction stopped before the end of
              the video. Choose a longer interval to cover the whole clip.
            </NoticeMessage>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download ZIP
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Another video
            </button>
          </div>
        </div>
      )}
    </>
  );
}
