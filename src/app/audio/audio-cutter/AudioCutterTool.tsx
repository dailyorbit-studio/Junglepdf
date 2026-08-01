"use client";

import { useState, useCallback, useMemo } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  decodeAudioFile,
  cutAudio,
  estimateOutputBytes,
  formatEstimatedSize,
} from "@/lib/audio-cutter";
import { downloadBlob } from "@/lib/download";

function formatTime(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  const cs = Math.floor((safe % 1) * 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

/** Selections above this get a heads-up about the WAV size before committing. */
const LARGE_OUTPUT_BYTES = 100 * 1024 * 1024;

export default function AudioCutterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [duration, setDuration] = useState(0);
  const [sampleRate, setSampleRate] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const selected = files[0];
    setFile(selected);
    setResult(null);
    setError(null);
    setDecoding(true);

    try {
      const decoded = await decodeAudioFile(selected, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setAudioBuffer(decoded.buffer);
      setDuration(decoded.duration);
      setSampleRate(decoded.sampleRate);
      setStartTime(0);
      setEndTime(decoded.duration);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not decode this audio file.");
      setFile(null);
      setAudioBuffer(null);
    } finally {
      setDecoding(false);
      setProgress(0);
    }
  }, []);

  const estimatedBytes = useMemo(
    () => (audioBuffer ? estimateOutputBytes(audioBuffer, startTime, endTime) : 0),
    [audioBuffer, startTime, endTime]
  );

  const handleCut = useCallback(async () => {
    if (!audioBuffer || !file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await cutAudio(audioBuffer, startTime, endTime, file.name, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult({ blob: output.blob, filename: output.filename });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during trimming.");
    } finally {
      setProcessing(false);
    }
  }, [audioBuffer, file, startTime, endTime]);

  const reset = () => {
    setFile(null);
    setAudioBuffer(null);
    setDuration(0);
    setSampleRate(0);
    setStartTime(0);
    setEndTime(0);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <>
      {!file && !decoding && (
        <FileDropZone
          accept=".mp3,.wav,.ogg,.m4a,.flac,.aac"
          maxFileSizeMB={200}
          onFiles={handleFiles}
          label="Choose an audio file"
          sublabel="MP3, WAV, OGG, M4A, FLAC — up to 200MB"
        />
      )}

      {/* A failed decode clears `file`, so this has to live outside the
          loaded-audio branch or the user sees a silent reset. */}
      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {decoding && <ProgressBar progress={progress} label={progressLabel} />}

      {file && audioBuffer && !result && !decoding && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-surface-raised rounded-lg">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{file.name}</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Duration: {formatTime(duration)} &middot; {(file.size / (1024 * 1024)).toFixed(1)} MB
                {sampleRate > 0 && <> &middot; {(sampleRate / 1000).toFixed(1)}kHz</>}
              </p>
            </div>
            <button
              onClick={reset}
              disabled={processing}
              className="text-xs text-ink-muted hover:text-error disabled:opacity-40 transition-colors shrink-0 ml-3"
            >
              Remove
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-time" className="block text-xs font-medium text-ink-secondary mb-1.5">
                  Start time
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="start-time"
                    type="range"
                    min={0}
                    max={duration}
                    step={0.01}
                    value={startTime}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setStartTime(Math.max(0, Math.min(v, endTime - 0.1)));
                    }}
                    className="flex-1 accent-accent"
                  />
                  <span className="text-xs text-ink-secondary tabular-nums w-20 text-right">
                    {formatTime(startTime)}
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="end-time" className="block text-xs font-medium text-ink-secondary mb-1.5">
                  End time
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="end-time"
                    type="range"
                    min={0}
                    max={duration}
                    step={0.01}
                    value={endTime}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setEndTime(Math.min(duration, Math.max(v, startTime + 0.1)));
                    }}
                    className="flex-1 accent-accent"
                  />
                  <span className="text-xs text-ink-secondary tabular-nums w-20 text-right">
                    {formatTime(endTime)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <span className="text-sm text-ink-secondary">
                Selected: <strong className="text-ink">{formatTime(endTime - startTime)}</strong>
                <span className="text-ink-muted"> &middot; ~{formatEstimatedSize(estimatedBytes)} WAV</span>
              </span>
            </div>
          </div>

          {/* WAV is uncompressed, so a long selection can be enormous. Say so
              before the user waits on an allocation that may fail. */}
          {estimatedBytes > LARGE_OUTPUT_BYTES && (
            <NoticeMessage>
              This selection produces a roughly {formatEstimatedSize(estimatedBytes)} WAV file.
              Large outputs can be slow, and may run out of memory on mobile devices.
            </NoticeMessage>
          )}

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <button
            onClick={handleCut}
            disabled={processing}
            className="btn btn-primary btn-block"
          >
            {processing ? "Trimming…" : "Trim & Download"}
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <ResultBanner title="Audio trimmed" detail={result.filename} />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download WAV
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Trim another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
