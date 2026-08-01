/**
 * Hand-written image encoders — BMP, GIF, TIFF and ICO.
 *
 * Why these exist at all: a browser canvas can only encode three things.
 * `toBlob("image/bmp")` does not fail — it silently hands back a PNG, which is
 * how a converter ends up writing a file called `photo.bmp` that is really a
 * PNG. (`assertEncodedAs` in canvas-utils catches that and refuses, which is
 * why those formats could not simply be listed as options.)
 *
 * Verified in Chrome 148 — canvas and OffscreenCanvas agree:
 *
 *     PNG   YES        BMP   -> image/png
 *     JPEG  YES        GIF   -> image/png
 *     WebP  YES        TIFF  -> image/png
 *                      ICO   -> image/png
 *                      AVIF  -> image/png
 *
 * So everything below writes bytes directly. All four are formats whose
 * baseline form is genuinely simple; none of this needs a WASM encoder, which
 * is the whole reason these four and not, say, AVIF or JPEG XL. Those need
 * libaom or libjxl — multi-megabyte downloads to convert one image, and the
 * FFmpeg core already vendored here is not built with either.
 */

/* ─── Shared ───────────────────────────────────────────────────────────── */

/** Little-endian byte writer. Every format here is LE (TIFF by our choice). */
class ByteWriter {
  private bytes: number[] = [];

  u8(v: number) { this.bytes.push(v & 0xff); return this; }
  u16(v: number) { return this.u8(v).u8(v >> 8); }
  u32(v: number) { return this.u16(v).u16(v >> 16); }
  i32(v: number) { return this.u32(v >>> 0); }
  ascii(s: string) { for (const c of s) this.u8(c.charCodeAt(0)); return this; }
  raw(arr: ArrayLike<number>) { for (let i = 0; i < arr.length; i++) this.u8(arr[i]); return this; }

  get length() { return this.bytes.length; }
  toUint8Array() { return new Uint8Array(this.bytes); }
}

/**
 * Flatten alpha onto white.
 *
 * BMP and GIF here are written without transparency, and TIFF is written as
 * plain RGB. Compositing first is what stops a transparent PNG turning into a
 * black rectangle — the same reason drawWithMatte exists on the canvas path.
 */
function flattenToRGB(data: ImageData): Uint8Array {
  const { width, height } = data;
  const src = data.data;
  const out = new Uint8Array(width * height * 3);

  for (let i = 0, o = 0; i < src.length; i += 4, o += 3) {
    const a = src[i + 3] / 255;
    out[o] = Math.round(src[i] * a + 255 * (1 - a));
    out[o + 1] = Math.round(src[i + 1] * a + 255 * (1 - a));
    out[o + 2] = Math.round(src[i + 2] * a + 255 * (1 - a));
  }
  return out;
}

/* ─── BMP ──────────────────────────────────────────────────────────────── */

/**
 * 24-bit uncompressed BMP.
 *
 * Rows are stored bottom-up and each one is padded to a 4-byte boundary —
 * both are the format, not a choice. Channel order is BGR.
 */
export function encodeBMP(data: ImageData): Blob {
  const { width, height } = data;
  const rgb = flattenToRGB(data);

  const rowStride = width * 3;
  const padding = (4 - (rowStride % 4)) % 4;
  const pixelBytes = (rowStride + padding) * height;
  const offset = 14 + 40;

  const w = new ByteWriter();

  // BITMAPFILEHEADER
  w.ascii("BM").u32(offset + pixelBytes).u16(0).u16(0).u32(offset);

  // BITMAPINFOHEADER
  w.u32(40)
    .i32(width)
    .i32(height)
    .u16(1)          // colour planes
    .u16(24)         // bits per pixel
    .u32(0)          // BI_RGB — no compression
    .u32(pixelBytes)
    .i32(2835)       // ~72 DPI, in pixels per metre
    .i32(2835)
    .u32(0)
    .u32(0);

  for (let y = height - 1; y >= 0; y--) {
    const row = y * rowStride;
    for (let x = 0; x < width; x++) {
      const p = row + x * 3;
      w.u8(rgb[p + 2]).u8(rgb[p + 1]).u8(rgb[p]);
    }
    for (let i = 0; i < padding; i++) w.u8(0);
  }

  return new Blob([w.toUint8Array()], { type: "image/bmp" });
}

/* ─── TIFF ─────────────────────────────────────────────────────────────── */

/**
 * Baseline uncompressed RGB TIFF, little-endian ("II").
 *
 * Layout is header → pixel data → IFD. Putting the image first means the strip
 * offset is known before the directory that has to point at it gets written.
 * Tag numbers must appear in ascending order; readers are entitled to binary
 * search the directory and some do.
 */
