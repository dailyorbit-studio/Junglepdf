import type { MetadataRoute } from "next";
import { TOOL_CATEGORIES, LEGAL_LINKS, SITE_PAGES, categoryHref, toolHref } from "@/lib/tools";
import { CONVERSIONS, conversionHref } from "@/lib/conversions";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * next.config.ts sets `trailingSlash: true`, so the exported files live at
 * /audio/video-to-mp3/index.html. Sitemap entries must carry that trailing
 * slash or every URL in the file redirects.
 */
function url(path: string): string {
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.endsWith("/") ? path : `${path}/`}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: url("/"),
      lastModified,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    ...TOOL_CATEGORIES.map((category) => ({
      url: url(categoryHref(category.slug)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...TOOL_CATEGORIES.flatMap((category) =>
      category.tools.map((tool) => ({
        url: url(toolHref(category.slug, tool.slug)),
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.9,
      }))
    ),
    // The conversion hub and its landing pages. Priority sits just under the
    // tools themselves: these are entry points for very specific queries, and
    // each one leads to the same tool the category pages already point at.
    {
      url: url("/convert/"),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...CONVERSIONS.map((pair) => ({
      url: url(conversionHref(pair.slug)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...SITE_PAGES.map((page) => ({
      url: url(page.href),
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...LEGAL_LINKS.map((link) => ({
      url: url(link.href),
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
