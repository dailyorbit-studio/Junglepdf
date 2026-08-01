import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import {
  conversionGroups,
  conversionHref,
  conversionLabel,
  CONVERSIONS,
  FORMAT_INFO,
} from "@/lib/conversions";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: `All File Conversions — ${SITE_NAME}`,
  description: `Every conversion available on ${SITE_NAME}, from WebP to PNG to MP4 to MP3. All ${CONVERSIONS.length} run in your browser with no upload and no sign-up.`,
  path: "/convert",
});

/**
 * The hub for the conversion landing pages.
 *
 * Its real job is internal linking. Each /convert/<pair>/ page is only
 * reachable from the nav mega-menu otherwise, and a crawler that has to find
 * forty-odd pages through a JavaScript dropdown may well not. A flat list of
 * plain anchors is what guarantees every one of them gets discovered.
 */
export default function ConvertIndexPage() {
  const groups = conversionGroups();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-ink-muted mb-5"
      >
        <Link href="/" className="py-1 hover:text-ink-secondary transition-colors">
          Home
        </Link>
        <span className="text-border">/</span>
        <span className="text-ink-secondary">Conversions</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
        All file conversions
      </h1>
      <p className="mt-3 text-base text-ink-secondary max-w-2xl leading-relaxed">
        {CONVERSIONS.length} direct conversions, each with the output format already
        selected. Every one runs inside your browser — nothing is uploaded, and there is
        no sign-up or watermark.
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
        {groups.map((group) => (
          <section key={group.kind}>
            <h2 className="text-sm font-bold text-ink tracking-tight pb-2 mb-3 border-b border-border">
              {group.label}
            </h2>
            <ul className="space-y-1">
              {group.items.map((pair) => (
                <li key={pair.slug}>
                  <Link
                    href={conversionHref(pair.slug)}
                    className="block py-1.5 text-sm text-ink-secondary hover:text-accent transition-colors duration-150"
                  >
                    {conversionLabel(pair)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-14 max-w-3xl prose-tool">
        <h2>Why a page per conversion?</h2>
        <p>
          Because that is how the question gets asked. Almost nobody searches for
          &ldquo;image converter&rdquo; — they search for{" "}
          <Link href={conversionHref("webp-to-png")}>webp to png</Link> or{" "}
          <Link href={conversionHref("mp4-to-mp3")}>mp4 to mp3</Link>, with the answer
          already inside the question. Each page here opens with that exact pair set up,
          so there is nothing to configure when you arrive.
        </p>
        <p>
          Only conversions that genuinely work are listed. There is no HEIC page,
          because no browser except Safari can decode HEIC, and none of these convert{" "}
          <em>to</em> AVIF, because no browser can encode it. A page that ranked and
          then failed would be worse than no page at all.
        </p>
        <p>
          Formats covered:{" "}
          {[...new Set(CONVERSIONS.flatMap((c) => [c.from, c.to]))]
            .map((f) => FORMAT_INFO[f].label)
            .sort()
            .join(", ")}
          .
        </p>
      </section>
    </div>
  );
}
