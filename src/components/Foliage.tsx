/**
 * Botanical shapes for the jungle theme.
 *
 * The theme was originally only a palette swap — green tokens on an otherwise
 * neutral layout — which read as "a site that happens to be green" rather than
 * as JunglePDF. These are the actual foliage.
 *
 * Rules they follow, because this is a utility site and not a wallpaper:
 *
 *  - Decoration lives in the chrome (hero, footer, section headers) and never
 *    behind a tool's working area. Nothing here sits under a form control.
 *  - Every instance is `aria-hidden` and `pointer-events-none`. A screen
 *    reader announcing "leaf, leaf, leaf" before the search box would be worse
 *    than no theme at all.
 *  - Inline SVG, no image requests. The site's whole claim is that it talks to
 *    no one, and the CSP blocks third-party origins anyway.
 *  - Opacity stays low enough that text contrast is unaffected. The ratios
 *    measured for the palette assume a plain surface behind the type.
 */

type ShapeProps = {
  className?: string;
  style?: React.CSSProperties;
};

function Svg({ className, style, children }: ShapeProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Almond leaf with a midrib and side veins. The workhorse shape. */
export function Leaf(props: ShapeProps) {
  return (
    <Svg {...props}>
      <path d="M32 3 C15 17 6 36 32 61 C58 36 49 17 32 3 Z" fill="currentColor" />
      <path
        d="M32 59 V7"
        stroke="#fff"
        strokeWidth="1.6"
        opacity=".45"
        strokeLinecap="round"
      />
      <path
        d="M32 16 C27 19 23 23 21 28 M32 26 C26 29 21 34 19 40 M32 36 C27 39 24 44 23 49
           M32 16 C37 19 41 23 43 28 M32 26 C38 29 43 34 45 40 M32 36 C37 39 40 44 41 49"
        stroke="#fff"
        strokeWidth="1.1"
        opacity=".3"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Split-leaf monstera — the shape most people picture when they read "jungle". */
export function Monstera(props: ShapeProps) {
  return (
    <Svg {...props}>
      <path
        d="M32 4 C43 7 53 16 56 27 L41 31 L55 36 C54 43 50 50 44 55 L38 44 L39 58
           C36 60 34 61 32 59 C30 61 28 60 25 58 L26 44 L20 55 C14 50 10 43 9 36
           L23 31 L8 27 C11 16 21 7 32 4 Z"
        fill="currentColor"
      />
      <path d="M32 57 V9" stroke="#fff" strokeWidth="1.5" opacity=".4" strokeLinecap="round" />
    </Svg>
  );
}

/** Fern frond — elongated leaflets swept up along a curving stem. */
export function Frond(props: ShapeProps) {
  return (
    <Svg {...props}>
      <path
        d="M33 62 C33 46 32 24 30 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g fill="currentColor">
        <ellipse cx="22" cy="52" rx="12" ry="2.6" transform="rotate(-34 22 52)" />
        <ellipse cx="43" cy="53" rx="12" ry="2.6" transform="rotate(34 43 53)" />
        <ellipse cx="22" cy="42" rx="10.5" ry="2.4" transform="rotate(-36 22 42)" />
        <ellipse cx="42" cy="43" rx="10.5" ry="2.4" transform="rotate(36 42 43)" />
        <ellipse cx="22.5" cy="32" rx="9" ry="2.2" transform="rotate(-38 22.5 32)" />
        <ellipse cx="40" cy="33" rx="9" ry="2.2" transform="rotate(38 40 33)" />
        <ellipse cx="23.5" cy="23" rx="7" ry="1.9" transform="rotate(-40 23.5 23)" />
        <ellipse cx="37.5" cy="24" rx="7" ry="1.9" transform="rotate(40 37.5 24)" />
        <ellipse cx="25" cy="15" rx="5" ry="1.6" transform="rotate(-42 25 15)" />
        <ellipse cx="35" cy="16" rx="5" ry="1.6" transform="rotate(42 35 16)" />
      </g>
    </Svg>
  );
}

/** Palm fan — blades radiating from one base point. Reads as undergrowth. */
export function Palm(props: ShapeProps) {
  return (
    <Svg {...props}>
      <g fill="currentColor">
        <path d="M32 62 C30 44 22 28 8 16 C20 22 30 34 32 50 Z" />
        <path d="M32 62 C34 44 42 28 56 16 C44 22 34 34 32 50 Z" />
        <path d="M32 62 C29 42 26 24 24 6 C31 20 34 40 33 56 Z" />
        <path d="M32 62 C35 42 38 24 40 6 C33 20 30 40 31 56 Z" />
        <path d="M32 62 C28 46 18 34 4 30 C18 32 29 40 33 54 Z" />
        <path d="M32 62 C36 46 46 34 60 30 C46 32 35 40 31 54 Z" />
      </g>
    </Svg>
  );
}

/**
 * Hero backdrop: canopy light from above, foliage crowding in from the edges.
 *
 * Everything is pinned to the container's corners rather than laid out in
 * flow, so it cannot push the headline or the search field around. The centre
 * is deliberately left empty — that is where the type sits.
 */
export function CanopyBackdrop({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Shaft of canopy light washing down from the top. */}
      <div
        className="absolute inset-x-0 top-0 h-72"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--color-accent) 12%, transparent) 0%, transparent 100%)",
        }}
      />

      {/* Top-left cluster. */}
      <Monstera className="absolute -left-10 -top-12 w-44 h-44 text-accent opacity-[0.10] rotate-[18deg]" />
      <Leaf className="absolute left-16 -top-8 w-24 h-24 text-accent opacity-[0.13] -rotate-[28deg]" />
      <Frond className="absolute -left-6 top-28 w-28 h-28 text-accent opacity-[0.08] rotate-[8deg] hidden sm:block" />

      {/* Top-right cluster — larger, since the artwork column sits below it. */}
      <Monstera className="absolute -right-14 -top-16 w-56 h-56 text-accent opacity-[0.09] -rotate-[24deg]" />
      <Leaf className="absolute right-24 -top-6 w-20 h-20 text-accent opacity-[0.12] rotate-[38deg] hidden sm:block" />

      {/* Bottom edge, growing up into the section. */}
      <Palm className="absolute -bottom-16 left-1/4 w-40 h-40 text-accent opacity-[0.07] hidden lg:block" />
      <Frond className="absolute -bottom-12 -right-8 w-36 h-36 text-accent opacity-[0.09] -rotate-[12deg] hidden sm:block" />
    </div>
  );
}

