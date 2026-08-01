"use client";

import { useState, useCallback, useMemo } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  convertAudio,
  detectSourceFormat,
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

/** `initialFormat` pre-selects the output for the /convert/ landing pages. */
export default function AudioConverterTool({
  initialFormat,
}: {
  initialFormat?: AudioFormat;
} = {}) {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<AudioFormat>(initialFormat ?? "mp3");
  const [bitrate, setBitrate] = useState<number>(192);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<AudioConvertResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sourceFormat = useMemo(() => (file ? detectSourceFormat(file) : null), [file]);

  const handleFiles = useCallback((files: File[]) => {
    const selected = files[0];
    setFile(selected);
    setResult(null);
    setError(null);

    // Step off the source format rather than leaving a disabled button
    // selected and the action reading "Convert to MP3" on an MP3.
    const source = detectSourceFormat(selected);
    setFormat((current) =>
      current === source ? (FORMATS.find((f) => f !== source) ?? current) : current
    );
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
          label="Choose an audio file"
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
              {FORMATS.map((f) => {
                const isSource = f === sourceFormat;
                return (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    disabled={isSource}
                    title={isSource ? `This file is already ${AUDIO_FORMATS[f].label}` : undefined}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                      isSource
                        ? "border-border-subtle bg-surface-raised text-ink-muted/55 cursor-not-allowed"
                        : format === f
                          ? "border-accent bg-accent-subtle text-accent"
                          : "border-border text-ink-muted hover:text-ink hover:border-ink-muted"
                    }`}
                  >
                    {AUDIO_FORMATS[f].label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-ink-muted mt-2">{spec.note}</p>
            {sourceFormat && (
              <p className="text-xs text-ink-muted mt-1">
                This file is already {AUDIO_FORMATS[sourceFormat].label}, so that option is off.
              </p>
            )}
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
              className="flex-1 btn btn-primary"
            >
              {processing ? "Converting…" : `Convert to ${spec.label}`}
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
            title={`Converted to ${spec.label}`}
            detail={`${formatBytes(result.originalSize)} → ${formatBytes(result.blob.size)}`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download {result.filename}
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Convert another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
