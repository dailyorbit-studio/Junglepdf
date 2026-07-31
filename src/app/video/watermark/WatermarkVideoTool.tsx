"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import { OptionGroup, ChoiceRow } from "@/components/FileToolRunner";
import {
  watermarkVideo,
  WATERMARK_POSITION_LABELS,
  type WatermarkPosition,
  type VideoResult,
} from "@/lib/video-tools";
import { downloadBlob } from "@/lib/download";

const POSITIONS = (Object.keys(WATERMARK_POSITION_LABELS) as WatermarkPosition[]).map((value) => ({
  value,
  label: WATERMARK_POSITION_LABELS[value],
}));

/**
 * Two inputs, so this does not use FileToolRunner — the runner is built around
 * a single file and bending it to take a second would make it worse for the
 * twenty tools that only need one.
 */
export default function WatermarkVideoTool() {
  const [video, setVideo] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);

  const [position, setPosition] = useState<WatermarkPosition>("bottom-right");
  const [opacity, setOpacity] = useState(0.7);
  const [scalePercent, setScalePercent] = useState(20);
  const [margin, setMargin] = useState(24);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = useCallback(async () => {
    if (!video || !logo) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await watermarkVideo(
        video,
        logo,
        { position, opacity, scalePercent, margin },
        (step, pct) => {
          setProgressLabel(step);
          setProgress(pct);
        }
      );
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setProcessing(false);
    }
  }, [video, logo, position, opacity, scalePercent, margin]);

  const reset = () => {
    setVideo(null);
    setLogo(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  if (result) {
    return (
      <div className="space-y-5">
        <ResultBanner
          title="Watermark applied"
          detail={`${(result.blob.size / (1024 * 1024)).toFixed(1)}MB`}
        />
        <div className="flex gap-3">
          <button
            onClick={() => downloadBlob(result.blob, result.filename)}
            className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
          >
            Download watermarked video
          </button>
          <button
            onClick={reset}
            className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised rounded-lg transition-colors duration-150"
          >
            Do another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="block text-xs font-medium text-ink-secondary mb-1.5">1. The video</span>
        {video ? (
          <div className="p-3 bg-surface-raised rounded-lg flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{video.name}</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {(video.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <button
              onClick={() => setVideo(null)}
              disabled={processing}
              className="shrink-0 text-xs text-ink-muted hover:text-ink disabled:opacity-40"
            >
              Change
            </button>
          </div>
        ) : (
          <FileDropZone
            accept=".mp4,.mkv,.avi,.webm,.mov"
            maxFileSizeMB={500}
            onFiles={(files) => {
              setVideo(files[0]);
              setError(null);
            }}
            label="Drop a video here"
            sublabel="MP4, MKV, AVI, WebM or MOV — up to 500MB"
          />
        )}
      </div>

      <div>
        <span className="block text-xs font-medium text-ink-secondary mb-1.5">
          2. The logo or watermark
        </span>
        {logo ? (
          <div className="p-3 bg-surface-raised rounded-lg flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{logo.name}</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {(logo.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              onClick={() => setLogo(null)}
              disabled={processing}
              className="shrink-0 text-xs text-ink-muted hover:text-ink disabled:opacity-40"
            >
              Change
            </button>
          </div>
        ) : (
          <FileDropZone
            accept=".png,.jpg,.jpeg,.webp"
            maxFileSizeMB={20}
            onFiles={(files) => {
              setLogo(files[0]);
              setError(null);
            }}
            label="Drop a PNG or JPEG"
            sublabel="A transparent PNG gives the cleanest result"
          />
        )}
      </div>

      {video && logo && (
        <>
          <OptionGroup label="Position">
            <ChoiceRow
              value={position}
              options={POSITIONS}
              onChange={setPosition}
              disabled={processing}
            />
          </OptionGroup>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="wm-opacity" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Opacity — {Math.round(opacity * 100)}%
              </label>
              <input
                id="wm-opacity"
                type="range"
                min={10}
                max={100}
                value={Math.round(opacity * 100)}
                disabled={processing}
                onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                className="w-full accent-accent"
              />
            </div>
            <div>
              <label htmlFor="wm-size" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Size — {scalePercent}% of width
              </label>
              <input
                id="wm-size"
                type="range"
                min={5}
                max={50}
                value={scalePercent}
                disabled={processing}
                onChange={(e) => setScalePercent(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
            <div>
              <label htmlFor="wm-margin" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Margin — {margin}px
              </label>
              <input
                id="wm-margin"
                type="range"
                min={0}
                max={120}
                value={margin}
                disabled={processing || position === "center"}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full accent-accent disabled:opacity-40"
              />
            </div>
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            The logo is scaled relative to the video width, so the same settings look
            the same on a 720p and a 4K source. Opacity multiplies the image&apos;s own
            alpha, so a transparent PNG stays transparent rather than gaining a box.
          </p>
        </>
      )}

      {processing && <ProgressBar progress={progress} label={progressLabel} />}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <div className="flex gap-3">
        <button
          onClick={handleRun}
          disabled={processing || !video || !logo}
          className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
        >
          {processing ? "Applying…" : "Apply watermark"}
        </button>
        {(video || logo) && (
          <button
            onClick={reset}
            disabled={processing}
            className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-40 rounded-lg transition-colors duration-150"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
