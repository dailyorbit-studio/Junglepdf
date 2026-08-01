"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import BlobAudio from "@/components/BlobAudio";
import {
  changeAudioSpeed,
  MIN_SPEED,
  MAX_SPEED,
  SPEED_PRESETS,
  type SpeedMode,
  type SpeedResult,
} from "@/lib/audio-speed";
import { downloadBlob } from "@/lib/download";

const MODES: { value: SpeedMode; label: string; note: string }[] = [
  {
    value: "tempo",
    label: "Keep pitch",
    note: "Plays faster or slower, voices sound normal. For podcasts and lectures.",
  },
  {
    value: "tape",
    label: "Change pitch",
    note: "Pitch rises and falls with speed, like a record player. The chipmunk effect.",
  },
];

export default function AudioSpeedTool() {
  const [file, setFile] = useState<File | null>(null);
  const [speed, setSpeed] = useState(1.5);
  const [mode, setMode] = useState<SpeedMode>("tempo");

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<SpeedResult | null>(null);
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
      const output = await changeAudioSpeed(file, speed, mode, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while retiming.");
    } finally {
      setProcessing(false);
    }
  }, [file, speed, mode]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setSpeed(1.5);
  };

  return (
    <>
      {!file && (
        <FileDropZone
          accept="audio/*"
          maxFileSizeMB={200}
          onFiles={handleFiles}
          label="Choose an audio file"
          sublabel="MP3, WAV, OGG, M4A, FLAC · up to 200MB"
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
              <label htmlFor="speed" className="text-xs font-medium text-ink-secondary">
                Speed
              </label>
              <span className="text-sm font-medium text-ink tabular-nums">{speed.toFixed(2)}×</span>
            </div>
            <input
              id="speed"
              type="range"
              min={MIN_SPEED}
              max={MAX_SPEED}
              step={0.05}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-[var(--color-accent)]"
            />
            <div className="flex flex-wrap gap-2 mt-2.5">
              {SPEED_PRESETS.map((preset) => (
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
          </div>

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Pitch</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MODES.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMode(option.value)}
                  className={`px-3 py-2.5 text-left rounded-lg border transition-colors ${
                    mode === option.value
                      ? "border-accent bg-accent-subtle"
                      : "border-border hover:bg-surface-raised"
                  }`}
                >
                  <span
                    className={`block text-sm font-medium ${
                      mode === option.value ? "text-accent" : "text-ink"
                    }`}
                  >
                    {option.label}
                  </span>
                  <span className="block text-xs text-ink-muted mt-0.5 leading-relaxed">
                    {option.note}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleRun}
              disabled={processing || Math.abs(speed - 1) < 0.001}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Retiming…" : `Change speed to ${speed.toFixed(2)}×`}
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
            title={`Retimed to ${result.speed}×`}
            detail={`${result.mode === "tempo" ? "Pitch preserved" : "Pitch shifted"} · ${(
              result.blob.size /
              (1024 * 1024)
            ).toFixed(1)} MB`}
          />

          <BlobAudio key={result.filename + result.blob.size} blob={result.blob} />

          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
