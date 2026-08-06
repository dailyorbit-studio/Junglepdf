"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * Renders a QR code from a payload string and offers a PNG download.
 *
 * Uses the `qrcode` library entirely in the browser — the value is encoded to a
 * data-URL image on the device and never sent anywhere, which is what lets a
 * WiFi password or payment ID be turned into a QR safely.
 */
export default function QrResult({ value, filename = "qrcode" }: { value: string; filename?: string }) {
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");
  const [size, setSize] = useState(320);

  useEffect(() => {
    if (!value) {
      setDataUrl("");
      setError("");
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(value, { width: size, margin: 2, errorCorrectionLevel: "M" })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not generate a QR code — the input may be too long.");
          setDataUrl("");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface-raised p-6">
      {dataUrl ? (
        <>
          {/* Plain img: the source is an on-device data URL, and next/image
              cannot optimize in a static export anyway. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dataUrl}
            alt="Generated QR code"
            className="rounded-lg bg-white p-2"
            style={{ width: size, maxWidth: "100%", height: "auto" }}
          />
          <div className="flex items-center gap-3 text-sm">
            <label htmlFor="qr-size" className="text-ink-secondary">
              Size
            </label>
            <input
              id="qr-size"
              type="range"
              min={160}
              max={640}
              step={32}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="accent-accent"
            />
          </div>
          <a
            href={dataUrl}
            download={`${filename}.png`}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-colors duration-150"
          >
            Download PNG
          </a>
        </>
      ) : (
        <p className="py-16 text-center text-sm text-ink-muted">
          {error || "Fill in the details to generate a QR code."}
        </p>
      )}
    </div>
  );
}
