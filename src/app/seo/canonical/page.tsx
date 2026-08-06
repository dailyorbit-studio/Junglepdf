import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import CanonicalTool from "./CanonicalTool";

export const metadata: Metadata = toolMetadata({
  category: "seo",
  slug: "canonical",
  title: "Canonical URL Generator — rel=canonical Tag",
  description:
    "Generate a rel=canonical link tag, with tracking parameters and fragments stripped, to point search engines at the preferred URL. Runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "What does a canonical tag do?",
    answer:
      "It tells search engines which URL is the master version of a page when the same content is reachable at several addresses. That consolidates ranking signals onto one URL instead of splitting them across duplicates.",
  },
  {
    question: "Why are tracking parameters removed?",
    answer:
      "A URL with utm_source or fbclid is the same page as the clean one, so the canonical should point at the version without them. The tool strips common tracking parameters and the #fragment automatically.",
  },
  {
    question: "Where does the tag go?",
    answer:
      "In the <head> of the page, and it should be an absolute URL. Each page's canonical usually points to itself unless it is genuinely a duplicate of another page.",
  },
];

export default function CanonicalPage() {
  return (
    <ToolPageShell
      category="seo"
      slug="canonical"
      title="Canonical URL Generator"
      description="Generate a canonical link tag to point search engines at the preferred URL. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "SEO", href: "/seo" },
        { label: "Canonical URL Generator" },
      ]}
      steps={[
        "Paste the page URL, tracking parameters and all.",
        "The tool cleans it to the canonical form.",
        "Copy the rel=canonical tag into your <head>.",
      ]}
      articleContent={
        <>
          <h2>One preferred URL per page</h2>
          <p>
            The same content is often reachable at several URLs — with and without
            tracking parameters, with a trailing slash or not. Search engines can
            treat those as separate pages and split the ranking between them. A
            canonical tag names the one true version, and this tool builds it while
            stripping the noise that creates the duplicates in the first place.
          </p>
          <h2>Cleaned automatically</h2>
          <p>
            Paste a URL with campaign parameters and a fragment, and the generator
            removes them, shows the clean canonical, and wraps it in the link tag
            ready for your head. Everything runs on your device, so the URLs you
            check are never sent anywhere.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <CanonicalTool />
    </ToolPageShell>
  );
}