export function encodeTIFF(data: ImageData): Blob {
  const { width, height } = data;
  const rgb = flattenToRGB(data);

  const HEADER = 8;
  const pixelOffset = HEADER;
  const bitsOffset = pixelOffset + rgb.length;   // three shorts, stored out of line
  const ifdOffset = bitsOffset + 6;

  const w = new ByteWriter();
  w.ascii("II").u16(42).u32(ifdOffset);
  w.raw(rgb);
  w.u16(8).u16(8).u16(8);                        // BitsPerSample = 8,8,8

  const SHORT = 3;
  const LONG = 4;

  // A value of four bytes or fewer lives inline in the entry; anything larger
  // is an offset. Only BitsPerSample (6 bytes) exceeds it here.
  const entries: [tag: number, type: number, count: number, value: number][] = [
    [256, LONG, 1, width],        // ImageWidth
    [257, LONG, 1, height],       // ImageLength
    [258, SHORT, 3, bitsOffset],  // BitsPerSample
    [259, SHORT, 1, 1],           // Compression: none
    [262, SHORT, 1, 2],           // PhotometricInterpretation: RGB
    [273, LONG, 1, pixelOffset],  // StripOffsets
    [277, SHORT, 1, 3],           // SamplesPerPixel
    [278, LONG, 1, height],       // RowsPerStrip — one strip for the lot
    [279, LONG, 1, rgb.length],   // StripByteCounts
    [284, SHORT, 1, 1],           // PlanarConfiguration: chunky
  ];

  w.u16(entries.length);
  for (const [tag, type, count, value] of entries) {
    w.u16(tag).u16(type).u32(count);
    // A single SHORT occupies the first two bytes of the four-byte value
    // field, not the last two. Writing it as a u32 lands it in the wrong half
    // on a little-endian file and every reader sees zero.
    if (type === SHORT && count === 1) w.u16(value).u16(0);
    else w.u32(value);
  }
  w.u32(0); // no further IFDs

  return new Blob([w.toUint8Array()], { type: "image/tiff" });
}

/* ─── ICO ──────────────────────────────────────────────────────────────── */

/** ICO stores each dimension in a single byte, where 0 means 256. */
export const ICO_MAX_DIMENSION = 256;

/**
 * ICO wrapping a PNG payload.
 *
 * The format has permitted a whole PNG as the image payload since Vista, which
 * makes the container a 6-byte header plus one 16-byte directory entry — far
 * less work than the alternative (a DIB with its own upside-down AND mask).
 * Same approach as favicon-generator.
 */
export function encodeICO(
  entries: { width: number; height: number; bytes: Uint8Array }[]
): Blob {
  const w = new ByteWriter();

  w.u16(0).u16(1).u16(entries.length);

  let offset = 6 + 16 * entries.length;
  for (const { width, height, bytes } of entries) {
    // Width and height are separate bytes and must be written as such. Writing
    // one value into both — which is tempting when the caller has a single
    // "size" — makes a 120×90 image declare itself 120×120, and viewers trust
    // the directory over the payload, so it renders stretched.
    w.u8(width >= 256 ? 0 : width)
      .u8(height >= 256 ? 0 : height)
      .u8(0)          // palette size — 0 for PNG payloads
      .u8(0)          // reserved
      .u16(1)         // colour planes
      .u16(32)        // bits per pixel
      .u32(bytes.length)
      .u32(offset);
    offset += bytes.length;
  }

  for (const { bytes } of entries) w.raw(bytes);

  return new Blob([w.toUint8Array()], { type: "image/x-icon" });
}

/* ─── GIF ──────────────────────────────────────────────────────────────── */

/**
 * Median-cut colour quantisation down to at most 256 colours.
 *
 * Histogrammed at 5 bits per channel rather than 8. A photograph can hold
 * hundreds of thousands of distinct colours and cutting boxes over that set
 * directly is far slower for a result nobody can tell apart — 32768 buckets is
 * the standard compromise.
 */
function quantize(rgb: Uint8Array, maxColours: number) {
  const histogram = new Uint32Array(32768);
  for (let i = 0; i < rgb.length; i += 3) {
    const key = ((rgb[i] >> 3) << 10) | ((rgb[i + 1] >> 3) << 5) | (rgb[i + 2] >> 3);
    histogram[key]++;
  }

  const occupied: number[] = [];
  for (let i = 0; i < histogram.length; i++) if (histogram[i]) occupied.push(i);

  const unpack = (key: number) => [
    ((key >> 10) & 31) << 3,
    ((key >> 5) & 31) << 3,
    (key & 31) << 3,
  ];

  let boxes: number[][] = [occupied];

  while (boxes.length < maxColours) {
    // Split the box with the widest spread on any one channel. Splitting the
    // box with the most *pixels* instead is the classic mistake: it keeps
    // subdividing a large flat region while a small gradient stays banded.
    let target = -1;
    let bestRange = 0;
    let bestChannel = 0;

    for (let b = 0; b < boxes.length; b++) {
      if (boxes[b].length < 2) continue;
      for (let c = 0; c < 3; c++) {
        let lo = 255;
        let hi = 0;
        for (const key of boxes[b]) {
          const v = unpack(key)[c];
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        }
        if (hi - lo > bestRange) {
          bestRange = hi - lo;
          target = b;
          bestChannel = c;
        }
      }
    }

    if (target === -1) break; // every box is a single colour

    const box = boxes[target];
    box.sort((a, b) => unpack(a)[bestChannel] - unpack(b)[bestChannel]);
    const mid = box.length >> 1;
    boxes = [
      ...boxes.slice(0, target),
      box.slice(0, mid),
      box.slice(mid),
      ...boxes.slice(target + 1),
    ];
  }

  const palette: number[][] = boxes.map((box) => {
    let r = 0, g = 0, b = 0, total = 0;
    for (const key of box) {
      const weight = histogram[key];
      const [cr, cg, cb] = unpack(key);
      r += cr * weight;
      g += cg * weight;
      b += cb * weight;
      total += weight;
    }
    return total === 0 ? [0, 0, 0] : [Math.round(r / total), Math.round(g / total), Math.round(b / total)];
  });

  while (palette.length === 0) palette.push([0, 0, 0]);
  return palette;
}

