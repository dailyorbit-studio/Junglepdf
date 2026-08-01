"use client";

import { useState, useCallback } from "react";
import FileDropZone from "./FileDropZone";
import ProgressBar from "./ProgressBar";
import ResultBanner from "./ResultBanner";
import ErrorMessage from "./ErrorMessage";
import NoticeMessage from "./NoticeMessage";
import { gifToMp4, apngToGif, type AnimatedResult } from "@/lib/animated-convert";
import { isEngineLoaded } from "@/lib/ffmpeg";
import { downloadBlob } from "@/lib/download";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * The GIF → MP4 and APNG → GIF converter.
 *
 * A single-purpose component rather than a mode on the video converter,
 * because the video converter's first act is to read the duration out of a
 * `<video>` element and neither of these formats can be loaded into one.
 */
export default function AnimatedConvertTool({ mode }: { mode: "gif-to-mp4" | "apng-to-gif" }) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<AnimatedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const gif = mode === "gif-to-mp4";

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const output = await (gif ? gifToMp4 : apngToGif)(file, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during conversion.");
    } finally {
      setProcessing(false);
    }
  }, [file, gif]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const targetLabel = gif ? "MP4" : "GIF";

  return (
    <>
      {!file && (
        <FileDropZone
          accept={gif ? ".gif" : ".apng,.png"}
          maxFileSizeMB={200}
          onFiles={handleFiles}
          label={gif ? "Choose a GIF" : "Choose an animated PNG"}
          sublabel={gif ? "GIF — up to 200MB" : "APNG or animated PNG — up to 200MB"}
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-surface-raised rounded-lg">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{file.name}</p>
              <p className="text-xs text-ink-muted mt-0.5">{formatBytes(file.size)}</p>
            </div>
            <button
              onClick={reset}
              disabled={processing}
              className="text-xs text-ink-muted hover:text-error disabled:opacity-40 transition-colors shrink-0 ml-3"
            >
              Remove
            </button>
          </div>

          <NoticeMessage>
            {gif
              ? "MP4 stores motion between frames; GIF stores every frame in full. The result is usually a small fraction of the original size, and it will loop the same way in a browser."
              : "GIF holds 256 colours and no partial transparency, while APNG holds millions and full alpha. Some quality is always lost here — it is worth doing only when the destination cannot read APNG."}
          </NoticeMessage>

          {!isEngineLoaded() && !processing && (
            <p className="text-xs text-ink-muted">
              The first run downloads a 32MB media engine. It happens once per visit.
            </p>
          )}

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <button onClick={handleConvert} disabled={processing} className="btn btn-primary btn-block">
            {processing ? "Converting…" : `Convert to ${targetLabel}`}
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <ResultBanner
            title={`Converted to ${targetLabel}`}
            detail={`${formatBytes(result.originalSize)} → ${formatBytes(result.blob.size)}`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download {result.filename}
            </button>
            <button onClick={reset} className="btn btn-secondary">
              Convert another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
