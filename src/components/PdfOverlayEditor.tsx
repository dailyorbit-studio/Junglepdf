"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import FileDropZone from "./FileDropZone";
import ProgressBar from "./ProgressBar";
import ResultBanner from "./ResultBanner";
import ErrorMessage from "./ErrorMessage";
import NoticeMessage from "./NoticeMessage";
import IconButton from "./IconButton";
import {
  applyOverlays,
  type Overlay,
  type OverlayResult,
  type Point,
} from "@/lib/pdf-overlay";
import { downloadBlob } from "@/lib/download";

/**
 * The shared page-preview editor behind PDF Annotator and Edit PDF.
 *
 * Both tools are the same interaction — render a page, place things on it,
 * write them back — differing only in which instruments they offer and what
 * the copy calls them. `PdfPageSelectTool` set the precedent for two routes
 * over one component; this follows it rather than growing a second 400-line
 * near-copy that drifts.
 */

export type Instrument = "highlight" | "text" | "pen" | "box" | "whiteout";

export const INSTRUMENT_LABELS: Record<Instrument, string> = {
  highlight: "Highlight",
  text: "Text",
  pen: "Pen",
  box: "Box",
  whiteout: "White out",
};

const PREVIEW_DPI = 96;

const PALETTE = ["#ffe066", "#ff6b6b", "#4dabf7", "#51cf66", "#212529", "#ffffff"];

interface PdfOverlayEditorProps {
  /** Which instruments this route exposes, in order. */
  instruments: Instrument[];
  /** Default instrument — the one selected on load. */
  initial: Instrument;
  actionLabel: string;
  /** Shown under the canvas; each tool explains its own gesture. */
  hint: string;
  /** The caveat block above the action button. */
  caveatTitle: string;
  caveats: string[];
}

