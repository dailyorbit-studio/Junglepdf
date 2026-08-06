import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import MetaTagsTool from "./MetaTagsTool";

export const metadata: Metadata = toolMetadata({
  category: "seo",
  slug: "meta-tags",
  title: "Meta Tag Generator — Title & Description Tags",
  description:
    "Generate the title, description and meta tags a page needs for SEO, ready to paste into your head. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How long should the title and description be?",
    answer:
      "Keep the title to roughly 50–60 characters so it is not truncated in search results, and the description to about 110–160. The generator notes these targets, though search engines may still rewrite a description they judge a better fit.",
  },
  {
    question: "Do meta keywords still matter?",
    answer:
      "Not for Google ranking — it has ignored the keywords tag for years. It is included as optional because a few smaller engines and internal tools still read it, but you can safely leave it empty.",
  },
  {
    question: "Where do these tags go?",
    answer:
      "Inside the <head> of your HTML page. Paste the block there and the title and description are what search engines and browsers use to represent the page.",
  },
];

export default function MetaTagsPage() {
  return (
    <ToolPageShell
      category="seo"
      slug="meta-tags"
      title="Meta Tag Generator"
      description="Generate the title, description and meta tags a page needs. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "SEO", href: "/seo" },
        { label: "Meta Tag Generator" },
      ]}
      steps={[
        "Enter your page title and description.",
        "Set the robots directive and any optional fields.",
        "Copy the tags into your page's <head>.",
      ]}
      articleContent={
        <>
          <h2>The tags that describe your page</h2>
          <p>
            The title and meta description are how a page introduces itself to
            search engines and, often, how it appears in the results. Getting them
            right — clear, the right length, unique per page — is the most basic
            and most valuable on-page SEO. This generator assembles them, plus the
            robots, viewport and charset tags every page should carry.
          </p>
          <h2>Correct and copy-ready</h2>
          <p>
            Values are properly escaped so a stray quote or ampersand cannot break
            the markup, and the block is ready to paste straight into your head.
            It is generated on your device, so nothing you type is uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <MetaTagsTool />
    </ToolPageShell>
  );
}
