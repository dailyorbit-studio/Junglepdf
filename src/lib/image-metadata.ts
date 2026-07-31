/**
 * Image metadata — EXIF reading and removal
 *
 * Two halves that belong together. Showing people what their photos carry is
 * the part that makes the tool worth using: "strip metadata" is an abstraction
 * nobody acts on, while "this photo says it was taken at 51.5074, -0.1278 on a
 * named phone" is a fact they respond to immediately.
 *
 * Removal works by re-encoding through a canvas. The canvas holds pixels and
 * nothing else, so every EXIF, IPTC and XMP block is gone by construction
 * rather than by a list of tags we remembered to delete. The cost is a
 * generational re-encode, which the UI is upfront about.
 *
 * A deliberate consequence: orientation. EXIF can say "this image is rotated",
 * and browsers honour that when displaying. Once the tag is gone, an image
 * that relied on it would display sideways — so the rotation is baked into the
 * pixels before the tag is dropped.
 */

import { loadDrawableImage, createSurface, assertEncodedAs } from "./canvas-utils";
import type { ProgressFn } from "./ffmpeg";

export interface MetadataField {
  label: string;
  value: string;
  /** Fields that identify a person, a place or a device. */
  sensitive?: boolean;
}

export interface MetadataReport {
  fields: MetadataField[];
  /** Decimal degrees, when the file carries GPS coordinates. */
  gps: { latitude: number; longitude: number } | null;
  /** EXIF orientation, 1–8. 1 means upright. */
  orientation: number;
  /** True when the file had no readable EXIF block at all. */
  empty: boolean;
}

export interface StripResult {
  blob: Blob;
  filename: string;
  originalSize: number;
  outputSize: number;
  /** Fields that were present before stripping. */
  removedCount: number;
}

/* ─── Reading ──────────────────────────────────────────────────────────── */

const IFD0_TAGS: Record<number, { label: string; sensitive?: boolean }> = {
  0x010f: { label: "Camera make", sensitive: true },
  0x0110: { label: "Camera model", sensitive: true },
  0x0131: { label: "Software", sensitive: true },
  0x0132: { label: "File modified" },
  0x013b: { label: "Artist", sensitive: true },
  0x8298: { label: "Copyright" },
};

const EXIF_TAGS: Record<number, { label: string; sensitive?: boolean }> = {
  0x829a: { label: "Exposure time" },
  0x829d: { label: "Aperture" },
  0x8827: { label: "ISO" },
  0x9003: { label: "Date taken", sensitive: true },
  0x9004: { label: "Date digitised", sensitive: true },
  0x920a: { label: "Focal length" },
  0xa002: { label: "Width" },
  0xa003: { label: "Height" },
  0xa434: { label: "Lens", sensitive: true },
};

/**
 * Read the EXIF block out of a JPEG.
 *
 * Only JPEG carries EXIF in the APP1 form parsed here. PNG and WebP can hold
 * metadata in their own chunk formats, but a PNG almost never comes off a
 * camera, so the payoff does not justify two more parsers — the strip path
 * still cleans them, it just cannot enumerate what it removed.
 */
