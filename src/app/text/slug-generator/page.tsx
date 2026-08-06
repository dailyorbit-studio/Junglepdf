import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import SlugGeneratorTool from "./SlugGeneratorTool";

export const metadata: Metadata = toolMetadata({
  category: "text",
  slug: "slug-generator",
  title: "Slug Generator — Make URL-Safe Slugs Online",
  description:
    "Turn any title into a clean, URL-safe slug. Lowercases, strips accents and punctuation, and joins words with hyphens. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What is a slug?",
    answer:
      "The human-readable part of a URL that identifies a page — the 'make-url-safe-slugs' in a blog address, for example. A good slug is lowercase, uses hyphens instead of spaces, and contains only characters that are safe in a URL.",
  },
  {
    question: "What happens to accents and symbols?",
    answer:
      "Accented letters are folded to their plain form (café becomes cafe) and anything that is not a letter or number is replaced by the separator, so the result is always URL-safe.",
  },
  {
    question: "Can I make one slug per line?",
    answer:
      "Yes. Paste several titles, one per line, and each becomes its own slug — handy for generating a batch of URLs at once.",
  },
  {
    question: "Hyphens or underscores?",
    answer:
      "Hyphens by default, which is what search engines treat as a word separator in URLs. Switch to underscores if a specific system requires them, though hyphens are the usual choice for SEO.",
  },
];

export default function SlugGeneratorPage() {
  return (
    <ToolPageShell
      category="text"
      slug="slug-generator"
      title="Slug Generator"
      description="Turn any title into a clean, URL-safe slug. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Text", href: "/text" },
        { label: "Slug Generator" },
      ]}
      steps={[
        "Type or paste a title (or several, one per line).",
        "Choose hyphens or underscores.",
        "Copy the URL-safe slug.",
      ]}
      articleContent={
        <>
          <h2>Titles into clean URLs</h2>
          <p>
            A slug is what turns &quot;10 Tips for Better Café Brûlée!&quot; into
            <code>10-tips-for-better-cafe-brulee</code> — lowercase, accent-free,
            punctuation gone, words joined by hyphens. This tool does that
            conversion for one title or a whole list at once, so your URLs stay
            readable and safe.
          </p>
          <h2>Why the transformations matter</h2>
          <p>
            Each step has a reason: lowercasing avoids case-sensitivity
            surprises, folding accents keeps the slug ASCII-safe across every
            system, and collapsing runs of punctuation to a single separator
            stops double hyphens. Hyphens are the default because search engines
            read them as word breaks. It all runs on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <SlugGeneratorTool />
    </ToolPageShell>
  );
}
