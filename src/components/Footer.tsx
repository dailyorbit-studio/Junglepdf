import Link from "next/link";
import BrandMark from "./BrandMark";
import { UndergrowthBand } from "./Foliage";
import {
  TOOL_CATEGORIES,
  SITE_PAGES,
  ALL_TOOLS,
  categoryHref,
  toolHref,
  popularFirst,
} from "@/lib/tools";
import {
  FOOTER_CONVERSIONS,
  CONVERSIONS,
  conversionHref,
  conversionLabel,
} from "@/lib/conversions";
import { SITE_NAME, CREATOR, SOCIAL_LINKS } from "@/lib/site";

/**
 * Site footer.
 *
 * A middle position between the two extremes this has already been through.
 * It once listed all 57 tools — taller than most pages it sat under, and the
 * same undifferentiated wall on every one. It was then cut to four category
 * links, which read well but left a real gap: measured on the built output,
 * a tool page exposed six internal links and *nothing on the entire site*
 * linked to /convert/, because the nav's Convert panel only exists in the DOM
 * while it is open. Fifty-three conversion pages were sitemap-only orphans.
 *
 * So: the few tools per category people actually arrive for, the handful of
 * most-searched conversions, and a route into each hub. Roughly thirty links
 * rather than four or a hundred — enough that every section of the site is
 * reachable from every page, few enough to still scan.
 */

/** Per category. Enough to be useful, not so many the footer becomes the page. */
const TOOLS_PER_CATEGORY = 5;

/** Pages, not a company blurb: home, the about page, and how to reach us. */
const SITE_LINKS = [
  { label: "Home", href: "/" },
  ...SITE_PAGES,
  { label: "Contact", href: "/legal/contact/" },
];

const LEGAL_COLUMN = [
  { label: "Privacy policy", href: "/legal/privacy-policy/" },
  { label: "Terms of use", href: "/legal/terms-of-use/" },
];

