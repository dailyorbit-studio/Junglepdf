"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import VideoRangePicker from "@/components/VideoRangePicker";
import {
  videoToGif,
  estimateGifBytes,
  GIF_MAX_SECONDS,
  type VideoResult,
} from "@/lib/video-tools";
import { readMediaInfo, formatDuration, type MediaInfo } from "@/lib/media-info";
import { isEngineLoaded } from "@/lib/ffmpeg";
import { downloadBlob } from "@/lib/download";
import { useObjectUrl } from "@/hooks/use-object-url";

const FPS_OPTIONS = [8, 12, 15, 20, 25];
const WIDTH_OPTIONS = [240, 320, 480, 640];

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VideoToGifTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useObjectUrl();
  const [info, setInfo] = useState<MediaInfo | null>(null);

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [fps, setFps] = useState(12);
  const [width, setWidth] = useState(480);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [gifUrl, setGifUrl] = useObjectUrl();
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const selected = files[0];
      setError(null);
      setResult(null);
      setInfo(null);
      setGifUrl(null);

      try {
        const media = await readMediaInfo(selected, "video");
        setInfo(media);
        setStart(0);
        // Default to a range the GIF cap allows, rather than the whole file.
        setEnd(Math.min(media.duration, 5));
        setWidth(WIDTH_OPTIONS.find((w) => w >= media.width) ?? 480);
        setFile(selected);
        setPreview(selected);
      } catch (err) {
        setError(err instanceof Error ? err.message : "This video couldn't be read.");
        setFile(null);
        setPreview(null);
      }
    },
    [setPreview, setGifUrl]
  );

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const output = await videoToGif(
        file,
        { startSeconds: start, endSeconds: end, fps, width },
        (step, pct) => {
          setProgressLabel(step);
          setProgress(pct);
        }
      );
      setResult(output);
      setGifUrl(output.blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong building the GIF.");
    } finally {
      setProcessing(false);
    }
  }, [file, start, end, fps, width, setGifUrl]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setInfo(null);
    setResult(null);
    setGifUrl(null);
    setError(null);
    setProgress(0);
  };

  const selectionSeconds = end - start;
  const tooLong = selectionSeconds > GIF_MAX_SECONDS;
  const aspect = info && info.height > 0 ? info.width / info.height : 16 / 9;
  const estimate = estimateGifBytes(selectionSeconds, fps, width, aspect);

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
          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {info.width} × {info.height} · {formatDuration(info.duration)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-medium text-ink-secondary mb-1.5">
                Frame rate
              </span>
              <div className="flex flex-wrap gap-2">
                {FPS_OPTIONS.map((value) => (
                  <button
                    key={value}
                    onClick={() => setFps(value)}
                    className={`px-2.5 py-1.5 text-xs rounded-md border transition-colors ${
                      fps === value
                        ? "border-accent bg-accent-subtle text-accent"
                        : "border-border text-ink-muted hover:text-ink"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-ink-secondary mb-1.5">Width</span>
              <div className="flex flex-wrap gap-2">
                {WIDTH_OPTIONS.map((value) => (
                  <button
                    key={value}
                    onClick={() => setWidth(value)}
                    className={`px-2.5 py-1.5 text-xs rounded-md border transition-colors ${
                      width === value
                        ? "border-accent bg-accent-subtle text-accent"
                        : "border-border text-ink-muted hover:text-ink"
                    }`}
                  >
                    {value}px
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-ink-muted">
            Roughly {formatBytes(estimate)} at {fps} fps and {width}px wide — a rough estimate;
            detailed or fast-moving footage runs larger. Height follows the aspect ratio.
          </p>

          {tooLong && (
            <ErrorMessage>
              The selection is {formatDuration(selectionSeconds)}. GIFs are capped at{" "}
              {GIF_MAX_SECONDS} seconds here — beyond that the file becomes enormous and the encode
              very slow. Move the handles closer together.
            </ErrorMessage>
          )}

          <NoticeMessage>
            GIF has no audio and only 256 colours per frame. The tool builds a palette from your
            actual footage first, which is what avoids the muddy, banded look of a naive conversion —
            but it still means two encoding passes, so this is slower than trimming.
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
              onClick={handleConvert}
              disabled={processing || tooLong || selectionSeconds <= 0}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Building GIF…" : `Create GIF from ${formatDuration(selectionSeconds)}`}
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
            title="GIF created"
            detail={`${width}px wide · ${fps} fps · ${formatBytes(result.blob.size)}`}
          />

          {gifUrl && (
            <div className="rounded-lg overflow-hidden border border-border-subtle bg-surface-raised flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gifUrl} alt="The generated GIF, playing" className="max-w-full" />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download GIF
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Make another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
