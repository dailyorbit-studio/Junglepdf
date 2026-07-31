/**
 * Color Picker — pixel sampling and palette extraction
 *
 * Two jobs: read one exact pixel, and summarise the whole image into a small
 * palette. The palette uses median-cut rather than k-means — it is
 * deterministic (the same image always gives the same swatches, which matters
 * when someone is copying hex codes into a stylesheet) and needs no random
 * seeding or convergence check.
 */

import { loadDrawableImage, createSurface } from "./canvas-utils";

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface Swatch extends RGB {
  hex: string;
  /** Share of sampled pixels this swatch represents, 0–1. */
  weight: number;
}

export function toHex({ r, g, b }: RGB): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(v).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export function toRgbString({ r, g, b }: RGB): string {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

export function toHslString({ r, g, b }: RGB): string {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  let s = 0;

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/** Black or white body text, whichever stays readable on this swatch. */
export function readableTextOn({ r, g, b }: RGB): string {
  // Rec. 709 luma — close enough to perceived brightness for a label.
  const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luma > 0.55 ? "#1C1917" : "#FFFFFF";
}

export interface ImageSample {
  /** Downscaled pixel data, for palette work and per-pixel picking. */
  data: Uint8ClampedArray;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
}

/**
 * Read the image into an RGBA buffer, downscaling first.
 *
 * A full-resolution getImageData on a 24MP photo is ~96MB and buys nothing:
 * the palette is a summary, and a single picked pixel at 1:1 is more precision
 * than a person dragging a cursor can use anyway.
 */
export async function sampleImage(
  file: File,
  maxDimension = 640,
  onProgress?: (step: string, pct: number) => void
): Promise<ImageSample> {
  onProgress?.("Reading image…", 15);

  const image = await loadDrawableImage(file);

  try {
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    onProgress?.("Sampling pixels…", 50);

    const surface = createSurface(width, height);
    surface.ctx.imageSmoothingEnabled = true;
    surface.ctx.imageSmoothingQuality = "high";
    surface.ctx.drawImage(image.source, 0, 0, width, height);

    let data: Uint8ClampedArray;
    try {
      data = surface.ctx.getImageData(0, 0, width, height).data;
    } catch {
      // getImageData throws a SecurityError on a tainted canvas. A canvas can
      // only be tainted by a cross-origin draw, which cannot happen here — but
      // if it somehow does, say so rather than surfacing a raw DOMException.
      throw new Error("This image's pixel data could not be read by your browser.");
    }

    onProgress?.("Done", 100);

    return {
      data,
      width,
      height,
      naturalWidth: image.width,
      naturalHeight: image.height,
    };
  } finally {
    image.release();
  }
}

/** The color at one pixel of the *sampled* buffer. */
export function pixelAt(sample: ImageSample, x: number, y: number): RGB | null {
  const px = Math.floor(x);
  const py = Math.floor(y);
  if (px < 0 || py < 0 || px >= sample.width || py >= sample.height) return null;

  const i = (py * sample.width + px) * 4;
  // Fully transparent pixels have meaningless RGB — report nothing rather
  // than the arbitrary value sitting in the buffer.
  if (sample.data[i + 3] === 0) return null;

  return { r: sample.data[i], g: sample.data[i + 1], b: sample.data[i + 2] };
}

/**
 * One cell of the colour histogram: a group of near-identical pixels, with
 * exact channel sums so the bucket average stays accurate despite the
 * quantised key.
 */
interface Bin {
  /** Representative channel values, used for sorting and range. */
  r: number;
  g: number;
  b: number;
  count: number;
  sumR: number;
  sumG: number;
  sumB: number;
}

/**
 * Build a histogram of the opaque pixels.
 *
 * Quantising to 5 bits per channel caps the histogram at 32768 entries no
 * matter how large the image is. Working from bins rather than raw pixels is
 * what makes the palette well-behaved on flat images: three distinct colours
 * produce three bins and therefore three swatches, where bucketing raw pixels
 * would keep halving them and hand back the same colour twice.
 */
function histogram(data: Uint8ClampedArray): { bins: Bin[]; total: number } {
  const map = new Map<number, Bin>();
  let total = 0;

  for (let i = 0; i < data.length; i += 4) {
    // Transparent and near-transparent pixels are skipped — a logo on a
    // transparent background should not produce a palette dominated by
    // whatever RGB the encoder left under the alpha.
    if (data[i + 3] < 128) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);

    const existing = map.get(key);
    if (existing) {
      existing.count++;
      existing.sumR += r;
      existing.sumG += g;
      existing.sumB += b;
    } else {
      map.set(key, { r, g, b, count: 1, sumR: r, sumG: g, sumB: b });
    }
    total++;
  }

  return { bins: [...map.values()], total };
}

/** Widest colour channel across these bins — the axis median-cut splits on. */
function widestChannel(bins: Bin[]): { channel: "r" | "g" | "b"; range: number } {
  let rMin = 255, rMax = 0, gMin = 255, gMax = 0, bMin = 255, bMax = 0;

  for (const p of bins) {
    if (p.r < rMin) rMin = p.r;
    if (p.r > rMax) rMax = p.r;
    if (p.g < gMin) gMin = p.g;
    if (p.g > gMax) gMax = p.g;
    if (p.b < bMin) bMin = p.b;
    if (p.b > bMax) bMax = p.b;
  }

  const ranges = [
    { channel: "r" as const, range: rMax - rMin },
    { channel: "g" as const, range: gMax - gMin },
    { channel: "b" as const, range: bMax - bMin },
  ];

  return ranges.reduce((a, b) => (b.range > a.range ? b : a));
}

/**
 * Extract the dominant colours via median cut over the histogram.
 */
export function extractPalette(sample: ImageSample, count = 6): Swatch[] {
  const { bins, total } = histogram(sample.data);
  if (bins.length === 0) return [];

  let buckets: Bin[][] = [bins];

  while (buckets.length < count) {
    // Split whichever bucket currently spans the most colour — that is what
    // keeps a large flat background from swallowing every slot.
    let targetIndex = -1;
    let targetRange = 0;

    for (let i = 0; i < buckets.length; i++) {
      if (buckets[i].length < 2) continue;
      const { range } = widestChannel(buckets[i]);
      if (range > targetRange) {
        targetRange = range;
        targetIndex = i;
      }
    }

    // Every bucket holds a single colour already — the image has fewer
    // distinct colours than the requested palette size.
    if (targetIndex === -1) break;

    const target = buckets[targetIndex];
    const { channel } = widestChannel(target);
    const sorted = [...target].sort((a, b) => a[channel] - b[channel]);

    // Split at the *weighted* median so the two halves hold roughly equal
    // numbers of pixels, not equal numbers of bins. Splitting by bin count
    // would give a handful of stray pixels the same say as a solid
    // background.
    const half = sorted.reduce((sum, bin) => sum + bin.count, 0) / 2;
    let running = 0;
    let mid = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      running += sorted[i].count;
      if (running >= half) {
        mid = i + 1;
        break;
      }
      mid = i + 2;
    }

    buckets = [
      ...buckets.slice(0, targetIndex),
      sorted.slice(0, mid),
      sorted.slice(mid),
      ...buckets.slice(targetIndex + 1),
    ];
  }

  return buckets
    .filter((bucket) => bucket.length > 0)
    .map((bucket) => {
      let sumR = 0, sumG = 0, sumB = 0, n = 0;
      for (const bin of bucket) {
        sumR += bin.sumR;
        sumG += bin.sumG;
        sumB += bin.sumB;
        n += bin.count;
      }
      const rgb = {
        r: Math.round(sumR / n),
        g: Math.round(sumG / n),
        b: Math.round(sumB / n),
      };
      return { ...rgb, hex: toHex(rgb), weight: n / total };
    })
    .sort((a, b) => b.weight - a.weight);
}
