"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  readArchive,
  extractEntry,
  extractAll,
  formatBytes,
  type ArchiveListing,
} from "@/lib/unzip";
import { downloadBlob } from "@/lib/download";

/**
 * Listing first, extraction second.
 *
 * Everything runs in the tab's memory, so unpacking a whole archive to show
 * what is in it would be the wrong order — a 2GB ZIP can be browsed here and
 * a single file pulled out of it without inflating the rest.
 */
export default function UnzipTool() {
  const [file, setFile] = useState<File | null>(null);
  const [listing, setListing] = useState<ArchiveListing | null>(null);

  const [reading, setReading] = useState(false);
  const [busyPath, setBusyPath] = useState<string | null>(null);
  const [bundling, setBundling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const next = files[0];
    setFile(next);
    setError(null);
    setListing(null);
    setReading(true);

    try {
      setListing(await readArchive(next));
    } catch (err) {
      setFile(null);
      setError(err instanceof Error ? err.message : "This archive could not be read.");
    } finally {
      setReading(false);
    }
  }, []);

  const handleOne = useCallback(
    async (path: string) => {
      if (!file) return;
      setBusyPath(path);
      setError(null);
      try {
        const { blob, filename } = await extractEntry(file, path);
        downloadBlob(blob, filename);
      } catch (err) {
        setError(err instanceof Error ? err.message : "That file could not be extracted.");
      } finally {
        setBusyPath(null);
      }
    },
    [file]
  );

  const handleAll = useCallback(async () => {
    if (!file) return;
    setBundling(true);
    setError(null);
    try {
      const { blob, filename } = await extractAll(file, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      downloadBlob(blob, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The archive could not be extracted.");
    } finally {
      setBundling(false);
    }
  }, [file]);

  const reset = () => {
    setFile(null);
    setListing(null);
    setError(null);
    setProgress(0);
  };

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".zip"
          maxFileSizeMB={500}
          onFiles={handleFiles}
          label="Drop a ZIP file here, or click to browse"
          sublabel="Up to 500MB — RAR and 7z are different formats and won't open"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {reading && <p className="mt-4 text-sm text-ink-muted">Reading the archive…</p>}

      {file && listing && (
        <div className="space-y-5">
          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {listing.fileCount} file{listing.fileCount === 1 ? "" : "s"} ·{" "}
              {formatBytes(listing.totalSize)} unpacked
            </p>
          </div>

          {listing.notice && <NoticeMessage>{listing.notice}</NoticeMessage>}

          <div className="border border-border rounded-lg divide-y divide-border-subtle max-h-96 overflow-y-auto">
            {listing.entries
              .filter((entry) => !entry.isDirectory)
              .map((entry) => (
                <div
                  key={entry.path}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate" title={entry.path}>
                      {entry.path}
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {formatBytes(entry.size)}
                      {entry.date && ` · ${entry.date.toLocaleDateString()}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOne(entry.path)}
                    disabled={busyPath !== null || bundling}
                    className="shrink-0 px-2.5 py-1.5 text-xs rounded-md border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-40 transition-colors"
                  >
                    {busyPath === entry.path ? "…" : "Save"}
                  </button>
                </div>
              ))}
          </div>

          {bundling && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <p className="text-xs text-ink-muted leading-relaxed">
            &ldquo;Extract all&rdquo; rebuilds the contents into one uncompressed ZIP
            rather than firing a download per file — browsers block a burst of
            downloads after the first few, so a large archive would silently deliver
            only some of them.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleAll}
              disabled={bundling || busyPath !== null}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium rounded-lg transition-colors duration-150"
            >
              {bundling ? "Extracting…" : "Extract all"}
            </button>
            <button
              onClick={reset}
              disabled={bundling}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-40 rounded-lg transition-colors duration-150"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