export default function Footer() {
  return (
    // relative so the undergrowth band can hang above the top border, and
    // overflow-visible is the default — the band deliberately breaks out.
    <footer className="relative border-t border-border bg-surface mt-20">
      <UndergrowthBand />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 md:pr-8">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <span className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white">
                <BrandMark size={18} />
              </span>
              <span className="text-base font-bold text-ink group-hover:text-accent transition-colors duration-150">
                {SITE_NAME}
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm text-ink-secondary leading-relaxed">
              File tools that run entirely inside your browser. Convert, compress
              and edit documents, images, audio and video without your files ever
              leaving your device.
            </p>

            {/*
              Inline SVG rather than an icon package. Four glyphs do not justify
              a dependency, and the site's whole claim is that it fetches nothing
              from anyone — which a webfont-backed icon set would quietly break.

              The row is a <ul>, not loose anchors: it is a list of the same kind
              of thing, and a screen reader announcing "list, 4 items" is the
              difference between a navigable group and four stray links.
            */}
            <ul className="mt-5 flex items-center gap-1">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="me noopener noreferrer"
                    aria-label={`${CREATOR.name} on ${social.label}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:text-accent hover:bg-surface-raised transition-colors duration-150"
                  >
                    <SocialIcon name={social.label} />
                  </a>
                </li>
              ))}

              {/*
                Points at the contact page, not a mailto:. The address in the
                footer of 122 pages is exactly what address-harvesting crawlers
                exist to collect — the contact page and the Organization schema
                already carry it for anyone actually looking.
              */}
              <li>
                <Link
                  href="/legal/contact/"
                  aria-label="Contact us"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:text-accent hover:bg-surface-raised transition-colors duration-150"
                >
                  <SocialIcon name="Email" />
                </Link>
              </li>
            </ul>
          </div>

          {/*
            One column per category, leading with the tools people actually come
            for. Ordered by popularFirst, the same editorial ranking the homepage
            grid and the category pages use, so the footer cannot drift out of
            step with them.
          */}
          {TOOL_CATEGORIES.map((category) => {
            const top = popularFirst(
              ALL_TOOLS.filter((tool) => tool.category.slug === category.slug)
            ).slice(0, TOOLS_PER_CATEGORY);

            return (
              <FooterColumn
                key={category.slug}
                title={category.label}
                className="md:col-span-2"
              >
                {top.map((tool) => (
                  <FooterLink key={tool.href} href={toolHref(category.slug, tool.slug)}>
                    {tool.name}
                  </FooterLink>
                ))}
                <FooterLink href={categoryHref(category.slug)} muted>
                  All {category.tools.length} →
                </FooterLink>
              </FooterColumn>
            );
          })}

          {/* Conversions: the query shapes people actually type. */}
          <FooterColumn
            title="Popular conversions"
            className="col-span-2 md:col-span-6"
            listClassName="grid grid-cols-2 gap-x-6 sm:grid-cols-3"
          >
            {FOOTER_CONVERSIONS.map((pair) => (
              <FooterLink key={pair.slug} href={conversionHref(pair.slug)}>
                {conversionLabel(pair)}
              </FooterLink>
            ))}
            <FooterLink href="/convert/" muted>
              All {CONVERSIONS.length} →
            </FooterLink>
          </FooterColumn>

          <FooterColumn title="Links" className="md:col-span-3">
            {SITE_LINKS.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Legal" className="md:col-span-3">
            {LEGAL_COLUMN.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        {/*
          The Font Awesome / CC BY 4.0 icon credit used to sit here. The licence
          still requires it, so it now lives under "Intellectual property" in
          /legal/terms-of-use/ rather than being dropped.
        */}
        <div className="mt-10 pt-6 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-ink-muted">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>

          {/*
            Publisher attribution. rel="me" marks this as an identity link
            rather than an ordinary outbound one, which is what ties the site
            to its operator for verification purposes — and an identifiable
            operator is something ad networks and search quality raters both
            look for.

            The address itself is deliberately not here: a mailto in the
            footer of all 66 pages is a scraper magnet, and the contact page
            and the Organization schema already carry it for anyone (or any
            reviewer) actually looking for it.
          */}
          <p className="text-xs text-ink-muted">
            Built by{" "}
            <a
              href={`https://${CREATOR.domain}`}
              rel="me noopener noreferrer"
              target="_blank"
              className="font-medium text-ink-secondary hover:text-accent transition-colors duration-150"
            >
              {CREATOR.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * The four footer glyphs, drawn inline.
 *
 * X and LinkedIn are solid marks, so they fill; Instagram and the envelope are
 * line marks, so they stroke. Mixing the two conventions in one row is what
 * makes an icon set look assembled rather than designed — these are sized and
 * weighted to sit together.
 */
function SocialIcon({ name }: { name: string }) {
  const common = { width: 18, height: 18, "aria-hidden": true } as const;

  if (name === "X") {
    return (
      <svg {...common} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  if (name === "LinkedIn") {
    return (
      <svg {...common} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }

  if (name === "Instagram") {
    return (
      <svg
        {...common}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }

  return (
    <svg
      {...common}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function FooterColumn({
  title,
  className,
  listClassName = "space-y-1",
  children,
}: {
  title: string;
  className?: string;
  /**
   * Applied to the <ul> itself so a wide section can lay its links out in
   * columns. Wrapping them in a <div> inside the list would be invalid markup —
   * a <ul> may only contain <li> — and screen readers announce the item count
   * from the direct children, so the grid has to live on the list.
   */
  listClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <nav aria-label={title} className={className}>
      <h2 className="text-xs font-semibold text-ink uppercase tracking-wider">
        {title}
      </h2>
      <ul className={`mt-4 ${listClassName}`}>{children}</ul>
    </nav>
  );
}

/*
 * inline-block with vertical padding rather than a bare inline link: at 14px
 * these rows are a 19px-tall tap target, under the 24px WCAG 2.5.8 floor and
 * genuinely fiddly on a phone. The padding grows the target without moving the
 * text.
 */
function FooterLink({
  href,
  children,
  /** For the "All 57 →" tails: a route onward, not another peer link. */
  muted = false,
}: {
  href: string;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`inline-block py-1.5 text-sm transition-colors duration-150 hover:text-accent ${
          muted ? "text-ink-muted font-medium" : "text-ink-secondary"
        }`}
      >
        {children}
      </Link>
    </li>
  );
}
