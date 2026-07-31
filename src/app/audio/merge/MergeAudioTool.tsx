"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import IconButton from "@/components/IconButton";
import NoticeMessage from "@/components/NoticeMessage";
import { mergeAudio, type GapSeconds, type MergeAudioResult } from "@/lib/audio-merger";
import { formatDuration } from "@/lib/media-info";
import { downloadBlob } from "@/lib/download";

const MAX_FILES = 20;
const GAPS: GapSeconds[] = [0, 0.5, 1, 2];

export default function MergeAudioTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [gap, setGap] = useState<GapSeconds>(0);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<MergeAudioResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleFiles = useCallback((incoming: File[]) => {
    setResult(null);
    setError(null);
    setNotice(null);

    setFiles((prev) => {
      const room = MAX_FILES - prev.length;
      if (incoming.length > room) {
        setNotice(
          `Only the first ${room} of ${incoming.length} files were added — the limit is ${MAX_FILES}.`
        );
      }
      return [...prev, ...incoming.slice(0, room)];
    });
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setNotice(null);
  };

  const moveFile = (from: number, to: number) => {
    if (to < 0 || to >= files.length) return;
    setFiles((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  };

  const handleMerge = useCallback(async () => {
    if (files.length < 2) {
      setError("Add at least two audio files to merge.");
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const output = await mergeAudio(files, gap, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during merging.");
    } finally {
      setProcessing(false);
    }
  }, [files, gap]);

  const reset = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setNotice(null);
    setProgress(0);
  };

  return (
    <>
      {!result && (
        <div className="space-y-5">
          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${file.size}-${i}`}
                  className="flex items-center gap-3 p-3 bg-surface-raised rounded-lg"
                >
                  <span className="text-xs font-medium text-ink-muted w-6 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{file.name}</p>
                    <p className="text-xs text-ink-muted">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <div className="flex items-center">
                    <IconButton
                      onClick={() => moveFile(i, i - 1)}
                      disabled={i === 0 || processing}
                      label={`Move ${file.name} up`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="18,15 12,9 6,15" /></svg>
                    </IconButton>
                    <IconButton
                      onClick={() => moveFile(i, i + 1)}
                      disabled={i === files.length - 1 || processing}
                      label={`Move ${file.name} down`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6,9 12,15 18,9" /></svg>
                    </IconButton>
                    <IconButton
                      onClick={() => removeFile(i)}
                      disabled={processing}
                      danger
                      label={`Remove ${file.name}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </IconButton>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {files.length < MAX_FILES && (
            <FileDropZone
              accept=".mp3,.wav,.ogg,.m4a,.flac,.aac"
              multiple
              maxFileSizeMB={200}
              maxFiles={MAX_FILES}
              onFiles={handleFiles}
              label={files.length === 0 ? "Drop audio files here, or click to browse" : "Add more audio"}
              sublabel={`MP3, WAV, OGG, M4A, FLAC · ${MAX_FILES - files.length} slots remaining`}
            />
          )}

          {notice && <NoticeMessage>{notice}</NoticeMessage>}

          {files.length > 0 && (
            <div>
              <span className="block text-xs font-medium text-ink-secondary mb-1.5">
                Gap between tracks
              </span>
              <div className="flex flex-wrap gap-2">
                {GAPS.map((value) => (
                  <button
                    key={value}
                    onClick={() => setGap(value)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                      gap === value
                        ? "border-accent bg-accent-subtle text-accent"
                        : "border-border text-ink-muted hover:text-ink"
                    }`}
                  >
                    {value === 0 ? "None" : `${value}s`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {files.length >= 2 && (
            <p className="text-xs text-ink-muted">
              Output is a lossless WAV. Everything is resampled to your device&apos;s audio rate
              during decoding — the result shows what that turned out to be.
            </p>
          )}

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          {files.length >= 2 && (
            <button
              onClick={handleMerge}
              disabled={processing}
              className="w-full py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
            >
              {processing ? "Merging…" : `Merge ${files.length} files`}
            </button>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <ResultBanner
            title="Audio merged"
            detail={`${formatDuration(result.duration)} from ${result.fileCount} files · ${(result.sampleRate / 1000).toFixed(1)}kHz · ${(result.blob.size / (1024 * 1024)).toFixed(1)} MB`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
            >
              Download merged.wav
            </button>
            <button
              onClick={reset}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised rounded-lg transition-colors duration-150"
            >
              Merge more
            </button>
          </div>
        </div>
      )}
    </>
  );
}
