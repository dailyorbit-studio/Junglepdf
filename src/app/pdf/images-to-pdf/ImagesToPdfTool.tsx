"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import IconButton from "@/components/IconButton";
import NoticeMessage from "@/components/NoticeMessage";
import {
  imagesToPDF,
  PAGE_SIZE_LABELS,
  type PageSizeName,
  type Orientation,
  type ImagesToPdfResult,
} from "@/lib/images-to-pdf";
import { downloadBlob } from "@/lib/download";

const MAX_FILES = 50;
const PAGE_SIZES: PageSizeName[] = ["fit", "a4", "letter", "legal"];

export default function ImagesToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeName>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState(36);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ImagesToPdfResult | null>(null);
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
          `Only the first ${room} of ${incoming.length} images were added — the limit is ${MAX_FILES} per PDF.`
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

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await imagesToPDF(
        files,
        { pageSize, orientation, margin },
        (step, pct) => {
          setProgressLabel(step);
          setProgress(pct);
        }
      );
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong building the PDF.");
    } finally {
      setProcessing(false);
    }
  }, [files, pageSize, orientation, margin]);

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
                      {(file.size / 1024).toFixed(0)} KB
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
              accept=".jpg,.jpeg,.png,.webp,.avif,.bmp"
              multiple
              maxFileSizeMB={50}
              maxFiles={MAX_FILES}
              onFiles={handleFiles}
              label={files.length === 0 ? "Choose images" : "Add more images"}
              sublabel={`JPEG, PNG, WebP, AVIF, BMP · ${MAX_FILES - files.length} slots remaining`}
            />
          )}

          {notice && <NoticeMessage>{notice}</NoticeMessage>}

          {files.length > 0 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="pdf-page-size" className="block text-xs font-medium text-ink-secondary mb-1">
                  Page size
                </label>
                <select
                  id="pdf-page-size"
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as PageSizeName)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {PAGE_SIZE_LABELS[size]}
                    </option>
                  ))}
                </select>
                {pageSize === "fit" && (
                  <p className="text-xs text-ink-muted mt-1">
                    Each page is made exactly the size of its image — no margins, no letterboxing.
                    Good for screenshots, awkward for printing.
                  </p>
                )}
              </div>

              {pageSize !== "fit" && (
                <>
                  <div>
                    <span className="block text-xs font-medium text-ink-secondary mb-1.5">
                      Orientation
                    </span>
                    <div className="flex gap-2">
                      {(["portrait", "landscape"] as Orientation[]).map((o) => (
                        <button
                          key={o}
                          onClick={() => setOrientation(o)}
                          className={`px-3 py-1.5 text-xs rounded-md border capitalize transition-colors ${
                            orientation === o
                              ? "border-accent bg-accent-subtle text-accent"
                              : "border-border text-ink-muted hover:text-ink"
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pdf-margin" className="block text-xs font-medium text-ink-secondary mb-1">
                      Margin ({margin}pt ≈ {(margin / 72).toFixed(2)}in)
                    </label>
                    <input
                      id="pdf-margin"
                      type="range"
                      min={0}
                      max={72}
                      step={4}
                      value={margin}
                      onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                      className="w-full accent-accent mt-1"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          {files.length > 0 && (
            <button
              onClick={handleConvert}
              disabled={processing}
              className="btn btn-primary btn-block"
            >
              {processing
                ? "Building PDF…"
                : `Create PDF from ${files.length} image${files.length === 1 ? "" : "s"}`}
            </button>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <ResultBanner
            title="PDF created"
            detail={`${result.pageCount} page${result.pageCount === 1 ? "" : "s"} · ${(result.blob.size / (1024 * 1024)).toFixed(2)} MB`}
          />
          {result.transcoded.length > 0 && (
            <NoticeMessage>
              PDF can only hold JPEG and PNG directly, so{" "}
              {result.transcoded.length === 1
                ? `"${result.transcoded[0]}" was`
                : `${result.transcoded.length} files were`}{" "}
              re-encoded to JPEG on the way in. Quality is high but not identical to the source.
            </NoticeMessage>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download {result.filename}
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </>
  );
}
