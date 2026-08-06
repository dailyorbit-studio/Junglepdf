import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import OpenGraphTool from "./OpenGraphTool";

export const metadata: Metadata = toolMetadata({
  category: "seo",
  slug: "open-graph",
  title: "Open Graph Generator — OG Meta Tags for Sharing",
  description:
    "Generate Open Graph meta tags for rich link previews on Facebook, LinkedIn and more. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What is Open Graph?",
    answer:
      "A set of meta tags, prefixed og:, that tell social platforms how to display a link — the title, description and image shown in the preview card. Without them, a shared link falls back to whatever the platform can scrape, which is often wrong.",
  },
  {
    question: "What image size should I use?",
    answer:
      "1200×630 pixels is the widely-supported size for a large preview image, and the og:image URL should be absolute (starting with https://), not relative, so platforms can fetch it.",
  },
  {
    question: "Where do these tags go?",
    answer:
      "In the <head> of the page. After adding them, use a platform's sharing debugger to re-scrape the URL so the new preview is picked up.",
  },
];

export default function OpenGraphPage() {
  return (
    <ToolPageShell
      category="seo"
      slug="open-graph"
      title="Open Graph Generator"
      description="Generate Open Graph meta tags for rich link previews on social media. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "SEO", href: "/seo" },
        { label: "Open Graph Generator" },
      ]}
      steps={[
        "Fill in the title, description, URL and image.",
        "Choose the content type.",
        "Copy the og: tags into your page's <head>.",
      ]}
      articleContent={
        <>
          <h2>Control how your links look when shared</h2>
          <p>
            When someone shares your page on social media, the preview card — title,
            description and image — is drawn from Open Graph tags. Set them and you
            control that first impression; leave them out and the platform guesses,
            often unflatteringly. This generator writes the core og: tags for you.
          </p>
          <h2>Absolute URLs, escaped values</h2>
          <p>
            The image and page URLs need to be absolute for platforms to fetch
            them, and all values are escaped so punctuation cannot break the tags.
            Paste the block into your head, then re-scrape the URL in a sharing
            debugger. It all runs on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <OpenGraphTool />
    </ToolPageShell>
  );
}
