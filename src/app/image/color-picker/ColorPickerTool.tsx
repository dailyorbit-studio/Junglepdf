"use client";

import { useState, useCallback, useRef } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ErrorMessage from "@/components/ErrorMessage";
import {
  sampleImage,
  extractPalette,
  pixelAt,
  toHex,
  toRgbString,
  toHslString,
  readableTextOn,
  type ImageSample,
  type Swatch,
  type RGB,
} from "@/lib/color-extractor";
import { useObjectUrl } from "@/hooks/use-object-url";

const PALETTE_SIZE = 6;

function CopyableValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard permission can be denied. The value is on screen either
      // way, so there is nothing worth interrupting the user about.
      setCopied(false);
    }
  };

  return (
    <button
      onClick={copy}
      className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-surface-raised hover:bg-border-subtle transition-colors text-left"
      aria-label={`Copy ${label} value ${value}`}
    >
      <span className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</span>
      <span className="text-xs font-mono text-ink">{copied ? "Copied" : value}</span>
    </button>
  );
}

export default function ColorPickerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useObjectUrl();
  const [sample, setSample] = useState<ImageSample | null>(null);
  const [palette, setPalette] = useState<Swatch[]>([]);
  const [picked, setPicked] = useState<RGB | null>(null);

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const selected = files[0];
      setError(null);
      setPicked(null);
      setPalette([]);
      setSample(null);
      setProcessing(true);

      try {
        const sampled = await sampleImage(selected, 640, (step, pct) => {
          setProgressLabel(step);
          setProgress(pct);
        });
        setSample(sampled);
        setPalette(extractPalette(sampled, PALETTE_SIZE));
        setFile(selected);
        setPreview(selected);
      } catch (err) {
        // setFile stays null, so the error has to render outside the
        // {file && ...} branch below.
        setError(err instanceof Error ? err.message : "This image couldn't be read.");
        setFile(null);
        setPreview(null);
      } finally {
        setProcessing(false);
      }
    },
    [setPreview]
  );

  const pickAt = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = imageRef.current;
    if (!el || !sample) return;

    const bounds = el.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;

    // The sample buffer is a downscale of the source, so map through
    // fractions rather than assuming a 1:1 pixel relationship.
    const fx = (e.clientX - bounds.left) / bounds.width;
    const fy = (e.clientY - bounds.top) / bounds.height;

    const rgb = pixelAt(sample, fx * sample.width, fy * sample.height);
    if (rgb) setPicked(rgb);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setSample(null);
    setPalette([]);
    setPicked(null);
    setError(null);
    setProgress(0);
  };

  const active = picked ?? (palette.length > 0 ? palette[0] : null);

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".jpg,.jpeg,.png,.webp,.avif,.bmp,.gif"
          maxFileSizeMB={50}
          onFiles={handleFiles}
          label="Choose an image"
          sublabel="JPEG, PNG, WebP, AVIF, BMP, GIF — up to 50MB"
        />
      )}

      {!file && processing && (
        <div className="mt-4">
          <ProgressBar progress={progress} label={progressLabel} />
        </div>
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && sample && (
        <div className="space-y-6">
          <div
            className="relative rounded-lg overflow-hidden border border-border-subtle bg-surface-raised cursor-crosshair touch-none"
            onPointerDown={pickAt}
            onPointerMove={(e) => {
              // Only track while a button is held — hover-to-pick makes the
              // value impossible to read before it changes again.
              if (e.buttons === 1) pickAt(e);
            }}
          >
            {preview && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                ref={imageRef}
                src={preview}
                alt="Click anywhere on this image to read its colour"
                className="w-full h-auto block pointer-events-none"
                draggable={false}
              />
            )}
          </div>

          <p className="text-xs text-ink-muted">
            Click or drag on the image to read a colour. Values are sampled from a downscaled copy,
            so a single click reports the local average rather than one noisy pixel.
          </p>

          {active && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div
                className="sm:w-40 h-24 sm:h-auto rounded-lg flex items-center justify-center flex-shrink-0 border border-border-subtle"
                style={{ backgroundColor: toHex(active) }}
              >
                <span
                  className="text-sm font-mono font-medium"
                  style={{ color: readableTextOn(active) }}
                >
                  {toHex(active)}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <CopyableValue label="Hex" value={toHex(active)} />
                <CopyableValue label="RGB" value={toRgbString(active)} />
                <CopyableValue label="HSL" value={toHslString(active)} />
              </div>
            </div>
          )}

          {palette.length > 0 && (
            <div>
              <span className="block text-xs font-medium text-ink-secondary mb-2">
                Dominant colours
              </span>
              <ul className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {/* Keyed by index as well as hex: two buckets can round to
                    the same colour on a near-flat image, and a bare hex key
                    would collide. */}
                {palette.map((swatch, i) => (
                  <li key={`${swatch.hex}-${i}`}>
                    <button
                      onClick={() => setPicked(swatch)}
                      className="w-full rounded-lg border border-border-subtle overflow-hidden hover:shadow-[var(--shadow-card-hover)] transition-shadow"
                      aria-label={`Select ${swatch.hex}, ${Math.round(swatch.weight * 100)} percent of the image`}
                    >
                      <span className="block h-14" style={{ backgroundColor: swatch.hex }} />
                      <span className="block px-1 py-1.5 bg-surface">
                        <span className="block text-[10px] font-mono text-ink">{swatch.hex}</span>
                        <span className="block text-[10px] text-ink-muted">
                          {Math.round(swatch.weight * 100)}%
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={reset}
            className="btn btn-secondary btn-block"
          >
            Pick from another image
          </button>
        </div>
      )}
    </>
  );
}
