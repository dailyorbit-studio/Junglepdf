// Render the brand mark and the social card from one SVG source.
//
// Written as a script rather than hand-made binaries so the logo lives in one
// place: change LOGO here and every size regenerates consistently. sharp is
// already a dependency (Next pulls it in), so this costs nothing extra.
//
// Run: node scripts/build-brand-assets.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));

// Counted from the registry rather than typed in: this card was still claiming
// 57 tools after twenty-one more had shipped.
const TOOL_COUNT = (
  readFileSync(root + "src/lib/tools.ts", "utf8").match(/^\s+slug: "[a-z0-9-]+",\r?$/gm) ?? []
).length - 4; // the four category slugs use the same shape

// Must track the @theme tokens in src/app/globals.css. When the accent moved
// from teal to jungle green, these did not follow, and the tab icon and social
// card kept shipping the old teal against a green site.
const CANOPY = "#15803D"; // --color-accent
const CANOPY_DARK = "#14652F"; // --color-accent-hover
const CANOPY_PALE = "#DCFCE7"; // --color-accent-subtle
// The leaf sits on the white document, not on the green tile, so it needs to
// be dark enough to read against white — 3.05:1, fine for a solid shape.
const LEAF = "#16A34A"; // --color-leaf
const INK = "#16211A"; // --color-ink
const INK_SOFT = "#4A5A50"; // --color-ink-secondary
const PAPER = "#F7FAF6"; // --color-paper

/**
 * The mark: a document with a folded corner and a leaf growing across it —
 * "jungle" and "PDF" in one shape. Drawn on a 512 grid so every export is a
 * clean integer scale.
 */
const mark = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
  <rect width="512" height="512" rx="112" fill="${CANOPY}"/>
  <path d="M304 96H176a40 40 0 0 0-40 40v240a40 40 0 0 0 40 40h160a40 40 0 0 0 40-40V168z"
        fill="#FFFFFF"/>
  <path d="M304 96l72 72h-52a20 20 0 0 1-20-20z" fill="${CANOPY_PALE}"/>
  <path d="M212 336c0-62 44-112 116-124-6 76-52 118-116 124z" fill="${LEAF}"/>
  <path d="M212 344c14-40 44-72 84-92" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.55"/>
  <rect x="196" y="228" width="76" height="16" rx="8" fill="${CANOPY}" opacity="0.35"/>
  <rect x="196" y="188" width="120" height="16" rx="8" fill="${CANOPY}" opacity="0.35"/>
</svg>`;

/** 1200x630 social card. Text is drawn as SVG text — no font file needed
 *  because sharp rasterises with the system font stack. */
const ogCard = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <circle cx="1080" cy="80" r="220" fill="${CANOPY_PALE}" opacity="0.55"/>
  <circle cx="120" cy="580" r="180" fill="${CANOPY_PALE}" opacity="0.4"/>

  <g transform="translate(96 150) scale(0.32)">
    <rect width="512" height="512" rx="112" fill="${CANOPY}"/>
    <path d="M304 96H176a40 40 0 0 0-40 40v240a40 40 0 0 0 40 40h160a40 40 0 0 0 40-40V168z" fill="#FFFFFF"/>
    <path d="M304 96l72 72h-52a20 20 0 0 1-20-20z" fill="${CANOPY_PALE}"/>
    <path d="M212 336c0-62 44-112 116-124-6 76-52 118-116 124z" fill="${LEAF}"/>
    <rect x="196" y="228" width="76" height="16" rx="8" fill="${CANOPY}" opacity="0.35"/>
    <rect x="196" y="188" width="120" height="16" rx="8" fill="${CANOPY}" opacity="0.35"/>
  </g>

  <text x="272" y="232" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="64" font-weight="700" fill="${INK}">JunglePDF</text>

  <text x="96" y="366" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="58" font-weight="700" fill="${INK}">Free PDF, image, audio and video</text>
  <text x="96" y="440" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="58" font-weight="700" fill="${CANOPY_DARK}">tools that run in your browser</text>

  <text x="96" y="524" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="34" fill="${INK_SOFT}">${TOOL_COUNT} tools · nothing is ever uploaded · no sign-up</text>

  <rect x="96" y="562" width="180" height="8" rx="4" fill="${CANOPY}"/>
</svg>`;

const outputs = [
  ["public/og-image.png", ogCard, null],
  ["src/app/apple-icon.png", mark(180), 180],
  ["src/app/icon.png", mark(512), 512],
];

for (const [file, svg, size] of outputs) {
  const buf = await sharp(Buffer.from(svg))
    .resize(size ?? undefined)
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(root + file, buf);
  const meta = await sharp(buf).metadata();
  console.log(`${file}  ${meta.width}x${meta.height}  ${(buf.length / 1024).toFixed(1)}KB`);
}

// The SVG icon ships as-is too: it is what a modern browser prefers for the
// tab, and it stays sharp on a hidpi display at any size.
writeFileSync(root + "src/app/icon.svg", mark(512).trim() + "\n");
console.log("src/app/icon.svg");

/**
 * favicon.ico, hand-assembled.
 *
 * sharp cannot write ICO, but the format has allowed a whole PNG as the image
 * payload since Vista, so the container is a 6-byte header plus one 16-byte
 * directory entry per size. Worth keeping: search engines, RSS readers and
 * older browsers still ask for /favicon.ico by name, and the alternative was
 * shipping the Next.js default logo as this site's icon.
 */
const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(
  icoSizes.map((s) => sharp(Buffer.from(mark(s))).resize(s, s).png({ compressionLevel: 9 }).toBuffer())
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(icoSizes.length, 4);

let offset = 6 + 16 * icoSizes.length;
const entries = icoSizes.map((size, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(size >= 256 ? 0 : size, 0);
  e.writeUInt8(size >= 256 ? 0 : size, 1);
  e.writeUInt8(0, 2); // palette size
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(icoImages[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += icoImages[i].length;
  return e;
});

const ico = Buffer.concat([header, ...entries, ...icoImages]);
writeFileSync(root + "src/app/favicon.ico", ico);
console.log(`src/app/favicon.ico  ${icoSizes.join("/")}px  ${(ico.length / 1024).toFixed(1)}KB`);
