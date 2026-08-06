import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import TwitterCardTool from "./TwitterCardTool";

export const metadata: Metadata = toolMetadata({
  category: "seo",
  slug: "twitter-card",
  title: "Twitter Card Generator — X Card Meta Tags",
  description:
    "Generate Twitter Card meta tags for rich link previews on X / Twitter, for summary or large-image cards. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What's the difference between the card types?",
    answer:
      "summary_large_image shows a big banner image above the title and description; summary shows a small square thumbnail beside them. Large image is the usual choice for articles and landing pages.",
  },
  {
    question: "Do I still need Open Graph tags?",
    answer:
      "It helps. X falls back to Open Graph tags for anything the twitter: tags don't specify, so having both gives the most reliable preview across platforms. Many sites set the twitter:card type and let og: supply the rest.",
  },
  {
    question: "Where do these tags go?",
    answer:
      "In the <head> of the page. After adding them, re-share or validate the URL so the card is refreshed.",
  },
];

export default function TwitterCardPage() {
  return (
    <ToolPageShell
      category="seo"
      slug="twitter-card"
      title="Twitter Card Generator"
      description="Generate Twitter Card meta tags for rich previews on X / Twitter. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "SEO", href: "/seo" },
        { label: "Twitter Card Generator" },
      ]}
      steps={[
        "Choose the card type.",
        "Fill in the title, description and image.",
        "Copy the twitter: tags into your page's <head>.",
      ]}
      articleContent={
        <>
          <h2>Rich previews on X</h2>
          <p>
            Twitter Cards turn a plain link into a preview with a title,
            description and image when it is posted on X. This generator writes the
            twitter: meta tags for either a large-image or a compact summary card,
            with the handle prefixed correctly and the values escaped.
          </p>
          <h2>Pair it with Open Graph</h2>
          <p>
            X reads Open Graph tags as a fallback, so the most robust setup is a
            twitter:card declaration alongside your og: tags. Paste the block into
            your head and refresh the card by re-sharing the URL. It all runs on
            your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <TwitterCardTool />
    </ToolPageShell>
  );
}