export async function readMetadata(file: File): Promise<MetadataReport> {
  const empty: MetadataReport = { fields: [], gps: null, orientation: 1, empty: true };

  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);

  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return empty;

  const app1 = findApp1(view);
  if (app1 === null) return empty;

  // "Exif\0\0" then a TIFF header whose byte order applies to everything after.
  const tiffStart = app1 + 6;
  if (tiffStart + 8 > view.byteLength) return empty;

  const byteOrder = view.getUint16(tiffStart);
  if (byteOrder !== 0x4949 && byteOrder !== 0x4d4d) return empty;
  const little = byteOrder === 0x4949;

  const fields: MetadataField[] = [];
  let orientation = 1;
  let gps: MetadataReport["gps"] = null;

  try {
    const ifd0Offset = view.getUint32(tiffStart + 4, little);
    const ifd0 = readIFD(view, tiffStart, tiffStart + ifd0Offset, little);

    for (const entry of ifd0) {
      if (entry.tag === 0x0112) {
        const value = Number(readValue(view, tiffStart, entry, little));
        if (value >= 1 && value <= 8) orientation = value;
        continue;
      }
      const spec = IFD0_TAGS[entry.tag];
      if (spec) {
        const value = formatValue(readValue(view, tiffStart, entry, little));
        if (value) fields.push({ label: spec.label, value, sensitive: spec.sensitive });
      }
    }

    const exifPointer = ifd0.find((e) => e.tag === 0x8769);
    if (exifPointer) {
      const offset = Number(readValue(view, tiffStart, exifPointer, little));
      for (const entry of readIFD(view, tiffStart, tiffStart + offset, little)) {
        const spec = EXIF_TAGS[entry.tag];
        if (!spec) continue;
        const value = formatValue(readValue(view, tiffStart, entry, little));
        if (value) fields.push({ label: spec.label, value, sensitive: spec.sensitive });
      }
    }

    const gpsPointer = ifd0.find((e) => e.tag === 0x8825);
    if (gpsPointer) {
      const offset = Number(readValue(view, tiffStart, gpsPointer, little));
      gps = readGPS(view, tiffStart, tiffStart + offset, little);
      if (gps) {
        fields.unshift({
          label: "GPS location",
          value: `${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}`,
          sensitive: true,
        });
      }
    }
  } catch {
    // A malformed EXIF block is common in files that have been through several
    // editors. Report what was parsed before the corruption rather than
    // failing the whole read.
  }

  return { fields, gps, orientation, empty: fields.length === 0 && orientation === 1 };
}

interface IFDEntry {
  tag: number;
  type: number;
  count: number;
  valueOffset: number;
}

/** Walk JPEG segment headers looking for APP1/Exif. */
function findApp1(view: DataView): number | null {
  let offset = 2;

  while (offset + 4 <= view.byteLength) {
    if (view.getUint8(offset) !== 0xff) return null;

    const marker = view.getUint8(offset + 1);
    // SOS — image data starts here and there are no more metadata segments.
    if (marker === 0xda) return null;

    const length = view.getUint16(offset + 2);
    if (length < 2) return null;

    if (
      marker === 0xe1 &&
      offset + 10 <= view.byteLength &&
      view.getUint32(offset + 4) === 0x45786966 // "Exif"
    ) {
      return offset + 4;
    }

    offset += 2 + length;
  }

  return null;
}

function readIFD(
  view: DataView,
  tiffStart: number,
  ifdOffset: number,
  little: boolean
): IFDEntry[] {
  if (ifdOffset + 2 > view.byteLength) return [];

  const count = view.getUint16(ifdOffset, little);
  const entries: IFDEntry[] = [];

  for (let i = 0; i < count; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) break;

    entries.push({
      tag: view.getUint16(entryOffset, little),
      type: view.getUint16(entryOffset + 2, little),
      count: view.getUint32(entryOffset + 4, little),
      valueOffset: entryOffset + 8,
    });
  }

  return entries;
}

/** Bytes each TIFF type occupies. */
const TYPE_SIZE: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };

function readValue(
  view: DataView,
  tiffStart: number,
  entry: IFDEntry,
  little: boolean
): string | number | number[] {
  const size = TYPE_SIZE[entry.type] ?? 1;
  const totalBytes = size * entry.count;

  // Values of four bytes or fewer are stored inline in the offset field
  // itself; anything larger is a pointer relative to the TIFF header.
  const dataStart =
    totalBytes <= 4 ? entry.valueOffset : tiffStart + view.getUint32(entry.valueOffset, little);

  if (dataStart < 0 || dataStart + totalBytes > view.byteLength) return "";

  switch (entry.type) {
    case 2: {
      let str = "";
      for (let i = 0; i < entry.count; i++) {
        const code = view.getUint8(dataStart + i);
        if (code === 0) break; // NUL-terminated
        str += String.fromCharCode(code);
      }
      return str.trim();
    }
    case 3:
      return view.getUint16(dataStart, little);
    case 4:
      return view.getUint32(dataStart, little);
    case 5:
    case 10: {
      const values: number[] = [];
      for (let i = 0; i < entry.count; i++) {
        const at = dataStart + i * 8;
        const numerator =
          entry.type === 5 ? view.getUint32(at, little) : view.getInt32(at, little);
        const denominator =
          entry.type === 5 ? view.getUint32(at + 4, little) : view.getInt32(at + 4, little);
        values.push(denominator === 0 ? 0 : numerator / denominator);
      }
      return values.length === 1 ? values[0] : values;
    }
    default:
      return view.getUint8(dataStart);
  }
}

