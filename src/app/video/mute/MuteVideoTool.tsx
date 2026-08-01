"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import { muteVideo, type VideoResult } from "@/lib/video-tools";
import { readMediaInfo, formatDuration, type MediaInfo } from "@/lib/media-info";
import { isEngineLoaded } from "@/lib/ffmpeg";
import { downloadBlob } from "@/lib/download";
import { useObjectUrl } from "@/hooks/use-object-url";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MuteVideoTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useObjectUrl();
  const [info, setInfo] = useState<MediaInfo | null>(null);

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

  const handleMute = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const output = await muteVideo(file, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while removing audio.");
    } finally {
      setProcessing(false);
    }
  }, [file]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setInfo(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".mp4,.mkv,.avi,.webm,.mov,.wmv,.flv"
          maxFileSizeMB={2048}
          onFiles={handleFiles}
          label="Choose a video"
          sublabel="MP4, MKV, AVI, WebM, MOV — up to 2GB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && info && !result && (
        <div className="space-y-6">
          {preview && (
            <div className="rounded-lg overflow-hidden bg-black border border-border-subtle">
              <video src={preview} controls preload="metadata" className="w-full max-h-80 block" />
            </div>
          )}

          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {info.width} × {info.height} · {formatDuration(info.duration)} ·{" "}
              {formatBytes(file.size)}
            </p>
          </div>

          <NoticeMessage>
            The picture is copied across untouched — only the audio track is dropped. That means no
            re-encoding, no quality loss, and a result that lands in seconds rather than minutes.
          </NoticeMessage>

          {!isEngineLoaded() && !processing && (
            <p className="text-xs text-ink-muted">
              The first run downloads a 32MB media engine. It happens once per visit.
            </p>
          )}

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleMute}
              disabled={processing}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Removing audio…" : "Remove audio track"}
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
            title="Audio removed"
            detail={`${formatBytes(result.originalSize)} → ${formatBytes(result.blob.size)}`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download muted video
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Mute another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
