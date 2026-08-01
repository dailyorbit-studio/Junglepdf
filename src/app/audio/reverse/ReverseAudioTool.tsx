"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import BlobAudio from "@/components/BlobAudio";
import { reverseAudio, type ReverseResult } from "@/lib/audio-reverse";
import { downloadBlob } from "@/lib/download";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ReverseAudioTool() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ReverseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError(null);
  }, []);

  const handleReverse = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await reverseAudio(file, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while reversing.");
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

          <p className="text-xs text-ink-muted">
            The whole track is played backwards, sample by sample. Output is a lossless
            WAV, which will be considerably larger than an MP3 input.
          </p>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleReverse}
              disabled={processing}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Reversing…" : "Reverse audio"}
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
            title="Audio reversed"
            detail={`${formatDuration(result.duration)} · ${(result.blob.size / (1024 * 1024)).toFixed(1)} MB WAV`}
          />

          <NoticeMessage>
            Decoded at {result.sampleRate.toLocaleString()} Hz. Browsers decode audio at
            the device&apos;s output rate, so a 44,100 Hz source is resampled on the way
            in — there is no way around that in the Web Audio API.
          </NoticeMessage>

          <BlobAudio key={result.filename + result.blob.size} blob={result.blob} />

          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download reversed WAV
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Reverse another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