/**
 * Map every pixel to its nearest palette entry.
 *
 * Cached on the 15-bit reduced colour. Without the cache this is
 * width × height × 256 distance calculations — around 250 million for a phone
 * photo, which locks the tab for seconds. With it, each distinct reduced colour
 * is searched once at most.
 */
function mapToPalette(rgb: Uint8Array, palette: number[][]): Uint8Array {
  const cache = new Int16Array(32768).fill(-1);
  const out = new Uint8Array(rgb.length / 3);

  for (let i = 0, p = 0; i < rgb.length; i += 3, p++) {
    const r = rgb[i], g = rgb[i + 1], b = rgb[i + 2];
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);

    let index = cache[key];
    if (index === -1) {
      let best = 0;
      let bestDistance = Infinity;
      for (let c = 0; c < palette.length; c++) {
        const dr = r - palette[c][0];
        const dg = g - palette[c][1];
        const db = b - palette[c][2];
        const d = dr * dr + dg * dg + db * db;
        if (d < bestDistance) {
          bestDistance = d;
          best = c;
        }
      }
      index = best;
      cache[key] = index;
    }
    out[p] = index;
  }
  return out;
}

/**
 * GIF's LZW variant.
 *
 * Differs from plain LZW in three ways that all matter: a Clear code and an
 * End-of-Information code sit immediately above the palette, codes are packed
 * least-significant-bit first, and the stream is cut into sub-blocks of at most
 * 255 bytes each behind a length byte. Code width grows as the table fills and
 * resets on Clear once it would pass 12 bits.
 */
function lzwCompress(indices: Uint8Array, minCodeSize: number): number[] {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  let dictionary = new Map<string, number>();

  const output: number[] = [];
  let bitBuffer = 0;
  let bitCount = 0;

  const emit = (code: number) => {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      output.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  };

  emit(clearCode);

  let prefix = String(indices[0]);

  for (let i = 1; i < indices.length; i++) {
    const k = indices[i];
    const candidate = `${prefix},${k}`;

    if (dictionary.has(candidate)) {
      prefix = candidate;
      continue;
    }

    emit(dictionary.get(prefix) ?? Number(prefix));
    dictionary.set(candidate, nextCode++);

    if (nextCode > 1 << codeSize) {
      if (codeSize < 12) {
        codeSize++;
      } else {
        emit(clearCode);
        dictionary = new Map();
        codeSize = minCodeSize + 1;
        nextCode = eoiCode + 1;
      }
    }
    prefix = String(k);
  }

  emit(dictionary.get(prefix) ?? Number(prefix));
  emit(eoiCode);

  if (bitCount > 0) output.push(bitBuffer & 0xff);
  return output;
}

/** GIF87a/89a, single frame, from a quantised palette. */
export function encodeGIF(data: ImageData): Blob {
  const { width, height } = data;
  const rgb = flattenToRGB(data);

  const palette = quantize(rgb, 256);
  const indices = mapToPalette(rgb, palette);

  // The colour table must be a power of two, at least 2 entries.
  let tableBits = 1;
  while (1 << tableBits < palette.length) tableBits++;
  const tableSize = 1 << tableBits;

  const w = new ByteWriter();

  w.ascii("GIF89a");

  // Logical Screen Descriptor. Packed: global table present, 8-bit colour
  // resolution, unsorted, table size exponent in the low three bits.
  w.u16(width).u16(height).u8(0x80 | 0x70 | (tableBits - 1)).u8(0).u8(0);

  for (let i = 0; i < tableSize; i++) {
    const c = palette[i] ?? [0, 0, 0];
    w.u8(c[0]).u8(c[1]).u8(c[2]);
  }

  // Image Descriptor — full frame, no local table, not interlaced.
  w.u8(0x2c).u16(0).u16(0).u16(width).u16(height).u8(0);

  const minCodeSize = Math.max(2, tableBits);
  w.u8(minCodeSize);

  const compressed = lzwCompress(indices, minCodeSize);
  for (let i = 0; i < compressed.length; i += 255) {
    const chunk = compressed.slice(i, i + 255);
    w.u8(chunk.length).raw(chunk);
  }
  w.u8(0);  // block terminator

  w.u8(0x3b); // trailer

  return new Blob([w.toUint8Array()], { type: "image/gif" });
}
