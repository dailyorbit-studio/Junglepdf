"use client";

import { useState, useCallback, useEffect } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import ResultBanner from "@/components/ResultBanner";
import ErrorMessage from "@/components/ErrorMessage";
import NoticeMessage from "@/components/NoticeMessage";
import {
  generateFavicons,
  HTML_SNIPPET,
  type FaviconResult,
} from "@/lib/favicon-generator";
import { downloadBlob } from "@/lib/download";
import { useObjectUrl } from "@/hooks/use-object-url";

/** One preview URL per icon, minted after generation and revoked on reset. */
function IconGrid({ icons }: { icons: FaviconResult["icons"] }) {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {icons.map((icon) => (
        <li
          key={icon.filename}
          className="flex items-center gap-3 p-3 bg-surface-raised rounded-lg"
        >
          <IconPreview blob={icon.blob} size={icon.size} />
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink">
              {icon.size}×{icon.size}
            </p>
            <p className="text-[11px] text-ink-muted truncate">{icon.purpose}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function IconPreview({ blob, size }: { blob: Blob; size: number }) {
  // Minted once per mount and revoked on unmount. The grid is keyed by
  // filename and remounts wholesale on a new result, so one URL per icon is
  // the whole lifecycle.
  const [url] = useState(() => URL.createObjectURL(blob));
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  const display = Math.min(size, 40);

  return (
    <div
      className="flex-shrink-0 flex items-center justify-center bg-surface rounded border border-border-subtle"
      style={{ width: 44, height: 44 }}
    >
      {/* Small icons are shown at their true size with nearest-neighbour
          scaling — smoothing a 16px favicon hides exactly the aliasing you
          are checking for. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        width={display}
        height={display}
        style={{ imageRendering: size <= 48 ? "pixelated" : "auto" }}
      />
    </div>
  );
}

export default function FaviconTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useObjectUrl();
  const [natural, setNatural] = useState({ w: 0, h: 0 });

  const [useBackground, setUseBackground] = useState(false);
  const [background, setBackground] = useState("#FFFFFF");

  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<FaviconResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFiles = useCallback(
    (files: File[]) => {
      const selected = files[0];
      setFile(selected);
      setResult(null);
      setError(null);
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

  const handleGenerate = useCallback(async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const output = await generateFavicons(
        file,
        useBackground ? background : null,
        (step, pct) => {
          setProgressLabel(step);
          setProgress(pct);
        }
      );
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while generating icons.");
    } finally {
      setProcessing(false);
    }
  }, [file, useBackground, background]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setCopied(false);
  };

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(HTML_SNIPPET);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; the snippet is on screen to select
      // manually, so this is not worth an error banner.
      setCopied(false);
    }
  };

  const tooSmall = natural.w > 0 && Math.min(natural.w, natural.h) < 512;

  return (
    <>
      {!file && (
        <FileDropZone
          accept=".png,.jpg,.jpeg,.webp,.avif"
          maxFileSizeMB={20}
          onFiles={handleFiles}
          label="Choose your logo"
          sublabel="PNG, JPEG, WebP, AVIF — square and at least 512px works best"
        />
      )}

      {!file && error && <ErrorMessage className="mt-4">{error}</ErrorMessage>}

      {file && !result && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-5">
            {preview && (
              <div className="sm:w-32 sm:h-32 w-full h-40 rounded-lg overflow-hidden bg-surface-raised border border-border-subtle flex-shrink-0 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview of the source logo" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <p className="text-sm font-medium text-ink truncate">{file.name}</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {natural.w} × {natural.h} px
                </p>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useBackground}
                    onChange={(e) => setUseBackground(e.target.checked)}
                    className="accent-accent"
                  />
                  <span className="text-xs text-ink-secondary">
                    Fill the background with a solid colour
                  </span>
                </label>
                {useBackground && (
                  <div className="flex items-center gap-2 pl-6">
                    <input
                      type="color"
                      value={background}
                      onChange={(e) => setBackground(e.target.value)}
                      className="w-9 h-9 rounded border border-border cursor-pointer bg-surface"
                      aria-label="Background colour"
                    />
                    <span className="text-xs font-mono text-ink-muted">{background.toUpperCase()}</span>
                  </div>
                )}
                <p className="text-xs text-ink-muted pl-6">
                  Leave this off to keep transparency. Turn it on if your logo is a dark shape that
                  would disappear against a dark browser theme.
                </p>
              </div>
            </div>
          </div>

          {tooSmall && (
            <NoticeMessage>
              Your source is {natural.w} × {natural.h} px. The 512px icon will be upscaled and look
              soft. Start from an image at least 512px on its shortest side for a clean result.
            </NoticeMessage>
          )}

          {processing && <ProgressBar progress={progress} label={progressLabel} />}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={processing}
              className="flex-1 btn btn-primary"
            >
              {processing ? "Generating…" : "Generate favicon set"}
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
            title="Favicon set ready"
            detail={`${result.icons.length} PNG icons, a web manifest and a README`}
          />

          {result.warning && <NoticeMessage>{result.warning}</NoticeMessage>}

          <IconGrid icons={result.icons} />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-ink-secondary">Paste into your &lt;head&gt;</span>
              <button
                onClick={copySnippet}
                className="text-xs text-accent hover:text-accent-hover font-medium transition-colors"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="p-3 bg-surface-raised rounded-lg text-[11px] leading-relaxed text-ink-secondary overflow-x-auto font-mono">
              {HTML_SNIPPET}
            </pre>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => downloadBlob(result.zipBlob, "favicons.zip")}
              className="flex-1 btn btn-primary"
            >
              Download favicons.zip
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
