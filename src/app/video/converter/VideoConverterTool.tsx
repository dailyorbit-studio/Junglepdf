"use client";

import { useState, useCallback, useMemo } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  convertVideo,
  detectSourceFormat,
  VIDEO_FORMATS,
  CRF_PRESETS,
  type VideoFormat,
  type VideoResult,
} from "@/lib/video-tools";
import { readMediaInfo, formatDuration, type MediaInfo } from "@/lib/media-info";
import { downloadBlob } from "@/lib/download";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FORMATS = Object.keys(VIDEO_FORMATS) as VideoFormat[];

/** `initialFormat` pre-selects the output for the /convert/ landing pages. */
export default function VideoConverterTool({
  initialFormat,
}: {
  initialFormat?: VideoFormat;
} = {}) {
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<MediaInfo | null>(null);

  const [format, setFormat] = useState<VideoFormat>(initialFormat ?? "mp4");
  const [crf, setCrf] = useState<number>(26);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sourceFormat = useMemo(() => (file ? detectSourceFormat(file) : null), [file]);

  const handleFiles = useCallback(async (files: File[]) => {
    const selected = files[0];
    // Step off the source container so the action never reads "Convert to MP4"
    // on a file that is already an MP4.
    const source = detectSourceFormat(selected);
    setFormat((current) =>
      current === source ? (FORMATS.find((f) => f !== source) ?? current) : current
    );
    setError(null);
    setResult(null);
    setInfo(null);

    try {
      const media = await readMediaInfo(selected, "video");
      setInfo(media);
      setFile(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "This video couldn't be read.");
      setFile(null);
    }
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const output = await convertVideo(file, format, crf, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during conversion.");
    } finally {
      setProcessing(false);
    }
  }, [file, format, crf]);

  const reset = () => {
    setFile(null);
    setInfo(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const spec = VIDEO_FORMATS[format];

  // Rough guide only. WASM encoding lands somewhere around real time on a
  // desktop and much worse on a phone, so this is a floor rather than a promise.
  const roughMinutes = info ? Math.max(1, Math.round(info.duration / 45)) : 0;

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".mp4,.mkv,.avi,.webm,.mov,.wmv,.flv"
          maxFileSizeMB={1024}
          onFiles={handleFiles}
          label="Choose a video"
          sublabel="MP4, MKV, AVI, WebM, MOV — up to 1GB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && info && !result && (
        <div className="space-y-6">
          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {info.width} × {info.height} · {formatDuration(info.duration)} ·{" "}
              {formatBytes(file.size)}
            </p>
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
                    title={isSource ? `This file is already ${VIDEO_FORMATS[f].label}` : undefined}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                      isSource
                        ? "border-border-subtle bg-surface-raised text-ink-muted/55 cursor-not-allowed"
                        : format === f
                          ? "border-accent bg-accent-subtle text-accent"
                          : "border-border text-ink-muted hover:text-ink hover:border-ink-muted"
                    }`}
                  >
                    {VIDEO_FORMATS[f].label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-ink-muted mt-2">{spec.note}</p>
            {sourceFormat && (
              <p className="text-xs text-ink-muted mt-1">
                This file is already {VIDEO_FORMATS[sourceFormat].label}. Re-encoding it to the
                same format would cost quality for nothing, so that option is off — use{" "}
                <a href="/video/compress/" className="text-accent hover:underline">
                  Compress Video
                </a>{" "}
                if you want to shrink it.
              </p>
            )}
          </div>

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Quality</span>
            <div className="flex flex-wrap gap-2">
              {CRF_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setCrf(preset.value)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    crf === preset.value
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border text-ink-muted hover:text-ink"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-muted mt-2">
              {CRF_PRESETS.find((p) => p.value === crf)?.note}
            </p>
          </div>

          <NoticeMessage>
            This is a real re-encode — every frame is decoded and compressed again. In WebAssembly
            that runs far slower than native FFmpeg, so expect roughly {roughMinutes} minute
            {roughMinutes === 1 ? "" : "s"} or more for this file, and keep the tab open. If you only
            need to shorten the video or drop its audio, the Trimmer and Muter do that in seconds
            without re-encoding.
          </NoticeMessage>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleConvert}
              disabled={processing}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Encoding… keep this tab open" : `Convert to ${spec.label}`}
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
