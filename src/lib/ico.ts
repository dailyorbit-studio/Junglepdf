/**
 * PNG → ICO.
 *
 * The favicon generator deliberately emits a set of PNGs and says in its own
 * header that it does not produce a multi-resolution .ico. This is the other
 * half: a real ICO container, which is still what a bare `/favicon.ico`
 * request wants and what older browsers, feed readers and some search crawlers
 * ask for by name.
 *
 * Writing the container by hand is reasonable because there is very little to
 * it. Since Windows Vista an ICO directory entry may point at a whole PNG
 * rather than a BMP bitmap, so the file is a 6-byte header, one 16-byte entry
 * per size, and then the PNG bytes — no palette handling, no AND mask, no
 * bottom-up row order.
 */

import { loadDrawableImage, createSurface } from "./canvas-utils";

/** The sizes Windows and browsers actually pull out of an .ico. */
export const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256] as const;
export type IcoSize = (typeof ICO_SIZES)[number];

export const DEFAULT_ICO_SIZES: IcoSize[] = [16, 32, 48];

export interface IcoResult {
  blob: Blob;
  filename: string;
  sizes: number[];
  /** Bytes, for the "one file, this big" line in the UI. */
  byteLength: number;
  notice: string | null;
}

/**
 * Build the container around already-encoded PNGs.
 *
 * Exported separately from the file-handling half so it can be unit-tested
 * against a known set of buffers without a DOM.
 */
export function packIco(images: { size: number; png: Uint8Array<ArrayBuffer> }[]): Blob {
  if (images.length === 0) {
    throw new Error("No icon sizes were selected.");
  }

  const header = new Uint8Array(6);
  const headerView = new DataView(header.buffer);
  headerView.setUint16(0, 0, true); // reserved, must be 0
  headerView.setUint16(2, 1, true); // 1 = icon (2 would be a cursor)
  headerView.setUint16(4, images.length, true);

  let offset = 6 + 16 * images.length;
  const entries: Uint8Array<ArrayBuffer>[] = [];

  for (const { size, png } of images) {
    const entry = new Uint8Array(16);
    const view = new DataView(entry.buffer);
    // 256 is stored as 0 — the field is one byte, so 256 does not fit.
    view.setUint8(0, size >= 256 ? 0 : size);
    view.setUint8(1, size >= 256 ? 0 : size);
    view.setUint8(2, 0); // palette entries; 0 for truecolour
    view.setUint8(3, 0); // reserved
    view.setUint16(4, 1, true); // colour planes
    view.setUint16(6, 32, true); // bits per pixel
    view.setUint32(8, png.length, true);
    view.setUint32(12, offset, true);
    offset += png.length;
    entries.push(entry);
  }

  const parts: BlobPart[] = [header, ...entries, ...images.map((i) => i.png)];
  return new Blob(parts, { type: "image/x-icon" });
}

/**
 * Rasterise a source image at each requested size and pack the result.
 *
 * The source is drawn into a square canvas of each size. Non-square input is
 * centre-cropped rather than squashed: an icon is displayed square everywhere,
 * so a stretched logo would be wrong in every context it appears in.
 */
export async function pngToIco(
  file: File,
  sizes: IcoSize[] = DEFAULT_ICO_SIZES,
  onProgress?: (step: string, pct: number) => void
): Promise<IcoResult> {
  const requested = [...new Set(sizes)].sort((a, b) => a - b);

  if (requested.length === 0) {
    throw new Error("Pick at least one icon size.");
  }

  onProgress?.("Decoding image…", 10);

  const image = await loadDrawableImage(file);

  try {
    const square = Math.min(image.width, image.height);
    const images: { size: number; png: Uint8Array<ArrayBuffer> }[] = [];

    for (let i = 0; i < requested.length; i++) {
      const size = requested[i];
      const surface = createSurface(size, size);

      surface.ctx.drawImage(
        image.source,
        (image.width - square) / 2,
        (image.height - square) / 2,
        square,
        square,
        0,
        0,
        size,
        size
      );

      // PNG only. An ICO may embed JPEG bytes in principle and no Windows
      // shell reliably reads one, so there is nothing to gain by offering it.
      const blob = await surface.toBlob("image/png");
      images.push({ size, png: new Uint8Array(await blob.arrayBuffer()) });

      onProgress?.("Rendering sizes…", 20 + Math.round(((i + 1) / requested.length) * 60));
    }

    onProgress?.("Packing icon…", 90);

    const blob = packIco(images);

    onProgress?.("Done", 100);

    const notes: string[] = [];
    if (image.width !== image.height) {
      notes.push(
        `The source is ${image.width}×${image.height}. Icons are square, so the centre square was used — crop it yourself first if you want a different part of the picture.`
      );
    }
    if (square < Math.max(...requested)) {
      notes.push(
        `The source is only ${square}px across, so the ${Math.max(...requested)}px icon has been scaled up and will look soft.`
      );
    }

    return {
      blob,
      filename: file.name.replace(/\.[^.]+$/, "") + ".ico",
      sizes: requested,
      byteLength: blob.size,
      notice: notes.length > 0 ? notes.join(" ") : null,
    };
  } finally {
    image.release();
  }
}