export default function PdfOverlayEditor({
  instruments,
  initial,
  actionLabel,
  hint,
  caveatTitle,
  caveats,
}: PdfOverlayEditorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [instrument, setInstrument] = useState<Instrument>(initial);
  const [color, setColor] = useState(PALETTE[0]);
  const [fontSize, setFontSize] = useState(14);
  const [overlays, setOverlays] = useState<Overlay[]>([]);

  const [drag, setDrag] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [stroke, setStroke] = useState<Point[] | null>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<Point | null>(null);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<OverlayResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setOverlays([]);
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

  const fraction = (event: React.PointerEvent): Point => {
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

    if (instrument === "text") {
      const text = window.prompt("Text to place here:");
      if (text && text.trim()) {
        setOverlays((prev) => [
          ...prev,
          { kind: "text", page, x: point.x, y: point.y, text, size: fontSize, color },
        ]);
      }
      return;
    }

    if (instrument === "pen") {
      setStroke([point]);
      return;
    }

    startRef.current = point;
    setDrag({ x: point.x, y: point.y, width: 0, height: 0 });
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (stroke) {
      setStroke((prev) => [...(prev ?? []), fraction(event)]);
      return;
    }
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
    if (stroke) {
      // Two points is a tap, not a stroke.
      if (stroke.length > 2) {
        setOverlays((prev) => [...prev, { kind: "ink", page, points: stroke, thickness: 2, color }]);
      }
      setStroke(null);
      return;
    }

    const box = drag;
    startRef.current = null;
    setDrag(null);
    if (!box || box.width < 0.005 || box.height < 0.004) return;

    if (instrument === "highlight") {
      setOverlays((prev) => [...prev, { kind: "highlight", page, ...box, color }]);
    } else if (instrument === "whiteout") {
      setOverlays((prev) => [...prev, { kind: "box", page, ...box, color: "#ffffff", opacity: 1 }]);
    } else {
      setOverlays((prev) => [...prev, { kind: "box", page, ...box, color, opacity: 1 }]);
    }
  };

  const undo = () => setOverlays((prev) => prev.slice(0, -1));

  const handleApply = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await applyOverlays(file, overlays, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while saving.");
    } finally {
      setProcessing(false);
    }
  }, [file, overlays]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setOverlays([]);
    setResult(null);
    setError(null);
    setProgress(0);
    setPage(1);
  };

  const onThisPage = overlays.filter((o) => o.page === page);

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
              {overlays.length} item{overlays.length === 1 ? "" : "s"} placed
            </p>
          </div>

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Tool</span>
            <div className="flex flex-wrap gap-2">
              {instruments.map((option) => (
                <button
                  key={option}
                  onClick={() => setInstrument(option)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    instrument === option
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border text-ink hover:bg-surface-raised"
                  }`}
                >
                  {INSTRUMENT_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          {instrument !== "whiteout" && (
            <div>
              <span className="block text-xs font-medium text-ink-secondary mb-1.5">Colour</span>
              <div className="flex flex-wrap gap-2">
                {PALETTE.map((swatch) => (
                  <button
                    key={swatch}
                    onClick={() => setColor(swatch)}
                    aria-label={`Use colour ${swatch}`}
                    className={`h-9 w-9 rounded-lg border-2 transition-colors ${
                      color === swatch ? "border-accent" : "border-border"
                    }`}
                    style={{ backgroundColor: swatch }}
                  />
                ))}
              </div>
            </div>
          )}

          {instrument === "text" && (
            <div>
              <label htmlFor="overlay-size" className="block text-xs font-medium text-ink-secondary mb-1.5">
                Text size: {fontSize}pt
              </label>
              <input
                id="overlay-size"
                type="range"
                min={8}
                max={36}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          )}

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
              {onThisPage.length > 0 && ` · ${onThisPage.length} here`}
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

                {onThisPage.map((item, i) => {
                  if (item.kind === "text") {
                    return (
                      <span
                        key={i}
                        className="absolute pointer-events-none whitespace-pre"
                        style={{
                          left: `${item.x * 100}%`,
                          top: `${item.y * 100}%`,
                          color: item.color,
                          fontSize: `${item.size}px`,
                          lineHeight: 1.1,
                        }}
                      >
                        {item.text}
                      </span>
                    );
                  }
                  if (item.kind === "ink") {
                    const d = item.points
                      .map((p, n) => `${n === 0 ? "M" : "L"} ${p.x * 100} ${p.y * 100}`)
                      .join(" ");
                    return (
                      <svg
                        key={i}
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      >
                        <path d={d} fill="none" stroke={item.color} strokeWidth={0.4} vectorEffect="non-scaling-stroke" />
                      </svg>
                    );
                  }
                  return (
                    <div
                      key={i}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${item.x * 100}%`,
                        top: `${item.y * 100}%`,
                        width: `${item.width * 100}%`,
                        height: `${item.height * 100}%`,
                        backgroundColor: item.color,
                        opacity: item.kind === "highlight" ? 0.35 : 1,
                      }}
                    />
                  );
                })}

                {drag && (
                  <div
                    className="absolute border border-accent pointer-events-none"
                    style={{
                      left: `${drag.x * 100}%`,
                      top: `${drag.y * 100}%`,
                      width: `${drag.width * 100}%`,
                      height: `${drag.height * 100}%`,
                      backgroundColor: color,
                      opacity: instrument === "highlight" ? 0.35 : 0.8,
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-ink-muted">{hint}</p>
            <button
              onClick={undo}
              disabled={overlays.length === 0 || processing}
              className="shrink-0 px-3 py-1.5 text-xs font-medium border border-border rounded-lg text-ink-secondary hover:bg-surface-raised disabled:opacity-40 transition-colors"
            >
              Undo
            </button>
          </div>

          <div className="p-3 bg-surface-raised rounded-lg">
            <p className="text-xs font-medium text-ink-secondary mb-1.5">{caveatTitle}</p>
            <ul className="text-xs text-ink-muted space-y-1 list-disc pl-4">
              {caveats.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleApply}
              disabled={processing || overlays.length === 0}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Saving…" : actionLabel}
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
            title="PDF saved"
            detail={`${result.itemCount} item${result.itemCount === 1 ? "" : "s"} added across ${
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
              Edit another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
