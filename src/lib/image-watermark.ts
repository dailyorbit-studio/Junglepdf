/**
 * Watermark Image — canvas compositing
 *
 * Draws the source at full resolution, then composites a mark over it. The
 * mark is measured in *fractions of the image* rather than pixels: a 24px
 * caption that looks right on a 800px thumbnail is invisible on a 6000px
 * camera original, and users pick the setting on a scaled preview either way.
 */

import {
  loadDrawableImage,
  createSurface,
  drawWithMatte,
  assertEncodedAs,
  formatSupportsAlpha,
} from "./canvas-utils";
import type { ProgressFn } from "./ffmpeg";

export type WatermarkPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "tile";

export const WATERMARK_POSITIONS: { value: WatermarkPosition; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top" },
  { value: "top-right", label: "Top right" },
  { value: "middle-left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "middle-right", label: "Right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom" },
  { value: "bottom-right", label: "Bottom right" },
  { value: "tile", label: "Tiled" },
];

export interface WatermarkOptions {
  text: string;
  position: WatermarkPosition;
  /** Cap height as a fraction of the image's shorter side, 0.01–0.25. */
  scale: number;
  /** 0–1. */
  opacity: number;
  color: string;
  /** Degrees, -90 to 90. */
  rotation: number;
  outputFormat: string;
  quality: number;
}

export interface WatermarkResult {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
  originalSize: number;
}

export async function watermarkImage(
  file: File,
  options: WatermarkOptions,
  onProgress?: ProgressFn
): Promise<WatermarkResult> {
  const text = options.text.trim();
  if (!text) throw new Error("Enter some text to stamp onto the image.");

  onProgress?.("Reading image…", 15);

  const image = await loadDrawableImage(file);

  try {
    const { width, height } = image;

    onProgress?.("Drawing…", 40);

    const surface = createSurface(width, height);
    drawWithMatte(surface, image, width, height, options.outputFormat);

    const ctx = surface.ctx;
    const fontSize = Math.max(8, Math.round(Math.min(width, height) * options.scale));

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, options.opacity));
    ctx.fillStyle = options.color;
    ctx.font = `600 ${fontSize}px ${"Inter, system-ui, sans-serif"}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    // A light stroke keeps a white mark legible over a white sky and a dark
    // one legible over shadow, without needing the user to pick a colour that
    // happens to contrast with every region of their photo.
    ctx.strokeStyle = "rgba(0,0,0,0.28)";
    ctx.lineWidth = Math.max(1, fontSize * 0.03);
    ctx.lineJoin = "round";

    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;

    if (options.position === "tile") {
      drawTiled(ctx, text, width, height, textWidth, fontSize, options.rotation);
    } else {
      const { x, y } = anchorFor(options.position, width, height, textWidth, fontSize);
      ctx.translate(x, y);
      ctx.rotate((options.rotation * Math.PI) / 180);
      ctx.strokeText(text, 0, 0);
      ctx.fillText(text, 0, 0);
    }

    ctx.restore();

    onProgress?.("Encoding…", 80);

    const blob = await surface.toBlob(options.outputFormat, options.quality);
    assertEncodedAs(blob, options.outputFormat);

    onProgress?.("Done", 100);

    const ext = options.outputFormat.split("/")[1].replace("jpeg", "jpg");

    return {
      blob,
      filename: file.name.replace(/\.[^.]+$/, "") + `_watermarked.${ext}`,
      width,
      height,
      originalSize: file.size,
    };
  } finally {
    image.release();
  }
}

/** Inset from the edge, so a corner mark never touches it. */
const EDGE_INSET = 0.04;

function anchorFor(
  position: WatermarkPosition,
  width: number,
  height: number,
  textWidth: number,
  fontSize: number
): { x: number; y: number } {
  const insetX = width * EDGE_INSET + textWidth / 2;
  const insetY = height * EDGE_INSET + fontSize / 2;

  const xs: Record<string, number> = {
    left: insetX,
    center: width / 2,
    right: width - insetX,
  };
  const ys: Record<string, number> = {
    top: insetY,
    middle: height / 2,
    bottom: height - insetY,
  };

  const [vertical, horizontal] = position.split("-");
  return {
    x: xs[horizontal ?? "center"] ?? width / 2,
    y: ys[vertical === "middle" ? "middle" : vertical] ?? height / 2,
  };
}

/**
 * Repeat the mark across the whole image.
 *
 * The grid is laid out in rotated space and drawn oversized, so a 45° tiling
 * still covers the corners instead of leaving bare triangles.
 */
function drawTiled(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  textWidth: number,
  fontSize: number,
  rotation: number
): void {
  const stepX = textWidth + fontSize * 2.5;
  const stepY = fontSize * 4;
  const diagonal = Math.hypot(width, height);

  ctx.translate(width / 2, height / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  for (let y = -diagonal / 2; y < diagonal / 2; y += stepY) {
    for (let x = -diagonal / 2; x < diagonal / 2; x += stepX) {
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    }
  }
}

export { formatSupportsAlpha };
