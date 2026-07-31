"use client";

import { useRef, useState, useCallback, useEffect } from "react";

/**
 * Draw-your-signature canvas.
 *
 * Pointer events rather than mouse or touch events: one code path covers a
 * mouse, a finger and a stylus, and `setPointerCapture` keeps the stroke
 * attached when the pointer leaves the canvas mid-flourish — without it, a
 * signature that overshoots the edge breaks into disconnected pieces.
 */

const STROKE_WIDTH = 2.5;

export default function SignaturePad({
  color,
  onChange,
}: {
  color: string;
  onChange: (hasInk: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  // Size the backing store to the device pixel ratio, or strokes are visibly
  // soft on any high-DPI screen — which is most of them.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      // Redrawing after a resize would need the stroke history; clearing is
      // honest and a resize mid-signature is rare.
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const pointFrom = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    lastPoint.current = pointFrom(e);
  }, []);

  const move = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawing.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !lastPoint.current) return;

      const point = pointFrom(e);

      ctx.strokeStyle = color;
      ctx.lineWidth = STROKE_WIDTH;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();

      lastPoint.current = point;

      if (!hasInk) {
        setHasInk(true);
        onChange(true);
      }
    },
    [color, hasInk, onChange]
  );

  const end = useCallback(() => {
    drawing.current = false;
    lastPoint.current = null;
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(false);
  }, [onChange]);

  return (
    <div>
      <div className="relative border border-border rounded-lg bg-surface overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          // Without this the browser scrolls the page instead of drawing.
          className="block w-full h-40 touch-none cursor-crosshair"
        />
        {!hasInk && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-ink-muted pointer-events-none">
            Draw your signature here
          </p>
        )}
        {/* Signature line, for orientation. */}
        <div className="absolute left-6 right-6 bottom-8 border-b border-border-subtle pointer-events-none" />
      </div>

      <button
        type="button"
        onClick={clear}
        disabled={!hasInk}
        className="mt-2 text-xs text-ink-muted hover:text-ink-secondary disabled:opacity-40 transition-colors duration-150"
      >
        Clear
      </button>
    </div>
  );
}

/**
 * Read the pad's ink as a transparent PNG, trimmed to its bounding box.
 *
 * Trimming matters: an untrimmed 800×160 canvas with a small signature in the
 * middle would stamp mostly empty space onto the page, and the placement box
 * would not match what the user sees.
 */
export async function padToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not read the signature canvas.");

  const { width, height } = canvas;
  const { data } = ctx.getImageData(0, 0, width, height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Alpha channel of this pixel. Anything non-zero is ink.
      if (data[(y * width + x) * 4 + 3] !== 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) throw new Error("Draw a signature first.");

  const PAD = 8;
  minX = Math.max(0, minX - PAD);
  minY = Math.max(0, minY - PAD);
  maxX = Math.min(width - 1, maxX + PAD);
  maxY = Math.min(height - 1, maxY + PAD);

  const out = document.createElement("canvas");
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;

  const outCtx = out.getContext("2d");
  if (!outCtx) throw new Error("Your browser could not process the signature.");

  outCtx.drawImage(canvas, minX, minY, out.width, out.height, 0, 0, out.width, out.height);

  return new Promise<Blob>((resolve, reject) => {
    out.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The signature could not be encoded."))),
      "image/png"
    );
  });
}