/**
 * A row of foliage silhouettes along the top edge of the footer, so the page
 * ends in undergrowth rather than a plain rule.
 */
export function UndergrowthBand() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 -top-8 h-16 overflow-hidden"
      aria-hidden="true"
    >
      <div className="relative mx-auto h-full max-w-6xl">
        <Palm className="absolute bottom-0 left-[4%] w-16 h-16 text-accent opacity-[0.12]" />
        <Frond className="absolute bottom-0 left-[18%] w-14 h-14 text-accent opacity-[0.10] rotate-[6deg] hidden sm:block" />
        <Leaf className="absolute bottom-0 left-[32%] w-12 h-12 text-accent opacity-[0.14] -rotate-[12deg] hidden sm:block" />
        <Monstera className="absolute bottom-0 left-[47%] w-16 h-16 text-accent opacity-[0.10] rotate-[4deg]" />
        <Leaf className="absolute bottom-0 left-[62%] w-12 h-12 text-accent opacity-[0.13] rotate-[16deg] hidden sm:block" />
        <Frond className="absolute bottom-0 left-[76%] w-14 h-14 text-accent opacity-[0.10] -rotate-[8deg] hidden sm:block" />
        <Palm className="absolute bottom-0 right-[4%] w-16 h-16 text-accent opacity-[0.12]" />
      </div>
    </div>
  );
}
