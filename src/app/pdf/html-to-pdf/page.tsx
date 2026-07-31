import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import HtmlToPdfTool from "./HtmlToPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "html-to-pdf",
  title: "HTML to PDF — Convert an HTML File to PDF in Your Browser",
  description:
    "Convert a saved HTML file into a readable PDF. Keeps headings, lists, tables and links. Nothing is uploaded and no remote assets are fetched.",
});

const FAQ_ITEMS = [
  {
    question: "Will the PDF look like the web page does in my browser?",
    answer:
      "No, and this is the most important thing to know before you start. The converter reads the document's structure — headings, paragraphs, lists, tables, links — and typesets it cleanly. It does not apply CSS. A heavily designed page will come out as its underlying content, correctly ordered and readable, but not as a picture of the page.",
  },
  {
    question: "Why not apply the CSS?",
    answer:
      "Because rendering CSS layout means running a browser engine and screenshotting the result, which is what server-side services do with headless Chrome. This site has no server by design — every file stays on your device — so that route is not available. If you need a pixel-exact copy of a page, your browser's own Print → Save as PDF does exactly that, using the engine already in front of you.",
  },
  {
    question: "Why aren't my images showing up?",
    answer:
      "Because they live at a URL rather than inside the file, and this tool never fetches anything over the network. Downloading them would tell those servers what document you are converting and where you are, which is not something a privacy tool should do quietly. Images embedded directly in the HTML as data: URIs do come through — save the page as \"Web page, single file\" (.mhtml is not supported, but many editors inline images) or use a file with embedded images.",
  },
  {
    question: "I saved a page and the PDF is nearly empty.",
    answer:
      "That page builds its content with JavaScript. What you saved is the script, not the text — the words only exist once the script runs. Nothing can be extracted from that file without executing it. Copy the text you need into a .txt file and use TXT to PDF, or print the live page from your browser.",
  },
  {
    question: "Do tables and code blocks survive?",
    answer:
      "Yes. Tables are drawn with borders and wrapped cell text, in equal-width columns. Code and preformatted blocks are set in a monospace face with their line breaks preserved, which is the one place in the document where line breaks are meaningful.",
  },
  {
    question: "Are links still clickable?",
    answer:
      "Yes. Links become real PDF link annotations, not just blue text, so they work in any PDF reader.",
  },
];

export default function HtmlToPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="html-to-pdf"
      title="HTML to PDF"
      description="Convert a saved HTML file into a clean, readable PDF — headings, lists, tables and working links."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "HTML to PDF" },
      ]}
      steps={[
        "Drop your .html file into the box above — it stays on your device.",
        "Choose page size, typeface and margins.",
        "Convert and download the PDF.",
      ]}
      articleContent={
        <>
          <h2>Turning markup into a document</h2>
          <p>
            HTML describes a document&apos;s structure: this is a heading, this is
            a list, this is a table, this is a link. That structure is exactly
            what a PDF needs in order to be typeset well — and it survives the
            trip perfectly, because it is the part of HTML that is actually about
            the content rather than its appearance.
          </p>
          <p>
            So this converter reads the structure and sets it properly: headings
            at their hierarchy, lists with hanging indents, tables with borders
            and wrapped cells, code in a monospace face, and links as real
            clickable annotations rather than blue text.
          </p>

          <h2>What it deliberately does not do</h2>
          <p>
            <strong>It does not apply CSS.</strong> Reproducing a styled page
            means running a browser engine and capturing what it paints — the
            headless-Chrome approach every server-side converter uses. There is no
            server here, so that is not on the table. What you get instead is the
            document&apos;s content, correctly ordered and cleanly typeset.
          </p>
          <p>
            <strong>It does not fetch anything.</strong> Remote images,
            stylesheets, fonts and scripts referenced by the file are never
            downloaded. That is a privacy decision as much as a technical one:
            requesting them would announce to those servers which document you
            are converting, and from where. Images embedded in the file itself
            are included.
          </p>
          <p>
            If you need a pixel-exact copy of a live web page, your browser
            already does that better than any converter could — Print, then Save
            as PDF.
          </p>

          <h2>When this is the right tool</h2>
          <p>
            It is at its best on content-shaped HTML: an exported article, a
            generated report, documentation, an email saved as HTML, a Markdown
            file rendered to HTML, or the output of a tool that writes HTML
            because that was the easiest format to emit.
          </p>
          <p>
            It is the wrong tool for a marketing page, a dashboard, or anything
            whose value is in its visual design.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Converting a generated HTML report into something to file or send</li>
            <li>Turning documentation into a printable, paginated document</li>
            <li>Archiving an article as a fixed, readable document</li>
            <li>Getting an HTML export into a system that only accepts PDF</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            The file is parsed by the browser&apos;s own HTML parser and the PDF is
            assembled in memory on your machine. Nothing is uploaded, and — unlike
            most HTML-to-PDF services — nothing the document references is
            requested either.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <HtmlToPdfTool />
    </ToolPageShell>
  );
}
