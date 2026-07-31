"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  changeVideoSpeed,
  MIN_VIDEO_SPEED,
  MAX_VIDEO_SPEED,
  type VideoResult,
} from "@/lib/video-tools";
import { downloadBlob } from "@/lib/download";

const PRESETS = [0.5, 0.75, 1.5, 2, 4];

export default function VideoSpeedTool() {
  const [file, setFile] = useState<File | null>(null);
  const [speed, setSpeed] = useState(2);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError(null);
  }, []);

  const handleRun = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await changeVideoSpeed(file, speed, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while retiming.");
    } finally {
      setProcessing(false);
    }
  }, [file, speed]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setSpeed(2);
  };

  return (
    <>
      {!file && (
        <FileDropZone
          accept="video/*"
          maxFileSizeMB={500}
          onFiles={handleFiles}
          label="Drop a video here, or click to browse"
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
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="video-speed" className="text-xs font-medium text-ink-secondary">
                Speed
              </label>
              <span className="text-sm font-medium text-ink tabular-nums">{speed.toFixed(2)}×</span>
            </div>
            <input
              id="video-speed"
              type="range"
              min={MIN_VIDEO_SPEED}
              max={MAX_VIDEO_SPEED}
              step={0.05}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-[var(--color-accent)]"
            />
            <div className="flex flex-wrap gap-2 mt-2.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSpeed(preset)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    Math.abs(speed - preset) < 0.001
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border text-ink-secondary hover:bg-surface-raised"
                  }`}
                >
                  {preset}×
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-muted mt-2">
              Below 1× is slow motion; above is a timelapse. Audio is retimed to match, so
              it stays in sync.
            </p>
          </div>

          <NoticeMessage>
            Retiming re-encodes the video, and WebAssembly is roughly ten times slower than
            native FFmpeg. Expect several minutes on a long clip, and keep this tab visible.
          </NoticeMessage>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleRun}
              disabled={processing || Math.abs(speed - 1) < 0.001}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
            >
              {processing ? "Retiming…" : `Change speed to ${speed.toFixed(2)}×`}
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
            title="Video retimed"
            detail={`${(result.blob.size / (1024 * 1024)).toFixed(1)} MB`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
            >
              Download video
            </button>
            <button
              onClick={reset}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised rounded-lg transition-colors duration-150"
            >
              Retime another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
