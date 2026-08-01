"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import {
  transformImage,
  transformedSize,
  type Rotation,
  type TransformResult,
} from "@/lib/image-rotator";
import { FORMAT_LABELS, formatUsesQuality, type OutputFormat } from "@/lib/image-converter";
import { downloadBlob } from "@/lib/download";
import { useObjectUrl } from "@/hooks/use-object-url";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FORMATS: OutputFormat[] = ["image/jpeg", "image/png", "image/webp"];

export default function ImageRotateTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useObjectUrl();
  const [natural, setNatural] = useState({ w: 0, h: 0 });

  const [rotation, setRotation] = useState<Rotation>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState(0.92);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<TransformResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: File[]) => {
      const selected = files[0];
      setFile(selected);
      setResult(null);
      setError(null);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setPreview(selected);

      const url = URL.createObjectURL(selected);
      const img = new Image();
      img.onload = () => {
        setNatural({ w: img.naturalWidth, h: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setError("This image couldn't be read. It may be corrupted or in an unsupported format.");
        setFile(null);
        setPreview(null);
      };
      img.src = url;
    },
    [setPreview]
  );

  const turn = (degrees: 90 | -90) => {
    setRotation((current) => (((current + degrees + 360) % 360) as Rotation));
  };

  const handleApply = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await transformImage(
        file,
        { rotation, flipHorizontal: flipH, flipVertical: flipV, format, quality },
        (step, pct) => {
          setProgressLabel(step);
          setProgress(pct);
        }
      );
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while transforming.");
    } finally {
      setProcessing(false);
    }
  }, [file, rotation, flipH, flipV, format, quality]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const outSize = transformedSize(natural.w, natural.h, rotation);
  const unchanged = rotation === 0 && !flipH && !flipV;

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".jpg,.jpeg,.png,.webp,.avif,.bmp"
          maxFileSizeMB={50}
          onFiles={handleFiles}
          label="Choose an image"
          sublabel="JPEG, PNG, WebP, AVIF, BMP — up to 50MB"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-6">
          <div className="flex items-center justify-center bg-surface-raised rounded-lg border border-border-subtle p-6 min-h-[16rem] overflow-hidden">
            {preview && (
              /* The preview shows the pending transform via CSS so the user
                 sees the result before committing to an encode. */
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={preview}
                alt="Preview of the transformed image"
                className="max-h-64 max-w-full transition-transform duration-200 ease-[var(--ease-smooth)]"
                style={{
                  transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                }}
              />
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-ink truncate">{file.name}</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {natural.w} × {natural.h} px &middot; {formatBytes(file.size)}
              {rotation === 90 || rotation === 270 ? (
                <span className="text-ink-secondary">
                  {" "}
                  → {outSize.width} × {outSize.height} px after rotating
                </span>
              ) : null}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => turn(-90)}
              disabled={processing}
              className="px-3 py-2 text-xs rounded-md border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-40 transition-colors"
            >
              ⟲ Rotate left
            </button>
            <button
              onClick={() => turn(90)}
              disabled={processing}
              className="px-3 py-2 text-xs rounded-md border border-border text-ink-secondary hover:bg-surface-raised disabled:opacity-40 transition-colors"
            >
              ⟳ Rotate right
            </button>
            <button
              onClick={() => setFlipH((v) => !v)}
              disabled={processing}
              className={`px-3 py-2 text-xs rounded-md border transition-colors disabled:opacity-40 ${
                flipH ? "border-accent bg-accent-subtle text-accent" : "border-border text-ink-secondary hover:bg-surface-raised"
              }`}
            >
              ⇄ Flip horizontal
            </button>
            <button
              onClick={() => setFlipV((v) => !v)}
              disabled={processing}
              className={`px-3 py-2 text-xs rounded-md border transition-colors disabled:opacity-40 ${
                flipV ? "border-accent bg-accent-subtle text-accent" : "border-border text-ink-secondary hover:bg-surface-raised"
              }`}
            >
              ⇅ Flip vertical
            </button>
            <button
              onClick={() => {
                setRotation(0);
                setFlipH(false);
                setFlipV(false);
              }}
              disabled={processing || unchanged}
              className="px-3 py-2 text-xs rounded-md border border-border text-ink-muted hover:text-ink disabled:opacity-30 transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="rotate-format" className="block text-xs font-medium text-ink-secondary mb-1">
                Format
              </label>
              <select
                id="rotate-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as OutputFormat)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {FORMAT_LABELS[f]}
                  </option>
                ))}
              </select>
            </div>
            {formatUsesQuality(format) && (
              <div>
                <label htmlFor="rotate-quality" className="block text-xs font-medium text-ink-secondary mb-1">
                  Quality ({Math.round(quality * 100)}%)
                </label>
                <input
                  id="rotate-quality"
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-accent mt-2"
                />
              </div>
            )}
          </div>

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleApply}
              disabled={processing || unchanged}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Applying…" : unchanged ? "Rotate or flip first" : "Apply and download"}
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
            title="Transform applied"
            detail={`${result.width} × ${result.height} px · ${formatBytes(result.blob.size)}`}
          />
          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-1 btn btn-primary"
            >
              Download
            </button>
            <button
              onClick={reset}
              className="btn btn-secondary"
            >
              Do another
            </button>
          </div>
        </div>
      )}
    </>
  );
}
