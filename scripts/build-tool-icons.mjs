// Generate tool-icons.tsx from Font Awesome Free SVGs.
//
// FA ships each icon as an SVG file with its own viewBox and a single path, so
// the generator reads them straight out of node_modules — nothing is fetched,
// and the licence (CC BY 4.0) permits redistributing the path data with
// attribution, which the generated file carries.
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const FA = fileURLToPath(
  new URL("../node_modules/@fortawesome/fontawesome-free/svgs/", import.meta.url)
);

/** category/slug → Font Awesome Free icon name (solid unless noted). */
const MAP = {
  // ─── Audio ───
  "audio/video-to-mp3": "file-audio",
  "audio/audio-cutter": "scissors",
  "audio/converter": "right-left",
  "audio/merge": "layer-group",
  "audio/volume": "volume-high",
  "audio/speed": "gauge-high",
  "audio/reverse": "backward",
  "audio/silence-remover": "volume-off",
  "audio/normalize": "wave-square",
  "audio/pitch": "music",

  // ─── Image ───
  "image/compressor": "compress",
  "image/resizer": "up-right-and-down-left-from-center",
  "image/converter": "right-left",
  "image/cropper": "crop-simple",
  "image/rotate": "rotate",
  "image/favicon": "star",
  "image/color-picker": "eye-dropper",
  "image/watermark": "stamp",
  "image/metadata": "location-crosshairs",
  "image/filters": "sliders",
  "image/collage": "table-cells",
  "image/split": "border-all",
  "image/circle-crop": "circle-dot",
  "image/png-to-ico": "icons",

  // ─── PDF ───
  "pdf/merge-pdf": "layer-group",
  "pdf/split-pdf": "scissors",
  "pdf/compress-pdf": "file-zipper",
  "pdf/rotate-pdf": "rotate",
  "pdf/organize-pdf": "table-cells-large",
  "pdf/page-numbers": "list-ol",
  "pdf/watermark-pdf": "stamp",
  "pdf/images-to-pdf": "images",
  "pdf/pdf-to-images": "file-image",
  "pdf/sign-pdf": "signature",
  "pdf/crop-pdf": "crop-simple",
  "pdf/extract-pages": "file-export",
  "pdf/remove-pages": "file-circle-minus",
  "pdf/word-to-pdf": "file-word",
  "pdf/pdf-to-word": "file-pen",
  "pdf/txt-to-pdf": "file-lines",
  "pdf/rtf-to-pdf": "file-contract",
  "pdf/html-to-pdf": "file-code",
  "pdf/odt-to-pdf": "file-invoice",
  "pdf/epub-to-pdf": "book-open",
  "pdf/excel-to-pdf": "file-excel",
  "pdf/pdf-to-excel": "table",
  "pdf/ppt-to-pdf": "file-powerpoint",
  "pdf/pdf-to-ppt": "display",
  "pdf/hwp-to-pdf": "language",
  "pdf/pdf-to-text": "align-left",
  "pdf/flatten-pdf": "clone",
  "pdf/fill-form": "rectangle-list",
  "pdf/scanner": "camera",
  "pdf/edit-pdf": "pen-to-square",
  "pdf/annotate-pdf": "highlighter",
  "pdf/redact-pdf": "eye-slash",
  "pdf/pdf-to-jpg": "panorama",
  "pdf/pdf-to-png": "image",
  "pdf/pdf-to-csv": "file-csv",
  "pdf/csv-to-pdf": "table-list",
  "pdf/csv-to-excel": "table-columns",
  "pdf/markdown-to-pdf": "hashtag",
  "pdf/pdf-metadata": "tags",
  "pdf/reverse-pdf": "arrow-down-up-across-line",
  "pdf/n-up-pdf": "grip",
  "pdf/resize-pdf": "maximize",
  "pdf/unzip": "box-open",

  // ─── Video ───
  "video/trimmer": "film",
  "video/mute": "volume-xmark",
  "video/to-gif": "photo-film",
  "video/converter": "right-left",
  "video/compress": "compress",
  "video/merge": "layer-group",
  "video/speed": "gauge-high",
  "video/extract-frames": "images",
  "video/crop": "crop",
  "video/rotate": "arrows-rotate",
  "video/watermark": "certificate",
};

const FALLBACK = "file";

