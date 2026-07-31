"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import VideoRangePicker from "@/components/VideoRangePicker";
import { trimVideo, type VideoResult } from "@/lib/video-tools";
import { readMediaInfo, formatDuration, type MediaInfo } from "@/lib/media-info";
import { isEngineLoaded } from "@/lib/ffmpeg";
import { downloadBlob } from "@/lib/download";
import { useObjectUrl } from "@/hooks/use-object-url";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VideoTrimmerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useObjectUrl();
  const [info, setInfo] = useState<MediaInfo | null>(null);

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const selected = files[0];
      setError(null);
      setResult(null);
      setInfo(null);

      try {
        const media = await readMediaInfo(selected, "video");
        setInfo(media);
        setStart(0);
        setEnd(media.duration);
        setFile(selected);
        setPreview(selected);
      } catch (err) {
        setError(err instanceof Error ? err.message : "This video couldn't be read.");
        setFile(null);
        setPreview(null);
      }
    },
    [setPreview]
  );

  const handleTrim = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const output = await trimVideo(file, start, end, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while trimming.");
    } finally {
      setProcessing(false);
    }
  }, [file, start, end]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setInfo(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const wholeFile = info !== null && start === 0 && end >= info.duration;

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".mp4,.mkv,.avi,.webm,.mov,.wmv,.flv"
          maxFileSizeMB={2048}
          onFiles={handleFiles}
          label="Drop a video here, or click to browse"
          sublabel="MP4, MKV, AVI, WebM, MOV — up to 2GB"
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

          {preview && (
            <VideoRangePicker
              src={preview}
              duration={info.duration}
              start={start}
              end={end}
              onChange={(s, e) => {
                setStart(s);
                setEnd(e);
              }}
              disabled={processing}
            />
          )}

          <NoticeMessage>
            Trimming copies the video stream instead of re-encoding it, which is why it finishes in
            seconds and loses no quality. The tradeoff is that the cut can only start on a keyframe,
            so the result may begin up to a second or two before the point you picked.
          </NoticeMessage>

          {!isEngineLoaded() && !processing && (
            <p className="text-xs text-ink-muted">
              The first trim downloads a 32MB media engine. It happens once per visit.
            </p>
          )}

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleTrim}
              disabled={processing || wholeFile}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
            >
              {processing
                ? "Trimming…"
                : wholeFile
                  ? "Move a handle to select a range"
                  : `Trim to ${formatDuration(end - start)}`}
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
            title="Video trimmed"
            detail={`${formatDuration(end - start)} · ${formatBytes(result.blob.size)}`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
            >
              Download trimmed video
            </button>
            <button
              onClick={reset}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised rounded-lg transition-colors duration-150"
            >
              Trim another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
