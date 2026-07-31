import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import MarkdownToPdfTool from "./MarkdownToPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "markdown-to-pdf",
  title: "Markdown to PDF — Convert MD Files With Formatting",
  description:
    "Convert a Markdown file into a formatted PDF — headings, lists, tables, code blocks and links all carried across. Runs entirely in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "Do my code blocks keep their formatting?",
    answer:
      "Yes. Fenced blocks with triple backticks and indented four-space blocks both render in a monospace face with their line breaks preserved. Syntax highlighting is not applied — the code is drawn in a single colour.",
  },
  {
    question: "Do tables work?",
    answer:
      "Yes, including the alignment separator row. The header row is drawn in bold and repeats if the table runs across a page break. Cells that are far too wide for the page will still be cramped — that is the page, not the parser.",
  },
  {
    question: "What happens to images in my Markdown?",
    answer:
      "They are replaced with their alt text in square brackets. Embedding them would require downloading from wherever the Markdown points, and no tool here makes network requests for your content.",
  },
  {
    question: "Will my emoji or non-Latin text survive?",
    answer:
      "Probably not. The standard PDF fonts cover Western European text only, so emoji, CJK, Devanagari, Arabic, Greek and Cyrillic are replaced with question marks and the count is reported afterwards.",
  },
  {
    question: "Is my file uploaded?",
    answer:
      "No. The Markdown is read as text in your browser, parsed there, and rendered to a PDF with pdf-lib locally.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="pdf"
      slug="markdown-to-pdf"
      title="Markdown to PDF"
      description="Turn a .md file into a formatted PDF, with the structure intact."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Markdown to PDF" },
      ]}
      steps={[
        "Drop in a .md or .markdown file",
        "Choose the page size, typeface and margins",
        "Convert, then download the PDF",
      ]}
      articleContent={
        <>
          <h2>What converts</h2>
          <p>
            Headings become real headings at the right sizes. Bullet and numbered lists
            keep their nesting. Bold, italic and inline code carry their formatting.
            Links stay clickable in the PDF. Blockquotes are indented and marked.
            Horizontal rules are drawn. Task lists get checkbox symbols.
          </p>
          <p>
            Tables convert with the header row picked out in bold, and fenced code blocks
            keep their line breaks and render in a monospace face — which is the part
            most naive converters get wrong, because a code block that gets re-wrapped as
            prose is worse than no code block at all.
          </p>
          <h2>Where it stops</h2>
          <p>
            Images are replaced by their alt text in brackets. A Markdown image is a link
            to a file, and following it would mean fetching from the network — which
            nothing on this site does, by design.
          </p>
          <p>
            Reference-style links, footnotes and raw HTML blocks are not supported.
            Markdown has a long tail of extensions and this covers the part people
            actually write: CommonMark’s core plus tables and task lists.
          </p>
          <h2>Why the styling matches the other converters</h2>
          <p>
            The parser produces the same intermediate block format that the Word, HTML,
            ODT and EPUB converters produce, and hands it to the same typesetter. A
            heading from a Markdown file and a heading from a .docx come out identical.
          </p>
          <p>
            That is deliberate: one layout engine means one place to fix a spacing bug,
            and a consistent look across six different input formats.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <MarkdownToPdfTool />
    </ToolPageShell>
  );
}
