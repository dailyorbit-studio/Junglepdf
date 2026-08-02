/**
 * The JunglePDF mark: a document with a folded corner and a leaf across it.
 *
 * One component so the header, the footer, the favicon and the social card all
 * show the same logo — the header and footer each used to inline their own
 * copy of a generic file glyph, which is how the tab icon and the wordmark
 * ended up being two different pictures.
 *
 * The raster versions (favicon.ico, icon.png, apple-icon.png, card.png)
 * come from the same path data via `scripts/build-brand-assets.mjs`; keep the
 * two in step when changing the shape.
 */
/**
 * The wordmark: "Jungle" in the accent green, "PDF" in whatever colour the
 * caller sets. Same green the hero uses on "running in your browser".
 *
 * A component rather than the two spans inlined at each call site, because
 * there are two call sites — the header and the footer — and a wordmark that
 * disagrees with itself across a page is worse than one that is plain
 * everywhere. Callers pass their own size, colour and hover timing; the accent
 * on "Jungle" is fixed here so it cannot drift.
 *
 * Deliberately not sliced out of SITE_NAME. That constant gets interpolated
 * into page titles and sentences, where a coloured fragment makes no sense —
 * and deriving one from the other would mean a future rename silently
 * recolouring half a word. It still reads, copies and is announced as a single
 * "JunglePDF".
 */
export function BrandWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-accent">Jungle</span>PDF
    </span>
  );
}

export default function BrandMark({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="96 96 320 320"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M304 96H176a40 40 0 0 0-40 40v240a40 40 0 0 0 40 40h160a40 40 0 0 0 40-40V168z"
        fill="currentColor"
      />
      <path d="M304 96l72 72h-52a20 20 0 0 1-20-20z" fill="currentColor" opacity="0.55" />
      <path
        d="M212 336c0-62 44-112 116-124-6 76-52 118-116 124z"
        fill="var(--color-leaf)"
      />
    </svg>
  );
}
