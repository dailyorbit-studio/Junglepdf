import type { Metadata } from "next";
import { SITE_NAME } from "./site";
import { findTool } from "./tools";

/**
 * Per-page metadata, built in one place.
 *
 * Three things every page needs and none of them were getting consistently:
 *
 * 1. **An absolute title.** The root layout sets a `%s | JunglePDF` template,
 *    which pushed most tool titles past the ~60 characters Google shows before
 *    truncating — "PDF to PowerPoint — Convert PDF Pages Into Editable Slides"
 *    plus a brand suffix is a title nobody ever reads the end of. Tool titles
 *    already say what the tool is, so they opt out of the suffix; the homepage
 *    and the category pages keep the brand because those are the pages a brand
 *    search should land on.
 *
 * 2. **Its own Open Graph and Twitter tags.** Without them a page inherits the
 *    layout's, so every one of 57 tools shared the homepage's title and blurb
 *    when shared — the single most common way a link preview goes stale.
 *
 * 3. **A canonical with a trailing slash**, because `trailingSlash: true`
 *    means /pdf/merge-pdf 308-redirects to /pdf/merge-pdf/, and a canonical
 *    pointing at the redirect wastes the hop on every crawl.
 */

const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — free file tools that run in your browser`,
};

interface PageMetaOptions {
  /** Shown verbatim in the SERP. Aim for 60 characters or fewer. */
  title: string;
  /** 110–165 characters. Shorter gets padded by Google, longer gets cut. */
  description: string;
  /** Canonical path, with a leading and trailing slash. */
  path: string;
  keywords?: string[];
  /** Keep the "| JunglePDF" suffix — for pages a brand search should find. */
  brandSuffix?: boolean;
}

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  brandSuffix = false,
}: PageMetaOptions): Metadata {
  return {
    title: brandSuffix ? title : { absolute: title },
    description,
    alternates: { canonical: path },
    ...(keywords?.length ? { keywords } : {}),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title,
      description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

/**
 * The same thing for a tool page, with the path and the search keywords taken
 * from the registry rather than repeated in the page file — the keywords are
 * already there to drive site search, and a tool's canonical is a function of
 * its category and slug.
 */
export function toolMetadata({
  category,
  slug,
  title,
  description,
}: {
  category: string;
  slug: string;
  title: string;
  description: string;
}): Metadata {
  const tool = findTool(category, slug);

  return pageMetadata({
    title,
    description,
    path: `/${category}/${slug}/`,
    keywords: tool ? [tool.name.toLowerCase(), ...(tool.keywords ?? [])] : undefined,
  });
}
