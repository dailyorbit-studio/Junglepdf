"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  convertAudio,
  AUDIO_FORMATS,
  BITRATES,
  type AudioFormat,
  type AudioConvertResult,
} from "@/lib/audio-converter";
import { isEngineLoaded } from "@/lib/ffmpeg";
import { downloadBlob } from "@/lib/download";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FORMATS = Object.keys(AUDIO_FORMATS) as AudioFormat[];

export default function AudioConverterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<AudioFormat>("mp3");
  const [bitrate, setBitrate] = useState<number>(192);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<AudioConvertResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError(null);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const output = await convertAudio(file, format, bitrate, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during conversion.");
    } finally {
      setProcessing(false);
    }
  }, [file, format, bitrate]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const spec = AUDIO_FORMATS[format];

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".mp3,.wav,.ogg,.m4a,.flac,.aac,.wma"
          maxFileSizeMB={500}
          onFiles={handleFiles}
          label="Drop an audio file here, or click to browse"
          sublabel="MP3, WAV, OGG, M4A, FLAC, AAC, WMA — up to 500MB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-6">
          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">{formatBytes(file.size)}</p>
          </div>

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Convert to</span>
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
                  {AUDIO_FORMATS[f].label}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-muted mt-2">{spec.note}</p>
          </div>

          {!spec.lossless && (
            <div>
              <span className="block text-xs font-medium text-ink-secondary mb-1.5">
                Bitrate ({bitrate} kbps)
              </span>
              <div className="flex flex-wrap gap-2">
                {BITRATES.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setBitrate(rate)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                      bitrate === rate
                        ? "border-accent bg-accent-subtle text-accent"
                        : "border-border text-ink-muted hover:text-ink"
                    }`}
                  >
                    {rate}k
                  </button>
                ))}
              </div>
            </div>
          )}

          {spec.lossless && (
            <p className="text-xs text-ink-muted">
              {spec.label} is lossless, so there is no bitrate to choose — the file size follows
              from the audio itself.
            </p>
          )}

          {!isEngineLoaded() && !processing && (
            <NoticeMessage>
              The first conversion downloads a 32MB media engine. It happens once per visit and is
              cached afterwards.
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
              {processing ? "Converting…" : `Convert to ${spec.label}`}
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
            title={`Converted to ${spec.label}`}
            detail={`${formatBytes(result.originalSize)} → ${formatBytes(result.blob.size)}`}
          />
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
