"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import SignaturePad, { padToPng } from "./SignaturePad";
import { signPDF, renderTypedSignature, type SignResult } from "@/lib/pdf-sign";
import { openForRender, renderPage } from "@/lib/pdf-render";
import { downloadBlob } from "@/lib/download";

type Mode = "draw" | "type";

const INK_COLORS = [
  { value: "#1C1917", label: "Black" },
  { value: "#1D4ED8", label: "Blue" },
];

/** Faces likely to be present without shipping a webfont for a one-off render. */
const SCRIPT_FONTS = [
  { value: "'Brush Script MT', 'Segoe Script', cursive", label: "Script" },
  { value: "'Georgia', 'Times New Roman', serif", label: "Serif" },
  { value: "'Inter', system-ui, sans-serif", label: "Sans" },
];

export default function SignPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("draw");
  const [hasInk, setHasInk] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [font, setFont] = useState(SCRIPT_FONTS[0].value);
  const [color, setColor] = useState(INK_COLORS[0].value);

  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Placement, as fractions of the page.
  const [placement, setPlacement] = useState({ x: 0.6, y: 0.8, width: 0.25 });
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<SignResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const padWrapRef = useRef<HTMLDivElement>(null);
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Revoke object URLs on unmount. Refs rather than state so teardown sees the
  // URL that is actually live.
  const urlsRef = useRef<{ page: string | null; sig: string | null }>({ page: null, sig: null });
  useEffect(() => {
    urlsRef.current.page = previewUrl;
  }, [previewUrl]);
  useEffect(() => {
    urlsRef.current.sig = signaturePreview;
  }, [signaturePreview]);
  useEffect(
    () => () => {
      if (urlsRef.current.page) URL.revokeObjectURL(urlsRef.current.page);
      if (urlsRef.current.sig) URL.revokeObjectURL(urlsRef.current.sig);
    },
    []
  );

  const loadPreview = useCallback(async (target: File, page: number) => {
    setPreviewLoading(true);
    try {
      const session = await openForRender(await target.arrayBuffer(), target.name);
      try {
        setPageCount(session.doc.numPages);
        const rendered = await renderPage(session.doc, page, 1.3, "image/jpeg", 0.82);
        setPreviewUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(rendered.blob);
        });
      } finally {
        await session.destroy();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The page preview could not be rendered.");
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const handleFiles = useCallback(
    (files: File[]) => {
      const picked = files[0];
      setFile(picked);
      setResult(null);
      setError(null);
      setPageNumber(1);
      void loadPreview(picked, 1);
    },
    [loadPreview]
  );

  const changePage = (next: number) => {
    if (!file || next < 1 || next > pageCount) return;
    setPageNumber(next);
    void loadPreview(file, next);
  };

  /** Build the signature PNG from whichever mode is active. */
  const buildSignature = useCallback(async (): Promise<Blob> => {
    if (mode === "type") {
      return renderTypedSignature(typedName, font, color);
    }
    const canvas = padWrapRef.current?.querySelector("canvas");
    if (!canvas) throw new Error("Draw a signature first.");
    return padToPng(canvas);
  }, [mode, typedName, font, color]);

  /** Refresh the little preview shown inside the placement box. */
  const refreshSignaturePreview = useCallback(async () => {
    try {
      const blob = await buildSignature();
      setSignaturePreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(blob);
      });
      setError(null);
    } catch {
      setSignaturePreview((old) => {
        if (old) URL.revokeObjectURL(old);
        return null;
      });
    }
  }, [buildSignature]);

  const onPlacePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!signaturePreview) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    movePlacement(e);
  };

  const movePlacement = (e: React.PointerEvent<HTMLDivElement>) => {
    const box = previewBoxRef.current;
    if (!box) return;

    const rect = box.getBoundingClientRect();
    // Centre the mark on the pointer, then clamp so it cannot be dragged off
    // the page — a signature placed at x=1 would be entirely past the edge.
    const x = (e.clientX - rect.left) / rect.width - placement.width / 2;
    const y = (e.clientY - rect.top) / rect.height;

    setPlacement((p) => ({
      ...p,
      x: Math.max(0, Math.min(1 - p.width, x)),
      y: Math.max(0, Math.min(0.98, y)),
    }));
  };

  const handleSign = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const signature = await buildSignature();
      const output = await signPDF(
        file,
        signature,
        { pageNumber, x: placement.x, y: placement.y, width: placement.width },
        (step, pct) => {
          setProgressLabel(step);
          setProgress(pct);
        }
      );
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while signing.");
    } finally {
      setProcessing(false);
    }
  }, [file, buildSignature, pageNumber, placement]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setTypedName("");
    setHasInk(false);
    setPlacement({ x: 0.6, y: 0.8, width: 0.25 });
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setSignaturePreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
  };

  const signatureReady = mode === "draw" ? hasInk : typedName.trim().length > 0;

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
              {pageCount > 0 && ` · ${pageCount} page${pageCount === 1 ? "" : "s"}`}
            </p>
          </div>

          {/* Step 1 — build the signature */}
          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-2">
              1. Create your signature
            </span>

            <div className="flex gap-2 mb-3">
              {(["draw", "type"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 text-xs rounded-md border capitalize transition-colors ${
                    mode === m ? "border-accent bg-accent-subtle text-accent" : "border-border text-ink-muted"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div ref={padWrapRef} className={mode === "draw" ? "" : "hidden"}>
              <SignaturePad color={color} onChange={setHasInk} />
            </div>

            {mode === "type" && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="typed-name" className="sr-only">Your name</label>
                  <input
                    id="typed-name"
                    type="text"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="Type your name"
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {SCRIPT_FONTS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFont(f.value)}
                      style={{ fontFamily: f.value }}
                      className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                        font === f.value ? "border-accent bg-accent-subtle text-accent" : "border-border text-ink-secondary"
                      }`}
                    >
                      {typedName.trim() || f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs text-ink-secondary">Ink</span>
              {INK_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  aria-label={c.label}
                  style={{ backgroundColor: c.value }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    color === c.value ? "border-accent scale-110" : "border-border"
                  }`}
                />
              ))}

              <button
                type="button"
                onClick={refreshSignaturePreview}
                disabled={!signatureReady}
                className="ml-auto px-3 py-1.5 text-xs font-medium rounded-md border border-accent text-accent hover:bg-accent-subtle disabled:opacity-40 disabled:border-border disabled:text-ink-muted transition-colors"
              >
                {signaturePreview ? "Update signature" : "Use this signature"}
              </button>
            </div>
          </div>

          {/* Step 2 — place it */}
          <div>
            <div className="flex items-center justify-between mb-2 gap-3">
              <span className="text-xs font-medium text-ink-secondary">
                2. Click the page to place it
              </span>
              {pageCount > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changePage(pageNumber - 1)}
                    disabled={pageNumber <= 1 || previewLoading}
                    className="px-2 py-1 text-xs rounded border border-border text-ink-secondary disabled:opacity-40"
                  >
                    ←
                  </button>
                  <span className="text-xs text-ink-muted tabular-nums">
                    {pageNumber} / {pageCount}
                  </span>
                  <button
                    onClick={() => changePage(pageNumber + 1)}
                    disabled={pageNumber >= pageCount || previewLoading}
                    className="px-2 py-1 text-xs rounded border border-border text-ink-secondary disabled:opacity-40"
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            <div className="bg-surface-raised border border-border rounded-lg p-4 flex justify-center">
              {previewLoading && <p className="text-xs text-ink-muted py-20">Rendering page…</p>}

              {!previewLoading && previewUrl && (
                <div
                  ref={previewBoxRef}
                  onPointerDown={onPlacePointerDown}
                  onPointerMove={(e) => dragging.current && movePlacement(e)}
                  onPointerUp={() => (dragging.current = false)}
                  onPointerCancel={() => (dragging.current = false)}
                  className={`relative touch-none ${signaturePreview ? "cursor-crosshair" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt={`Page ${pageNumber}`} className="block max-w-full h-auto shadow-[var(--shadow-card)]" />

                  {signaturePreview && (
                    <div
                      className="absolute border border-dashed border-accent bg-accent/5"
                      style={{
                        left: `${placement.x * 100}%`,
                        top: `${placement.y * 100}%`,
                        width: `${placement.width * 100}%`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={signaturePreview} alt="Your signature" className="block w-full h-auto" />
                    </div>
                  )}
                </div>
              )}

              {/*
                The page preview can fail — pdf.js cannot rasterise every file,
                and it makes no progress at all while the tab is in the
                background. Signing does not need it (that runs through
                pdf-lib), so the fallback keeps the tool usable and shows the
                mark and its position numerically instead of leaving an empty
                box above an enabled Sign button.
              */}
              {!previewLoading && !previewUrl && (
                <div className="py-10 px-4 text-center">
                  <p className="text-xs text-ink-secondary">
                    The page preview could not be rendered, so there is nothing to click.
                  </p>
                  {/*
                    Deliberately not "signing still works": the two libraries
                    disagree about some files, but a genuinely corrupt PDF fails
                    in both, and promising success directly above an error
                    saying the file is unreadable would be worse than saying
                    nothing.
                  */}
                  <p className="text-xs text-ink-muted mt-1">
                    You can still try — the signature would go{" "}
                    {Math.round(placement.x * 100)}% across and{" "}
                    {Math.round(placement.y * 100)}% down page {pageNumber}.
                  </p>
                  {signaturePreview && (
                    <span className="inline-block mt-4 p-2 bg-surface border border-border rounded">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={signaturePreview} alt="Your signature" className="block max-h-16 w-auto" />
                    </span>
                  )}
                </div>
              )}
            </div>

            {!signaturePreview && (
              <p className="text-xs text-ink-muted mt-2">
                Create a signature above and choose &ldquo;Use this signature&rdquo; to place it.
              </p>
            )}

            {signaturePreview && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="sig-size" className="text-xs font-medium text-ink-secondary">
                    Signature size
                  </label>
                  <span className="text-xs text-ink tabular-nums">
                    {Math.round(placement.width * 100)}% of page width
                  </span>
                </div>
                <input
                  id="sig-size"
                  type="range"
                  min={5}
                  max={60}
                  value={placement.width * 100}
                  onChange={(e) => {
                    const width = Number(e.target.value) / 100;
                    setPlacement((p) => ({ ...p, width, x: Math.min(p.x, 1 - width) }));
                  }}
                  className="w-full accent-[var(--color-accent)]"
                />
              </div>
            )}
          </div>

          <NoticeMessage>
            This stamps a picture of your signature onto the page. It is not a
            cryptographic signature — it carries no certificate and does not prove who
            applied it or whether the document changed afterwards.
          </NoticeMessage>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleSign}
              disabled={processing || !signaturePreview}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Signing…" : "Sign PDF"}
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
            title="PDF signed"
            detail={`Signature placed on page ${result.pageNumber} of ${result.totalPages}`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download signed PDF
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Sign another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
