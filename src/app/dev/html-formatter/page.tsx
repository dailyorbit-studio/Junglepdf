import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import HtmlFormatterTool from "./HtmlFormatterTool";

export const metadata: Metadata = toolMetadata({
  category: "dev",
  slug: "html-formatter",
  title: "HTML Formatter — Indent & Beautify HTML Online",
  description:
    "Indent and tidy raw HTML so nested tags are readable, or minify it back down. Runs entirely in your browser — your markup is never uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Is my HTML uploaded?",
    answer:
      "No. The markup is re-indented by JavaScript in your browser. Nothing is sent to a server, so pasting a full page or a template with private content is safe.",
  },
  {
    question: "Will it fix broken HTML?",
    answer:
      "No, and that is deliberate. It indents the tags exactly as you wrote them rather than silently 'correcting' them, so a missing closing tag stays visible instead of being papered over. It is a formatter, not a sanitiser.",
  },
  {
    question: "What happens to script and style blocks?",
    answer:
      "The contents of script, style and pre are kept together and indented as a block rather than being reflowed line by line, so code and preformatted text are not mangled.",
  },
  {
    question: "What does Minify do?",
    answer:
      "It removes comments and the whitespace between tags to produce the smallest equivalent markup — useful before shipping, or for pasting HTML into a place where size matters.",
  },
];

export default function HtmlFormatterPage() {
  return (
    <ToolPageShell
      category="dev"
      slug="html-formatter"
      title="HTML Formatter"
      description="Indent tangled HTML into something readable, or minify it back down. Everything runs in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Developer", href: "/dev" },
        { label: "HTML Formatter" },
      ]}
      steps={[
        "Paste your HTML into the input box.",
        "Choose Format to indent it, or Minify to collapse it.",
        "Copy the tidied markup.",
      ]}
      articleContent={
        <>
          <h2>Markup you can actually read</h2>
          <p>
            HTML that arrives from a build step or a CMS is often one long line.
            Formatting re-indents each tag by how deeply it is nested, so the
            document&apos;s structure — which elements sit inside which — becomes
            obvious. That makes it far quicker to find the block you need to
            change.
          </p>
          <h2>Honest indentation</h2>
          <p>
            This formatter indents literally rather than rebuilding a corrected
            tree. If a tag is never closed, the indentation will drift — which is
            a feature: it shows you the mistake instead of hiding it. All of it
            happens on your device, so nothing you paste leaves the page.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <HtmlFormatterTool />
    </ToolPageShell>
  );
}
