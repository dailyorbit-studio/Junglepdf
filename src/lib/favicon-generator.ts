/**
 * Favicon Generator — one square source, many PNG sizes, one ZIP
 *
 * Note what this does *not* produce: a multi-resolution .ico. Writing an ICO
 * container by hand is possible, but every browser released this decade reads
 * PNG favicons via <link rel="icon" sizes="...">, and the HTML snippet below
 * wires that up. Shipping a hand-rolled ICO to save legacy IE is not worth
 * the failure modes.
 */

import { loadDrawableImage, createSurface } from "./canvas-utils";
import { createZip, type ZipEntry } from "./zip";

export interface IconSpec {
  size: number;
  filename: string;
  /** Why this size exists — shown in the UI so the list isn't mysterious. */
  purpose: string;
}

export const ICON_SPECS: IconSpec[] = [
  { size: 16, filename: "favicon-16x16.png", purpose: "Browser tab" },
  { size: 32, filename: "favicon-32x32.png", purpose: "Browser tab (retina)" },
  { size: 48, filename: "favicon-48x48.png", purpose: "Windows site icon" },
  { size: 180, filename: "apple-touch-icon.png", purpose: "iOS home screen" },
  { size: 192, filename: "android-chrome-192x192.png", purpose: "Android home screen" },
  { size: 512, filename: "android-chrome-512x512.png", purpose: "PWA splash screen" },
];

export const HTML_SNIPPET = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

const WEBMANIFEST = JSON.stringify(
  {
    name: "",
    short_name: "",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
  },
  null,
  2
);

export interface FaviconPreview {
  size: number;
  filename: string;
  purpose: string;
  blob: Blob;
}

export interface FaviconResult {
  zipBlob: Blob;
  icons: FaviconPreview[];
  /** Set when the source wasn't square — icons were letterboxed, not stretched. */
  warning: string | null;
}

export async function generateFavicons(
  file: File,
  backgroundColor: string | null,
  onProgress?: (step: string, pct: number) => void
): Promise<FaviconResult> {
  onProgress?.("Reading image…", 5);

  const image = await loadDrawableImage(file);

  try {
    const { width, height } = image;
    const isSquare = Math.abs(width - height) <= 1;

    // Fit-inside rather than stretch: an icon of a squashed logo looks broken
    // in a way a centred one does not. These are fractions of the icon side,
    // multiplied up per size below.
    const longest = Math.max(width, height);
    const drawW = width / longest;
    const drawH = height / longest;

    const icons: FaviconPreview[] = [];

    for (let i = 0; i < ICON_SPECS.length; i++) {
      const spec = ICON_SPECS[i];
      onProgress?.(`Rendering ${spec.size}×${spec.size}…`, 5 + Math.round((i / ICON_SPECS.length) * 55));

      const surface = createSurface(spec.size, spec.size);

      if (backgroundColor) {
        surface.ctx.fillStyle = backgroundColor;
        surface.ctx.fillRect(0, 0, spec.size, spec.size);
      }

      const targetW = drawW * spec.size;
      const targetH = drawH * spec.size;
      surface.ctx.imageSmoothingEnabled = true;
      surface.ctx.imageSmoothingQuality = "high";
      surface.ctx.drawImage(
        image.source,
        (spec.size - targetW) / 2,
        (spec.size - targetH) / 2,
        targetW,
        targetH
      );

      const blob = await surface.toBlob("image/png");
      icons.push({ size: spec.size, filename: spec.filename, purpose: spec.purpose, blob });
    }

    onProgress?.("Bundling…", 65);

    const entries: ZipEntry[] = icons.map((icon) => ({
      filename: icon.filename,
      blob: icon.blob,
    }));
    entries.push({
      filename: "site.webmanifest",
      blob: new Blob([WEBMANIFEST], { type: "application/manifest+json" }),
    });
    entries.push({
      filename: "README.txt",
      blob: new Blob(
        [
          "Drop every file except this one into your site's public/ root, then\n" +
            "paste the following into <head>:\n\n" +
            HTML_SNIPPET +
            "\n\nFill in the name and short_name fields in site.webmanifest.\n",
        ],
        { type: "text/plain" }
      ),
    });

    const zipBlob = await createZip(entries, (step, pct) =>
      onProgress?.(step, 65 + Math.round(pct * 0.35))
    );

    onProgress?.("Done", 100);

    return {
      zipBlob,
      icons,
      warning: isSquare
        ? null
        : `Your source is ${width}×${height}, not square. Each icon was centred inside a ` +
          `square canvas rather than stretched. For the sharpest result, start from a ` +
          `square image at least 512px on a side.`,
    };
  } finally {
    image.release();
  }
}
