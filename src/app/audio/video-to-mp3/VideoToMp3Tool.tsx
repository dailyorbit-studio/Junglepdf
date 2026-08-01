"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import { extractAudioFromVideo } from "@/lib/audio-extractor";
import { isEngineLoaded } from "@/lib/ffmpeg";
import { downloadBlob } from "@/lib/download";

export default function VideoToMp3Tool() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError(null);
    setProgress(0);
    setProgressLabel("");
  }, []);

  const handleExtract = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await extractAudioFromVideo(file, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult({ blob: output.blob, filename: output.filename });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during extraction.");
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
          accept=".mp4,.mkv,.avi,.webm,.mov,.wmv,.flv"
          maxFileSizeMB={500}
          onFiles={handleFiles}
          label="Choose a video file"
          sublabel="MP4, MKV, AVI, WebM, MOV — up to 500MB"
        />
      )}

      {/* Errors render outside the file/result branches so a failure that
          clears state still shows why. */}
      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-surface-raised rounded-lg">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{file.name}</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
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

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          {!isEngineLoaded() && !processing && (
            <p className="text-xs text-ink-muted">
              The first run downloads a 32MB media engine. It happens once per visit.
            </p>
          )}

          <button
            onClick={handleExtract}
            disabled={processing}
            className="btn btn-primary btn-block"
          >
            {processing ? "Extracting audio…" : "Extract MP3"}
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <ResultBanner title="Audio extracted" detail={result.filename} />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download MP3
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