function read(name) {
  for (const style of ["solid", "regular", "brands"]) {
    const path = `${FA}${style}/${name}.svg`;
    if (existsSync(path)) {
      const svg = readFileSync(path, "utf8");
      const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
      // FA solid icons are a single path; join defensively if ever more.
      const d = [...svg.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
      if (viewBox && d.length) return { style, viewBox, d: d.join(" ") };
    }
  }
  return null;
}

const missing = [];
const entries = [];

for (const [key, name] of Object.entries(MAP)) {
  const icon = read(name);
  if (!icon) {
    missing.push(`${key} → ${name}`);
    continue;
  }
  entries.push({ key, name, ...icon });
}

const fallback = read(FALLBACK);

if (missing.length) {
  console.log("MISSING (not in Font Awesome Free):");
  for (const m of missing) console.log("  " + m);
  process.exit(1);
}

// Two tools in the same category must never share a glyph: they sit next to
// each other in the nav and the category page, where only colour separates
// them — and within a category the colour is identical. Sharing *across*
// categories is fine and deliberate (every "converter" is right-left).
const collisions = [];
for (const category of ["audio", "image", "pdf", "video"]) {
  const seen = new Map();
  for (const e of entries.filter((x) => x.key.startsWith(`${category}/`))) {
    if (seen.has(e.name)) collisions.push(`${category}: ${seen.get(e.name)} and ${e.key} both use "${e.name}"`);
    else seen.set(e.name, e.key);
  }
}

if (collisions.length) {
  console.log("DUPLICATE GLYPHS WITHIN A CATEGORY:");
  for (const c of collisions) console.log("  " + c);
  process.exit(1);
}

const groups = { audio: [], image: [], pdf: [], video: [] };
for (const e of entries) groups[e.key.split("/")[0]].push(e);

const section = (label, list) =>
  `  // ─── ${label} ───\n` +
  list
    .map(
      (e) =>
        `  "${e.key}": { name: "${e.name}", viewBox: "${e.viewBox}", d: "${e.d}" },`
    )
    .join("\n");

const file = `/**
 * Tool artwork, keyed by "category/slug".
 *
 * The glyphs are Font Awesome Free 7 (${entries.length} icons), read out of the npm
 * package by \`scripts/build-tool-icons.mjs\` and inlined here as path data.
 * Inlined rather than linked because the site must never make a third-party
 * request, and generated rather than hand-copied so re-running the script picks
 * up upstream fixes.
 *
 * Font Awesome Free icons are licensed CC BY 4.0:
 * https://fontawesome.com/license/free — attribution lives in the site footer.
 *
 * Keyed by "category/slug" rather than slug alone: four categories have a tool
 * called "converter" and three have "merge", so a bare-slug map would hand them
 * all the same picture. Sharing a glyph across categories is deliberate where
 * the action is the same — the per-category colour distinguishes them.
 *
 * Each entry carries its own viewBox: Font Awesome sizes icons to their natural
 * width (384, 512, 576, 640…), and forcing one box would squash half of them.
 *
 * DO NOT EDIT BY HAND — run \`node scripts/build-tool-icons.mjs\`.
 */

interface IconDef {
  /** Font Awesome icon name, kept so the mapping is greppable. */
  name: string;
  viewBox: string;
  d: string;
}

const ICONS: Record<string, IconDef> = {
${section("Audio", groups.audio)}

${section("Image", groups.image)}

${section("PDF", groups.pdf)}

${section("Video", groups.video)}
};

/** Shown when a tool has no mapping yet, so a new slug degrades gracefully. */
const FALLBACK_ICON: IconDef = {
  name: "${FALLBACK}",
  viewBox: "${fallback.viewBox}",
  d: "${fallback.d}",
};

export function toolIconId(category: string, slug: string): string {
  return \`\${category}/\${slug}\`;
}

export function ToolIcon({
  category,
  slug,
  size = 22,
  className,
}: {
  category: string;
  slug: string;
  size?: number;
  className?: string;
}) {
  const icon = ICONS[toolIconId(category, slug)] ?? FALLBACK_ICON;

  return (
    <svg
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={icon.d} />
    </svg>
  );
}
`;

writeFileSync(new URL("../src/lib/tool-icons.tsx", import.meta.url), file, "utf8");
console.log(`wrote ${entries.length} icons`);
console.log("distinct glyphs:", new Set(entries.map((e) => e.name)).size);
