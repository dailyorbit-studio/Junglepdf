"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import IconButton from "@/components/IconButton";
import NoticeMessage from "@/components/NoticeMessage";
import { mergePDFs } from "@/lib/pdf-merger";
import { downloadBlob } from "@/lib/download";

const MAX_FILES = 20;

export default function MergePdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    blob: Blob;
    totalPages: number;
    fileCount: number;
    warning: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleFiles = useCallback((incoming: File[]) => {
    setResult(null);
    setError(null);
    setNotice(null);

    setFiles((prev) => {
      const room = MAX_FILES - prev.length;
      // Silently slicing here is how files used to vanish without explanation.
      if (incoming.length > room) {
        setNotice(
          `Only the first ${room} of ${incoming.length} file${incoming.length === 1 ? "" : "s"} ` +
            `were added — the merge limit is ${MAX_FILES}.`
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
    setFiles((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  };

  const handleMerge = useCallback(async () => {
    if (files.length < 2) {
      setError("Add at least two PDF files to merge.");
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const output = await mergePDFs(files, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult({
        blob: output.blob,
        totalPages: output.totalPages,
        fileCount: output.fileCount,
        warning: output.warning,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during merging.");
    } finally {
      setProcessing(false);
    }
  }, [files]);

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
                    <p className="text-xs text-ink-muted">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
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
              accept=".pdf"
              multiple
              maxFileSizeMB={100}
              maxFiles={MAX_FILES}
              onFiles={handleFiles}
              label={files.length === 0 ? "Drop PDF files here, or click to browse" : "Add more PDFs"}
              sublabel={`Up to 100MB per file · ${MAX_FILES - files.length} slots remaining`}
            />
          )}

          {notice && <NoticeMessage>{notice}</NoticeMessage>}
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
            title="PDFs merged"
            detail={`${result.totalPages} pages from ${result.fileCount} files`}
          />
          {result.warning && <NoticeMessage>{result.warning}</NoticeMessage>}
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, "merged.pdf")}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
            >
              Download merged PDF
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
