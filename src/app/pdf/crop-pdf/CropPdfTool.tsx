"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import { cropPDF, MAX_MARGIN, type CropMargins, type CropResult } from "@/lib/pdf-crop";
import { openForRender, renderPage } from "@/lib/pdf-render";
import { downloadBlob } from "@/lib/download";

const ZERO: CropMargins = { top: 0, right: 0, bottom: 0, left: 0 };

const EDGES: { key: keyof CropMargins; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "right", label: "Right" },
  { key: "bottom", label: "Bottom" },
  { key: "left", label: "Left" },
];

export default function CropPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [margins, setMargins] = useState<CropMargins>(ZERO);
  const [linked, setLinked] = useState(true);
  const [allPages, setAllPages] = useState(true);
  const [pageSelection, setPageSelection] = useState("");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<CropResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Held in a ref so the cleanup below revokes the URL that is actually on
  // screen rather than whatever state happened to be current at teardown.
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    []
  );

  const handleFiles = useCallback(async (files: File[]) => {
    const picked = files[0];
    setFile(picked);
    setResult(null);
    setError(null);
    setMargins(ZERO);
    setPreviewLoading(true);

    // Render page 1 once, as a backdrop for the crop overlay. The overlay
    // itself is CSS, so dragging a slider does not re-render the page.
    try {
      const session = await openForRender(await picked.arrayBuffer(), picked.name);
      try {
        const page = await renderPage(session.doc, 1, 1.2, "image/jpeg", 0.8);
        setPreviewUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(page.blob);
        });
      } finally {
        await session.destroy();
      }
    } catch (err) {
      // A preview failure is not a reason to block cropping — the operation
      // itself does not need pdf.js at all.
      setError(err instanceof Error ? err.message : "The preview could not be rendered.");
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const setEdge = (key: keyof CropMargins, value: number) => {
    setMargins((prev) => (linked ? { top: value, right: value, bottom: value, left: value } : { ...prev, [key]: value }));
  };

  const handleCrop = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await cropPDF(
        file,
        margins,
        allPages ? null : pageSelection,
        (step, pct) => {
          setProgressLabel(step);
          setProgress(pct);
        }
      );
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while cropping.");
    } finally {
      setProcessing(false);
    }
  }, [file, margins, allPages, pageSelection]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setMargins(ZERO);
    setAllPages(true);
    setPageSelection("");
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
  };

  const nothingSet = margins.top + margins.right + margins.bottom + margins.left === 0;

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".pdf"
          maxFileSizeMB={100}
          onFiles={handleFiles}
          label="Drop a PDF here, or click to browse"
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview */}
            <div>
              <span className="block text-xs font-medium text-ink-secondary mb-1.5">
                Preview — page 1
              </span>
              <div className="relative bg-surface-raised border border-border rounded-lg overflow-hidden flex items-center justify-center min-h-[16rem]">
                {previewLoading && <p className="text-xs text-ink-muted py-16">Rendering preview…</p>}

                {!previewLoading && previewUrl && (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="First page of the PDF" className="block max-w-full h-auto" />

                    {/* Dimmed overlay showing what gets trimmed away. */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute bg-ink/45" style={{ top: 0, left: 0, right: 0, height: `${margins.top * 100}%` }} />
                      <div className="absolute bg-ink/45" style={{ bottom: 0, left: 0, right: 0, height: `${margins.bottom * 100}%` }} />
                      <div className="absolute bg-ink/45" style={{ left: 0, width: `${margins.left * 100}%`, top: `${margins.top * 100}%`, bottom: `${margins.bottom * 100}%` }} />
                      <div className="absolute bg-ink/45" style={{ right: 0, width: `${margins.right * 100}%`, top: `${margins.top * 100}%`, bottom: `${margins.bottom * 100}%` }} />
                      <div
                        className="absolute border-2 border-accent"
                        style={{
                          top: `${margins.top * 100}%`,
                          bottom: `${margins.bottom * 100}%`,
                          left: `${margins.left * 100}%`,
                          right: `${margins.right * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {!previewLoading && !previewUrl && (
                  <p className="text-xs text-ink-muted py-16 px-4 text-center">
                    No preview available — cropping still works.
                  </p>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={linked}
                  onChange={(e) => {
                    setLinked(e.target.checked);
                    if (e.target.checked) setMargins({ top: margins.top, right: margins.top, bottom: margins.top, left: margins.top });
                  }}
                  className="w-4 h-4 accent-[var(--color-accent)]"
                />
                <span className="text-sm text-ink-secondary">Trim all four edges equally</span>
              </label>

              {(linked ? EDGES.slice(0, 1) : EDGES).map(({ key, label }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor={`margin-${key}`} className="text-xs font-medium text-ink-secondary">
                      {linked ? "All edges" : label}
                    </label>
                    <span className="text-xs text-ink tabular-nums">
                      {Math.round(margins[key] * 100)}%
                    </span>
                  </div>
                  <input
                    id={`margin-${key}`}
                    type="range"
                    min={0}
                    max={MAX_MARGIN * 100}
                    step={0.5}
                    value={margins[key] * 100}
                    onChange={(e) => setEdge(key, Number(e.target.value) / 100)}
                    className="w-full accent-[var(--color-accent)]"
                  />
                </div>
              ))}

              <div className="space-y-2">
                <span className="block text-xs font-medium text-ink-secondary">Apply to</span>
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
                    <label htmlFor="crop-pages" className="sr-only">Pages to crop</label>
                    <input
                      id="crop-pages"
                      type="text"
                      value={pageSelection}
                      onChange={(e) => setPageSelection(e.target.value)}
                      placeholder="e.g. 1-3, 5, 8-10"
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-ink-muted">
            Cropping sets the page&apos;s visible area. The trimmed-away content is still
            in the file and can be revealed again — this is a layout change, not redaction.
          </p>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleCrop}
              disabled={processing || nothingSet || (!allPages && !pageSelection.trim())}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-150"
            >
              {processing ? "Cropping…" : "Crop PDF"}
            </button>
            <button
              onClick={reset}
              disabled={processing}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-40 rounded-lg transition-colors duration-150"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <ResultBanner
            title="PDF cropped"
            detail={`${result.pagesCropped} of ${result.totalPages} page${
              result.totalPages === 1 ? "" : "s"
            } · now ${result.newWidth} × ${result.newHeight} pt`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors duration-150"
            >
              Download cropped PDF
            </button>
            <button
              onClick={reset}
              className="py-3 px-4 border border-border text-ink-secondary hover:bg-surface-raised rounded-lg transition-colors duration-150"
            >
              Crop another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
