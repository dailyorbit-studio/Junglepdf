"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import CopyButton from "@/components/CopyButton";

export default function ScanQrTool() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const decodeCanvas = useCallback((canvas: HTMLCanvasElement, w: number, h: number) => {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    const img = ctx.getImageData(0, 0, w, h);
    return jsQR(img.data, w, h);
  }, []);

  const start = useCallback(async () => {
    setError("");
    setResult("");

    // The scan loop is local so it can reference itself for the next frame
    // without a self-referential useCallback.
    const loop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const w = video.videoWidth;
      const h = video.videoHeight;
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d", { willReadFrequently: true })?.drawImage(video, 0, 0, w, h);
      const code = decodeCanvas(canvas, w, h);
      if (code?.data) {
        setResult(code.data);
        stop();
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setError("Could not access the camera. Grant camera permission, or use “Scan from image” below.");
    }
  }, [decodeCanvas, stop]);

  const onFile = useCallback(
    (file: File) => {
      setError("");
      setResult("");
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d", { willReadFrequently: true })?.drawImage(img, 0, 0);
        const code = decodeCanvas(canvas, img.width, img.height);
        if (code?.data) setResult(code.data);
        else setError("No QR code was found in that image.");
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => setError("Could not read that image file.");
      img.src = URL.createObjectURL(file);
    },
    [decodeCanvas]
  );

  const isUrl = /^https?:\/\//i.test(result.trim());

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        {!scanning ? (
          <button
            type="button"
            onClick={start}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-colors duration-150"
          >
            Start camera
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="rounded-lg border border-border px-5 py-2 text-sm font-semibold text-ink-secondary hover:bg-surface-raised transition-colors duration-150"
          >
            Stop camera
          </button>
        )}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-border px-5 py-2 text-sm font-semibold text-ink-secondary hover:bg-surface-raised transition-colors duration-150"
        >
          Scan from image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-black/5" style={{ display: scanning ? "block" : "none" }}>
        <video ref={videoRef} playsInline muted className="mx-auto max-h-[420px] w-full object-contain" />
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <p className="rounded-lg border border-error-border bg-error-subtle px-4 py-3 text-sm text-error-ink">{error}</p>
      )}

      {result && (
        <div className="rounded-lg border border-success-border bg-success-subtle p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-sm font-semibold text-success-ink">Scanned result</span>
            <CopyButton value={result} />
          </div>
          <p className="break-all font-mono text-sm text-ink">
            {isUrl ? (
              <a href={result} target="_blank" rel="noopener noreferrer nofollow" className="text-accent underline">
                {result}
              </a>
            ) : (
              result
            )}
          </p>
        </div>
      )}

      <p className="text-xs text-ink-muted">
        The camera feed is processed on your device. No image or video is ever uploaded.
      </p>
    </div>
  );
}
