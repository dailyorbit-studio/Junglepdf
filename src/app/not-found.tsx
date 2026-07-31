import type { Metadata } from "next";
import Link from "next/link";
import { TOOL_CATEGORIES, TOOL_COUNT, categoryHref } from "@/lib/tools";
import ToolSearch from "@/components/ToolSearch";

/**
 * Custom 404.
 *
 * The framework default is an unstyled "404 | This page could not be found",
 * which on a static export is what a visitor sees for any mistyped tool URL —
 * and there are 57 slugs to mistype. This one keeps the header and footer, so
 * every route out of the dead end is still one click away, and offers search
 * rather than a bare apology.
 *
 * noindex: a soft 404 that Google indexes is worse than one it drops, and a
 * static export cannot send a real 404 status code on most hosts.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-accent">404</p>

      <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-ink tracking-tight text-balance">
        That page isn&apos;t here
      </h1>

      <p className="mt-4 text-base text-ink-secondary leading-relaxed max-w-lg mx-auto">
        The link may be out of date, or the address may have a typo in it. All{" "}
        {TOOL_COUNT} tools are still where they were — try a search:
      </p>

      <div className="mt-8 max-w-md mx-auto text-left">
        <ToolSearch variant="hero" placeholder="Search for a tool…" />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="px-4 py-2.5 text-sm font-semibold rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors duration-150"
        >
          Go to the homepage
        </Link>
        {TOOL_CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={categoryHref(category.slug)}
            className="px-4 py-2.5 text-sm font-medium rounded-lg border border-border bg-surface text-ink-secondary hover:border-ink-muted hover:text-ink transition-colors duration-150"
          >
            {category.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
