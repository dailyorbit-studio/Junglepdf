"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import IconButton from "@/components/IconButton";
import {
  redactPDF,
  countBoxes,
  describeTradeoffs,
  DPI_OPTIONS,
  type RedactDpi,
  type RedactionBox,
  type RedactionMap,
  type RedactResult,
} from "@/lib/pdf-redact";
import { downloadBlob } from "@/lib/download";

/** Preview scale: big enough to aim at, small enough to render quickly. */
const PREVIEW_DPI = 96;

export default function RedactPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [boxes, setBoxes] = useState<RedactionMap>({});
  const [dpi, setDpi] = useState<RedactDpi>(200);

  const [drag, setDrag] = useState<RedactionBox | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<RedactResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Object URLs are revoked as the page changes; holding them would leak one
  // preview per page for the life of the tab.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const loadPreview = useCallback(async (source: File, pageNumber: number) => {
    setLoadingPreview(true);
    try {
      const { openForRender, renderPage, clampScale } = await import("@/lib/pdf-render");
      const session = await openForRender(await source.arrayBuffer(), source.name);
      try {
        setPageCount(session.doc.numPages);
        const proxy = await session.doc.getPage(pageNumber);
        const viewport = proxy.getViewport({ scale: 1 });
        proxy.cleanup();
        const scale = clampScale(viewport.width, viewport.height, PREVIEW_DPI / 72);
        const rendered = await renderPage(session.doc, pageNumber, scale, "image/jpeg", 0.85);
        setPreview((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(rendered.blob);
        });
      } finally {
        await session.destroy();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "This page could not be displayed.");
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const chosen = files[0];
      setResult(null);
      setError(null);
      setBoxes({});
      setPage(1);
      setFile(chosen);
      await loadPreview(chosen, 1);
    },
    [loadPreview]
  );

  const goToPage = useCallback(
    async (next: number) => {
      if (!file || next < 1 || next > pageCount) return;
      setPage(next);
      await loadPreview(file, next);
    },
    [file, pageCount, loadPreview]
  );

  /** Pointer position as a 0–1 fraction of the preview. */
  const fraction = (event: React.PointerEvent) => {
    const rect = surfaceRef.current!.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (processing) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = fraction(event);
    startRef.current = point;
    setDrag({ x: point.x, y: point.y, width: 0, height: 0 });
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!startRef.current) return;
    const point = fraction(event);
    const start = startRef.current;
    setDrag({
      x: Math.min(start.x, point.x),
      y: Math.min(start.y, point.y),
      width: Math.abs(point.x - start.x),
      height: Math.abs(point.y - start.y),
    });
  };

  const onPointerUp = () => {
    const box = drag;
    startRef.current = null;
    setDrag(null);
    // A click without a drag is not a box; ignore anything too small to be
    // deliberate rather than dropping a speck on the page.
    if (!box || box.width < 0.005 || box.height < 0.004) return;
    setBoxes((prev) => ({ ...prev, [page]: [...(prev[page] ?? []), box] }));
  };

  const removeBox = (index: number) => {
    setBoxes((prev) => ({
      ...prev,
      [page]: (prev[page] ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleRedact = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await redactPDF(file, { dpi, boxes }, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while redacting.");
    } finally {
      setProcessing(false);
    }
  }, [file, dpi, boxes]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setBoxes({});
    setResult(null);
    setError(null);
    setProgress(0);
    setPage(1);
  };

  const pageBoxes = boxes[page] ?? [];
  const total = countBoxes(boxes);

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
        <div className="space-y-5">
          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {total} box{total === 1 ? "" : "es"} across the document
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <IconButton
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loadingPreview || processing}
              label="Previous page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15,18 9,12 15,6" /></svg>
            </IconButton>
            <span className="text-xs text-ink-secondary">
              Page {page}{pageCount > 0 ? ` of ${pageCount}` : ""}
              {pageBoxes.length > 0 && ` · ${pageBoxes.length} box${pageBoxes.length === 1 ? "" : "es"}`}
            </span>
            <IconButton
              onClick={() => goToPage(page + 1)}
              disabled={page >= pageCount || loadingPreview || processing}
              label="Next page"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9,18 15,12 9,6" /></svg>
            </IconButton>
          </div>

          <div className="rounded-lg border border-border bg-surface-raised overflow-hidden">
            {loadingPreview && !preview && (
              <p className="p-8 text-center text-xs text-ink-muted">Rendering page…</p>
            )}
            {preview && (
              <div
                ref={surfaceRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="relative select-none touch-none cursor-crosshair"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt={`Page ${page}`} className="block w-full h-auto" draggable={false} />

                {pageBoxes.map((box, i) => (
                  <button
                    key={i}
                    onClick={() => removeBox(i)}
                    title="Click to remove this box"
                    className="absolute bg-black border border-white/40 hover:border-red-400"
                    style={{
                      left: `${box.x * 100}%`,
                      top: `${box.y * 100}%`,
                      width: `${box.width * 100}%`,
                      height: `${box.height * 100}%`,
                    }}
                  />
                ))}

                {drag && (
                  <div
                    className="absolute bg-black/70 border border-white/60 pointer-events-none"
                    style={{
                      left: `${drag.x * 100}%`,
                      top: `${drag.y * 100}%`,
                      width: `${drag.width * 100}%`,
                      height: `${drag.height * 100}%`,
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-ink-muted">
            Drag across anything that should be removed. Click a box to delete it.
          </p>

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Output resolution</span>
            <div className="grid grid-cols-3 gap-2">
              {DPI_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setDpi(option)}
                  className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                    dpi === option
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border text-ink hover:bg-surface-raised"
                  }`}
                >
                  {option} DPI
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-xs font-medium text-ink-secondary mb-1.5">
              Real redaction, and what it costs
            </p>
            <ul className="text-xs text-ink-muted space-y-1 list-disc pl-4">
              {describeTradeoffs().map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleRedact}
              disabled={processing || total === 0}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Redacting…" : `Redact ${total} area${total === 1 ? "" : "s"}`}
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
            title="PDF redacted"
            detail={`${result.boxCount} area${result.boxCount === 1 ? "" : "s"} removed across ${
              result.pageCount
            } page${result.pageCount === 1 ? "" : "s"}`}
          />

          {result.notice && <NoticeMessage>{result.notice}</NoticeMessage>}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 min-w-[10rem] btn btn-primary"
            >
              Download PDF
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Redact another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
