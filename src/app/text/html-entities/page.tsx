import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import HtmlEntitiesTool from "./HtmlEntitiesTool";

export const metadata: Metadata = toolMetadata({
  category: "text",
  slug: "html-entities",
  title: "HTML Entity Encoder & Decoder — Free Online",
  description:
    "Encode text to HTML entities so it displays safely, or decode entities back to plain text. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Why encode HTML entities?",
    answer:
      "So that characters with special meaning in HTML — < > & \" ' — show up as literal text instead of being interpreted as markup. It is how you display code samples on a page, and a first line of defence against breaking your layout with stray characters.",
  },
  {
    question: "Which characters get escaped?",
    answer:
      "The five reserved ones: ampersand, less-than, greater-than, double quote and single quote. Encoding the ampersand first is essential, otherwise the other entities would themselves be double-escaped.",
  },
  {
    question: "Can it decode numeric entities too?",
    answer:
      "Yes. Decoding handles both named entities like &amp; and numeric ones like &#39; or &#x27;, turning them back into the characters they represent.",
  },
  {
    question: "Is this safe to run on untrusted input?",
    answer:
      "Decoding uses a detached textarea whose contents are always treated as text, never executed, so no script in the input can run. And nothing is uploaded — it all happens in your browser.",
  },
];

export default function HtmlEntitiesPage() {
  return (
    <ToolPageShell
      category="text"
      slug="html-entities"
      title="HTML Entity Encoder"
      description="Encode text to HTML entities to display it safely, or decode entities back. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Text", href: "/text" },
        { label: "HTML Entity Encoder" },
      ]}
      steps={[
        "Choose Encode or Decode.",
        "Paste your text or entities.",
        "Copy the converted result.",
      ]}
      articleContent={
        <>
          <h2>Showing markup as text</h2>
          <p>
            To display a snippet of HTML on a web page — a tag, an attribute, an
            example — the special characters have to be escaped, or the browser
            renders them instead of showing them. Encoding turns
            <code>&lt;div&gt;</code> into <code>&amp;lt;div&amp;gt;</code>, which
            appears on the page as the literal text you meant.
          </p>
          <h2>Both directions, safely</h2>
          <p>
            Decoding reverses it, turning entities back into their characters —
            useful for reading escaped content pulled from a feed or an export.
            The decoder treats everything as inert text, so nothing in the input
            can run, and the whole conversion stays on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <HtmlEntitiesTool />
    </ToolPageShell>
  );
}
