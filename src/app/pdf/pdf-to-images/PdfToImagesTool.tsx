"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  pdfToImages,
  DPI_PRESETS,
  type ImageFormat,
  type PdfToImagesResult,
} from "@/lib/pdf-to-images";
import { downloadBlob } from "@/lib/download";

export default function PdfToImagesTool() {
  const [file, setFile] = useState<File | null>(null);

  const [format, setFormat] = useState<ImageFormat>("image/png");
  const [dpi, setDpi] = useState<number>(150);
  const [quality, setQuality] = useState(0.92);
  const [allPages, setAllPages] = useState(true);
  const [pageSelection, setPageSelection] = useState("");

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<PdfToImagesResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setError(null);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      // The range is parsed inside the engine, against the real page count —
      // it is the only place that knows it without opening the file twice.
      const output = await pdfToImages(
        file,
        { format, dpi, quality, pageSelection: allPages ? null : pageSelection },
        (step, pct) => {
          setProgressLabel(step);
          setProgress(pct);
        }
      );
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong during conversion.");
    } finally {
      setProcessing(false);
    }
  }, [file, format, dpi, quality, allPages, pageSelection]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setAllPages(true);
    setPageSelection("");
  };

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".pdf"
          maxFileSizeMB={100}
          onFiles={handleFiles}
          label="Choose a PDF"
          sublabel="Up to 100MB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-6">
          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {(file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-medium text-ink-secondary mb-1.5">Format</span>
              <div className="flex gap-2">
                {([["image/png", "PNG"], ["image/jpeg", "JPG"]] as [ImageFormat, string][]).map(
                  ([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setFormat(value)}
                      className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                        format === value
                          ? "border-accent bg-accent-subtle text-accent"
                          : "border-border text-ink-muted hover:text-ink"
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-ink-secondary mb-1.5">
                Resolution
              </span>
              <div className="flex gap-2">
                {DPI_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setDpi(preset)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                      dpi === preset
                        ? "border-accent bg-accent-subtle text-accent"
                        : "border-border text-ink-muted hover:text-ink"
                    }`}
                  >
                    {preset} DPI
                  </button>
                ))}
              </div>
            </div>
          </div>

          {format === "image/jpeg" && (
            <div>
              <label htmlFor="raster-quality" className="block text-xs font-medium text-ink-secondary mb-1">
                JPG quality ({Math.round(quality * 100)}%)
              </label>
              <input
                id="raster-quality"
                type="range"
                min={0.5}
                max={1}
                step={0.02}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-accent mt-1"
              />
            </div>
          )}

          <div className="space-y-2">
            <span className="block text-xs font-medium text-ink-secondary">Pages</span>
            <div className="flex gap-2">
              <button
                onClick={() => setAllPages(true)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  allPages ? "border-accent bg-accent-subtle text-accent" : "border-border text-ink-muted"
                }`}
              >
                Every page
              </button>
              <button
                onClick={() => setAllPages(false)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  !allPages ? "border-accent bg-accent-subtle text-accent" : "border-border text-ink-muted"
                }`}
              >
                Specific pages
              </button>
            </div>

            {!allPages && (
              <div>
                <label htmlFor="raster-pages" className="sr-only">
                  Pages to export
                </label>
                <input
                  id="raster-pages"
                  type="text"
                  value={pageSelection}
                  onChange={(e) => setPageSelection(e.target.value)}
                  placeholder="e.g. 1-3, 5, 8-10"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>
            )}
          </div>

          <p className="text-xs text-ink-muted">
            300 DPI is print quality and produces large files — a single A4 page lands around 8.7
            megapixels. 150 DPI is a good default for viewing on screen.
          </p>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleConvert}
              disabled={processing || (!allPages && !pageSelection.trim())}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Rendering…" : "Convert to images"}
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
            title="Pages exported"
            detail={`${result.images.length} image${result.images.length === 1 ? "" : "s"} · ${(result.zipBlob.size / (1024 * 1024)).toFixed(2)} MB zipped`}
          />

          {result.warning && <NoticeMessage>{result.warning}</NoticeMessage>}

          <ul className="space-y-2 max-h-72 overflow-y-auto">
            {result.images.map((image) => (
              <li
                key={image.pageNumber}
                className="flex items-center gap-3 p-3 bg-surface-raised rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">Page {image.pageNumber}</p>
                  <p className="text-xs text-ink-muted">
                    {image.width} × {image.height} px · {(image.blob.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  onClick={() =>
                    downloadBlob(
                      image.blob,
                      `page${image.pageNumber}.${format === "image/png" ? "png" : "jpg"}`
                    )
                  }
                  className="text-xs text-accent hover:text-accent-hover font-medium transition-colors flex-shrink-0"
                >
                  Download
                </button>
              </li>
            ))}
          </ul>

          <div className="flex gap-3">
            <button
              onClick={() =>
                downloadBlob(result.zipBlob, file!.name.replace(/\.pdf$/i, "") + "_images.zip")
              }
              className="flex-1 btn btn-primary"
            >
              Download all as ZIP
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
