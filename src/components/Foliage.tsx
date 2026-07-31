/**
 * The jungle motif: one leaf shape, three arrangements.
 *
 * Inline SVG rather than image assets, for the same reasons as the brand mark
 * — no third-party request, no second file per size, and the colours come from
 * the theme tokens so a palette change carries through.
 *
 * All three are decorative: `aria-hidden` and `pointer-events-none`, so they
 * never sit between a reader and a control. The backdrop and the band are
 * absolutely positioned and expect a `relative` parent.
 *
 * Two rules the first version broke, both of which made the motif read as
 * smudges rather than as foliage:
 *
 * 1. **Nothing overlaps running text.** A 205px leaf sat behind the opening
 *    words of the h1. Even at 9% that is texture under text, which is the one
 *    place a background must stay flat.
 * 2. **Faint means invisible, not subtle.** 8–10% green over the paper token
 *    lands at rgb(227,242,231) — a delta of 20/8/15, below what most screens
 *    at typical brightness resolve. The shapes now sit where they can afford
 *    to be seen, so they can be light without being nothing.
 */

/** The shared outline — a leaf with a midrib, on a 24 grid. */
function LeafShape({ midrib = true }: { midrib?: boolean }) {
  return (
    <>
      <path
        d="M21 3c0 9.4-6.3 15.5-14 15.5a8 8 0 0 1-3.3-.7C3.2 9.4 9.8 3 21 3z"
        fill="currentColor"
      />
      {/*
        The midrib is drawn in the surface colour, so it only reads on a leaf
        solid enough to carry it. On the washed-out backdrop leaves it added
        noise and no shape, which is why they opt out.
      */}
      {midrib && (
        <path
          d="M21 3C14.4 5.9 9.4 10.8 6.4 18"
          stroke="var(--color-surface)"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
      )}
    </>
  );
}

/**
 * A single leaf, coloured by the surrounding `text-*` class. Used beside the
 * category headings.
 */
export function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" focusable="false">
      <LeafShape />
    </svg>
  );
}

/**
 * The hero canopy.
 *
 * A soft green wash across the top, plus a frond cluster in the top-right
 * corner — the one part of the hero with no text in it, because the artwork
 * column lives there and the artwork is multiplied over the background. The
 * cluster only appears from `lg`, since below that the copy spans the full
 * width and there is no empty corner to grow into.
 */
export function CanopyBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/*
        The wash carries the theme on its own at every width — it is what makes
        the hero read as green rather than as grey paper with leaves on it.
        Anchored top-right so it strengthens the same corner the cluster fills.
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 90% at 88% -10%, var(--color-accent-subtle) 0%, transparent 62%)",
        }}
      />

      {/*
        Fanned from a single corner point like a real frond rather than
        scattered at unrelated angles. Sizes and opacities step down as they
        move inward, so the cluster fades toward the text rather than stopping
        at an edge.
      */}
      <div className="hidden lg:block absolute -top-16 -right-16 w-[26rem] h-[26rem]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="absolute inset-0 w-full h-full text-leaf opacity-[0.16] rotate-[35deg]"
        >
          <LeafShape midrib={false} />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="absolute top-16 right-24 w-72 h-72 text-accent opacity-[0.13] rotate-[85deg]"
        >
          <LeafShape midrib={false} />
        </svg>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="absolute top-40 right-2 w-56 h-56 text-leaf opacity-[0.10] rotate-[130deg]"
        >
          <LeafShape midrib={false} />
        </svg>
      </div>

      {/*
        Nothing on the left. There was a leaf tucked into that corner, and a
        rotated shape's bounding box is much larger than its width — a 224px
        leaf at 205° measured 298px and reached back under the headline. The
        left half of the hero holds the h1, the paragraph and the search box at
        every breakpoint, so it is simply not a place for texture.
      */}
    </div>
  );
}

/**
 * A row of leaves growing up out of the footer's top edge.
 *
 * `bottom-full` on a `relative` footer puts them just above the border rather
 * than inside the padding, so they read as growth against the page. All one
 * colour and one opacity: at this size the alternating tints of the first
 * version just looked like inconsistency.
 */
export function UndergrowthBand() {
  const leaves = [
    { left: "6%", size: "h-5 w-5", rotate: "-rotate-[14deg]" },
    { left: "23%", size: "h-4 w-4", rotate: "rotate-[10deg]" },
    { left: "47%", size: "h-6 w-6", rotate: "-rotate-[22deg]" },
    { left: "71%", size: "h-4 w-4", rotate: "rotate-[18deg]" },
    { left: "90%", size: "h-5 w-5", rotate: "-rotate-[8deg]" },
  ];

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-full h-6 overflow-hidden select-none"
      aria-hidden="true"
    >
      {leaves.map((leaf) => (
        <svg
          key={leaf.left}
          viewBox="0 0 24 24"
          fill="none"
          style={{ left: leaf.left }}
          className={`absolute bottom-0 ${leaf.size} ${leaf.rotate} text-leaf opacity-30`}
        >
          <LeafShape midrib={false} />
        </svg>
      ))}
    </div>
  );
}
