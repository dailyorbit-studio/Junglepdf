"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import IconButton from "@/components/IconButton";
import NoticeMessage from "@/components/NoticeMessage";
import {
  mergeVideos,
  MERGE_MAX_FILES,
  MERGE_RESOLUTIONS,
  type MergeVideoResult,
} from "@/lib/video-tools";
import { downloadBlob } from "@/lib/download";

export default function MergeVideoTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState<number>(1280);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<MergeVideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => [...prev, ...incoming].slice(0, MERGE_MAX_FILES));
    setResult(null);
    setError(null);
  }, []);

  const move = (index: number, delta: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeAt = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleMerge = useCallback(async () => {
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await mergeVideos(files, width, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while merging.");
    } finally {
      setProcessing(false);
    }
  }, [files, width]);

  const reset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <>
      {files.length === 0 && (
        <FileDropZone
          accept="video/*"
          multiple
          maxFiles={MERGE_MAX_FILES}
          maxFileSizeMB={500}
          onFiles={handleFiles}
          label="Drop videos here, or click to browse"
          sublabel={`MP4, MKV, AVI, WebM, MOV · up to ${MERGE_MAX_FILES} files`}
        />
      )}

      {files.length === 0 && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {files.length > 0 && !result && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-ink-secondary">
                {files.length} clip{files.length === 1 ? "" : "s"} · joined top to bottom
              </span>
              <span className="text-xs text-ink-muted">
                {(totalBytes / (1024 * 1024)).toFixed(1)} MB total
              </span>
            </div>

            <ul className="space-y-2">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-3 p-3 bg-surface-raised rounded-lg"
                >
                  <span className="shrink-0 w-6 h-6 rounded-full bg-surface border border-border text-xs font-medium text-ink-secondary flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink truncate">{file.name}</p>
                    <p className="text-xs text-ink-muted">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <div className="flex items-center shrink-0">
                    <IconButton
                      onClick={() => move(i, -1)}
                      disabled={i === 0 || processing}
                      label={`Move ${file.name} earlier`}
                    >
                      ↑
                    </IconButton>
                    <IconButton
                      onClick={() => move(i, 1)}
                      disabled={i === files.length - 1 || processing}
                      label={`Move ${file.name} later`}
                    >
                      ↓
                    </IconButton>
                    <IconButton
                      onClick={() => removeAt(i)}
                      disabled={processing}
                      danger
                      label={`Remove ${file.name}`}
                    >
                      ✕
                    </IconButton>
                  </div>
                </li>
              ))}
            </ul>

            {files.length < MERGE_MAX_FILES && (
              <div className="mt-3">
                <FileDropZone
                  accept="video/*"
                  multiple
                  maxFiles={MERGE_MAX_FILES - files.length}
                  maxFileSizeMB={500}
                  onFiles={handleFiles}
                  label="Add more clips"
                  sublabel={`${MERGE_MAX_FILES - files.length} more allowed`}
                />
              </div>
            )}
          </div>

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">
              Output resolution
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {MERGE_RESOLUTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setWidth(option.value)}
                  className={`px-3 py-2.5 text-left rounded-lg border transition-colors ${
                    width === option.value
                      ? "border-accent bg-accent-subtle"
                      : "border-border hover:bg-surface-raised"
                  }`}
                >
                  <span
                    className={`block text-sm font-medium ${
                      width === option.value ? "text-accent" : "text-ink"
                    }`}
                  >
                    {option.label}
                  </span>
                  <span className="block text-xs text-ink-muted mt-0.5">{option.note}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-muted mt-2">
              Every clip is scaled to fit this frame and letterboxed if its shape differs,
              so nothing is stretched or cropped.
            </p>
          </div>

          <NoticeMessage>
            Merging re-encodes every clip so they share a format. This is slow — expect
            minutes rather than seconds — and it is the only way clips from different
            cameras join without the second half turning to garbage.
          </NoticeMessage>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleMerge}
              disabled={processing || files.length < 2}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
            >
              {processing
                ? "Merging…"
                : files.length < 2
                  ? "Add at least two clips"
                  : `Merge ${files.length} clips`}
            </button>
            <button
              onClick={reset}
              disabled={processing}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-40 rounded-lg transition-colors duration-150"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <ResultBanner
            title={`${result.fileCount} clips merged`}
            detail={`${(result.blob.size / (1024 * 1024)).toFixed(1)} MB MP4`}
          />

          {result.notice && <NoticeMessage>{result.notice}</NoticeMessage>}

          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
            >
              Download merged video
            </button>
            <button
              onClick={reset}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised rounded-lg transition-colors duration-150"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </>
  );
}
