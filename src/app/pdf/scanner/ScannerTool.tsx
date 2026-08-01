"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import IconButton from "@/components/IconButton";
import {
  startCamera,
  stopCamera,
  captureFrame,
  scanToPDF,
  SCAN_MODE_LABELS,
  SCAN_MODE_NOTES,
  type ScanMode,
} from "@/lib/scanner";
import { PAGE_SIZE_LABELS, type PageSizeName, type ImagesToPdfResult } from "@/lib/images-to-pdf";
import { downloadBlob } from "@/lib/download";

interface Page {
  blob: Blob;
  url: string;
}

const MODES: ScanMode[] = ["document", "greyscale", "photo"];
const SIZES: PageSizeName[] = ["a4", "letter", "fit"];

export default function ScannerTool() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [mode, setMode] = useState<ScanMode>("document");
  const [pageSize, setPageSize] = useState<PageSizeName>("a4");

  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ImagesToPdfResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Release the camera when the component goes away — a live track keeps the
  // device's camera light on until the tab closes otherwise.
  useEffect(() => {
    return () => {
      stopCamera(stream);
      pages.forEach((p) => URL.revokeObjectURL(p.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  const begin = useCallback(async () => {
    setError(null);
    try {
      const media = await startCamera();
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The camera could not be started.");
    }
  }, []);

  // The <video> element only exists once a stream does, so wiring it up has to
  // happen after the render that creates it.
  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  const capture = useCallback(async () => {
    if (!videoRef.current) return;
    setError(null);
    try {
      const blob = await captureFrame(videoRef.current, mode);
      setPages((prev) => [...prev, { blob, url: URL.createObjectURL(blob) }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That page could not be captured.");
    }
  }, [mode]);

  const removePage = (index: number) => {
    setPages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const movePage = (from: number, to: number) => {
    if (to < 0 || to >= pages.length) return;
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const finish = useCallback(async () => {
    setProcessing(true);
    setError(null);
    try {
      const output = await scanToPDF(
        pages.map((p) => p.blob),
        { pageSize, orientation: "portrait", margin: 0 },
        (step, pct) => {
          setProgressLabel(step);
          setProgress(pct);
        }
      );
      setResult(output);
      stopCamera(stream);
      setStream(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The PDF could not be created.");
    } finally {
      setProcessing(false);
    }
  }, [pages, pageSize, stream]);

  const reset = () => {
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    setPages([]);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <>
      {!stream && !result && (
        <div className="space-y-5">
          <div className="rounded-xl border-2 border-dashed border-border py-12 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted" aria-hidden="true">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-ink mb-1">Scan with your camera</p>
            <p className="text-xs text-ink-muted mb-5">
              Nothing is uploaded — the photos never leave this device
            </p>
            <button
              onClick={begin}
              className="py-2.5 px-5 btn btn-primary"
            >
              Start camera
            </button>
          </div>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <p className="text-xs text-ink-muted">
            Your browser will ask for camera permission. On a laptop this uses the
            webcam; on a phone it uses the rear camera, which is far better for
            documents.
          </p>
        </div>
      )}

      {stream && !result && (
        <div className="space-y-5">
          <div className="rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              playsInline
              muted
              className="block w-full h-auto max-h-[60vh] object-contain"
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-ink-secondary mb-1.5">Capture mode</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {MODES.map((option) => (
                <button
                  key={option}
                  onClick={() => setMode(option)}
                  className={`px-3 py-2.5 text-left rounded-lg border transition-colors ${
                    mode === option
                      ? "border-accent bg-accent-subtle"
                      : "border-border hover:bg-surface-raised"
                  }`}
                >
                  <span className={`block text-sm font-medium ${mode === option ? "text-accent" : "text-ink"}`}>
                    {SCAN_MODE_LABELS[option]}
                  </span>
                  <span className="block text-xs text-ink-muted mt-0.5">{SCAN_MODE_NOTES[option]}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <button
            onClick={capture}
            className="btn btn-primary btn-block"
          >
            Capture page {pages.length + 1}
          </button>

          {pages.length > 0 && (
            <>
              <div>
                <span className="block text-xs font-medium text-ink-secondary mb-1.5">
                  Captured pages
                </span>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pages.map((page, i) => (
                    <li key={page.url} className="rounded-lg border border-border overflow-hidden bg-surface">
                      <div className="aspect-[3/4] bg-surface-raised">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={page.url} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between px-1.5 py-1">
                        <span className="text-xs text-ink-muted pl-1">{i + 1}</span>
                        <div className="flex items-center">
                          <IconButton compact onClick={() => movePage(i, i - 1)} disabled={i === 0} label={`Move page ${i + 1} earlier`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6" /></svg>
                          </IconButton>
                          <IconButton compact onClick={() => movePage(i, i + 1)} disabled={i === pages.length - 1} label={`Move page ${i + 1} later`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9,18 15,12 9,6" /></svg>
                          </IconButton>
                          <IconButton compact danger onClick={() => removePage(i)} label={`Delete page ${i + 1}`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </IconButton>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="block text-xs font-medium text-ink-secondary mb-1.5">Page size</span>
                <div className="grid grid-cols-3 gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setPageSize(size)}
                      className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                        pageSize === size
                          ? "border-accent bg-accent-subtle text-accent"
                          : "border-border text-ink hover:bg-surface-raised"
                      }`}
                    >
                      {PAGE_SIZE_LABELS[size]}
                    </button>
                  ))}
                </div>
              </div>

              {processing && <ProgressBar progress={progress} label={progressLabel} />}

              <button
                onClick={finish}
                disabled={processing}
                className="btn btn-primary btn-block"
              >
                {processing ? "Building PDF…" : `Create PDF from ${pages.length} page${pages.length === 1 ? "" : "s"}`}
              </button>
            </>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <ResultBanner
            title="Scan complete"
            detail={`${result.pageCount} page${result.pageCount === 1 ? "" : "s"} · ${(
              result.blob.size /
              (1024 * 1024)
            ).toFixed(1)} MB`}
          />

          <NoticeMessage>
            This is a photograph of each page, so the PDF contains no text — it
            cannot be searched or copied from. Making a scan searchable needs OCR,
            which this site does not do.
          </NoticeMessage>

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
              Scan again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
