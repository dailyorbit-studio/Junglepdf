import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

// force-static for the same reason as robots.ts and sitemap.ts: `output:
// "export"` has no server to evaluate a dynamic route at request time.
export const dynamic = "force-static";

/**
 * Web app manifest.
 *
 * Not aspiration — the tools genuinely work offline once the page has loaded,
 * so "add to home screen" produces something useful rather than a bookmark to
 * an error page. It is also one of the things Lighthouse and Search Console
 * look for on an installable site.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Free File Tools That Run In Your Browser`,
    short_name: SITE_NAME,
    description:
      "Convert, compress and edit PDF, image, audio and video files. Everything runs on your device — nothing is ever uploaded.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF9",
    theme_color: "#0D9488",
    categories: ["utilities", "productivity"],
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon.png", type: "image/png", sizes: "512x512", purpose: "any" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  };
}
