import Link from "next/link";
import BrandMark from "./BrandMark";
import { UndergrowthBand } from "./Foliage";
import { TOOL_CATEGORIES, SITE_PAGES, categoryHref } from "@/lib/tools";
import { SITE_NAME, CREATOR } from "@/lib/site";

/**
 * Site footer.
 *
 * Categories, not tools. Every tool used to be listed here — 57 links in four
 * columns — which made the footer taller than most of the pages it sat under
 * and gave every page the same undifferentiated wall of text. The four category
 * pages are the honest entry points: they already list their own tools, so a
 * crawler still reaches all 57 in one extra hop, and a reader gets a footer
 * they can actually scan.
 */

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
          <div className="col-span-2 md:col-span-6 md:pr-8">
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
          </div>

          {/* Categories rather than individual tools, stacked one per row. */}
          <FooterColumn title="Tools" className="md:col-span-2">
            {TOOL_CATEGORIES.map((category) => (
              <FooterLink key={category.slug} href={categoryHref(category.slug)}>
                {category.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Links" className="md:col-span-2">
            {SITE_LINKS.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Legal" className="md:col-span-2">
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

function FooterColumn({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <nav aria-label={title} className={className}>
      <h2 className="text-xs font-semibold text-ink uppercase tracking-wider">
        {title}
      </h2>
      <ul className="mt-4 space-y-1">{children}</ul>
    </nav>
  );
}

/*
 * inline-block with vertical padding rather than a bare inline link: at 14px
 * these rows are a 19px-tall tap target, under the 24px WCAG 2.5.8 floor and
 * genuinely fiddly on a phone. The padding grows the target without moving the
 * text.
 */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-block py-1.5 text-sm text-ink-secondary hover:text-accent transition-colors duration-150"
      >
        {children}
      </Link>
    </li>
  );
}