function formatValue(value: string | number | number[]): string {
  if (Array.isArray(value)) return value.map((v) => round(v)).join(", ");
  if (typeof value === "number") return round(value);
  return value;
}

function round(value: number): string {
  if (Number.isInteger(value)) return String(value);
  // Shutter speeds come through as 0.008 — "1/125" is what a photographer reads.
  if (value > 0 && value < 0.5) return `1/${Math.round(1 / value)}`;
  return value.toFixed(2);
}

function readGPS(
  view: DataView,
  tiffStart: number,
  ifdOffset: number,
  little: boolean
): { latitude: number; longitude: number } | null {
  const entries = readIFD(view, tiffStart, ifdOffset, little);

  const get = (tag: number) => entries.find((e) => e.tag === tag);

  const latRef = get(0x0001);
  const lat = get(0x0002);
  const lonRef = get(0x0003);
  const lon = get(0x0004);

  if (!lat || !lon) return null;

  const latValues = readValue(view, tiffStart, lat, little);
  const lonValues = readValue(view, tiffStart, lon, little);

  if (!Array.isArray(latValues) || !Array.isArray(lonValues)) return null;
  if (latValues.length < 3 || lonValues.length < 3) return null;

  // Stored as degrees/minutes/seconds, with a separate hemisphere character.
  const toDecimal = ([d, m, s]: number[]) => d + m / 60 + s / 3600;

  let latitude = toDecimal(latValues);
  let longitude = toDecimal(lonValues);

  if (latRef && String(readValue(view, tiffStart, latRef, little)).toUpperCase() === "S") {
    latitude = -latitude;
  }
  if (lonRef && String(readValue(view, tiffStart, lonRef, little)).toUpperCase() === "W") {
    longitude = -longitude;
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

  return { latitude, longitude };
}

/* ─── Removal ──────────────────────────────────────────────────────────── */

/**
 * Re-encode an image so it carries pixels and nothing else.
 *
 * Orientation is applied to the pixels first — see the module note. Without
 * that step, stripping the tag from a portrait phone photo turns it sideways.
 */
export async function stripMetadata(
  file: File,
  outputFormat: string,
  quality: number,
  report: MetadataReport,
  onProgress?: ProgressFn
): Promise<StripResult> {
  onProgress?.("Reading image…", 20);

  const image = await loadDrawableImage(file);

  try {
    const swapsAxes = report.orientation >= 5 && report.orientation <= 8;
    const width = swapsAxes ? image.height : image.width;
    const height = swapsAxes ? image.width : image.height;

    onProgress?.("Re-encoding without metadata…", 55);

    const surface = createSurface(width, height);
    const ctx = surface.ctx;

    // JPEG has no alpha, so anything unpainted would encode black.
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    applyOrientation(ctx, report.orientation, image.width, image.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image.source, 0, 0);
    ctx.restore();

    const blob = await surface.toBlob(outputFormat, quality);
    assertEncodedAs(blob, outputFormat);

    onProgress?.("Done", 100);

    const ext = outputFormat.split("/")[1].replace("jpeg", "jpg");

    return {
      blob,
      filename: file.name.replace(/\.[^.]+$/, "") + `_clean.${ext}`,
      originalSize: file.size,
      outputSize: blob.size,
      removedCount: report.fields.length,
    };
  } finally {
    image.release();
  }
}

/** The eight EXIF orientations, as canvas transforms. */
function applyOrientation(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  orientation: number,
  width: number,
  height: number
): void {
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0);
      break;
    case 7:
      ctx.transform(0, -1, -1, 0, height, width);
      break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width);
      break;
    default:
      break; // 1, or anything unrecognised — already upright.
  }
}
