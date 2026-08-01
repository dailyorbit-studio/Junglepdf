"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import IconButton from "@/components/IconButton";
import NoticeMessage from "@/components/NoticeMessage";
import {
  renderThumbnails,
  organizePDF,
  type PageThumbnail,
  type OrganizeResult,
} from "@/lib/pdf-organizer";
import { downloadBlob } from "@/lib/download";

interface Slot {
  /** 0-indexed page in the source document. */
  index: number;
  keep: boolean;
}

export default function OrganizePdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<OrganizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const selected = files[0];
    setError(null);
    setResult(null);
    setThumbnails([]);
    setSlots([]);
    setLoading(true);

    try {
      const pages = await renderThumbnails(selected, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setThumbnails(pages);
      setSlots(pages.map((page) => ({ index: page.index, keep: true })));
      setFile(selected);
    } catch (err) {
      // file stays null, so this has to render outside the {file && ...} branch.
      setError(err instanceof Error ? err.message : "This PDF couldn't be read.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleKeep = (position: number) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === position ? { ...slot, keep: !slot.keep } : slot))
    );
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= slots.length) return;
    setSlots((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  };

  const kept = slots.filter((slot) => slot.keep);

  const handleApply = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const order = slots.filter((slot) => slot.keep).map((slot) => slot.index);
      const output = await organizePDF(file, order, (step, pct) => {
        setProgressLabel(step);
        setProgress(pct);
      });
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while rebuilding.");
    } finally {
      setProcessing(false);
    }
  }, [file, slots]);

  const reset = () => {
    setFile(null);
    setThumbnails([]);
    setSlots([]);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const thumbnailFor = (index: number) => thumbnails.find((t) => t.index === index);

  return (
    <>
      {!file && !loading && (
        <FileDropZone
          accept=".pdf"
          maxFileSizeMB={100}
          onFiles={handleFiles}
          label="Choose a PDF"
          sublabel="Up to 100MB · every page is rendered as a preview"
        />
      )}

      {loading && (
        <div className="py-4">
          <ProgressBar progress={progress} label={progressLabel} />
          <p className="text-xs text-ink-muted mt-3 text-center">
            Rendering previews. Long documents take a moment.
          </p>
        </div>
      )}

      {!file && !loading && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{file.name}</p>
              <p className="text-xs text-ink-muted mt-0.5">
                Keeping {kept.length} of {slots.length} pages
              </p>
            </div>
            <button
              onClick={() => setSlots((prev) => prev.map((s) => ({ ...s, keep: true })))}
              disabled={processing || kept.length === slots.length}
              className="text-xs text-accent hover:text-accent-hover disabled:opacity-30 disabled:hover:text-accent font-medium transition-colors flex-shrink-0"
            >
              Restore all
            </button>
          </div>

          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((slot, position) => {
              const thumb = thumbnailFor(slot.index);
              return (
                <li
                  key={`${slot.index}-${position}`}
                  className={`relative rounded-lg border overflow-hidden transition-opacity ${
                    slot.keep ? "border-border bg-surface" : "border-border-subtle opacity-40"
                  }`}
                >
                  <div className="aspect-[3/4] bg-surface-raised flex items-center justify-center overflow-hidden">
                    {thumb && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={thumb.dataUrl}
                        alt={`Page ${slot.index + 1}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between px-2 py-1.5 border-t border-border-subtle">
                    <span className="text-[11px] text-ink-muted">
                      p.{slot.index + 1}
                      {slot.keep && position !== slot.index && (
                        <span className="text-accent"> → {position + 1}</span>
                      )}
                    </span>
                    {/* compact: three controls share a ~138px card on a small phone. */}
                    <div className="flex items-center">
                      <IconButton
                        compact
                        onClick={() => move(position, position - 1)}
                        disabled={position === 0 || processing}
                        label={`Move page ${slot.index + 1} earlier`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6" /></svg>
                      </IconButton>
                      <IconButton
                        compact
                        onClick={() => move(position, position + 1)}
                        disabled={position === slots.length - 1 || processing}
                        label={`Move page ${slot.index + 1} later`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9,18 15,12 9,6" /></svg>
                      </IconButton>
                      <IconButton
                        compact
                        onClick={() => toggleKeep(position)}
                        disabled={processing}
                        className={slot.keep ? "text-ink-muted hover:text-error" : "text-accent"}
                        label={slot.keep ? `Remove page ${slot.index + 1}` : `Restore page ${slot.index + 1}`}
                      >
                        {slot.keep ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12" /></svg>
                        )}
                      </IconButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {kept.length === 0 && (
            <NoticeMessage>
              Every page is marked for removal. Keep at least one — a PDF with no pages is not a
              valid document.
            </NoticeMessage>
          )}

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleApply}
              disabled={processing || kept.length === 0}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Rebuilding…" : `Save ${kept.length} page${kept.length === 1 ? "" : "s"}`}
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
            title="PDF rebuilt"
            detail={
              result.removedCount > 0
                ? `${result.pageCount} pages kept, ${result.removedCount} removed`
                : `${result.pageCount} pages, reordered`
            }
          />
          {result.warning && <NoticeMessage>{result.warning}</NoticeMessage>}
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download PDF
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Organize another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
