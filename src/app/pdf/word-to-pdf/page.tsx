import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import WordToPdfTool from "./WordToPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "word-to-pdf",
  title: "Word to PDF — Convert DOCX to PDF in Your Browser",
  description:
    "Convert a Word document (.docx) to PDF without uploading it. Keeps headings, lists, tables, links and images. Runs entirely in your browser — free, no sign-up.",
});

const FAQ_ITEMS = [
  {
    question: "Will the PDF look exactly like my Word document?",
    answer:
      "No, and that is worth being clear about. The converter reads the document's structure — headings, paragraphs, lists, tables, links, images — and lays it out cleanly on the page. It does not reproduce Word's own fonts, colors, columns, text boxes, headers and footers, or hand-placed page breaks. For a letter, a report, a CV or an essay the result reads exactly as you would want. For a poster or a heavily designed brochure, use Word's own File → Save as PDF instead.",
  },
  {
    question: "Why can't a browser reproduce the layout exactly?",
    answer:
      "Matching Word page for page means implementing Word's layout engine: its line-breaking, its hyphenation, its table algorithms, and the exact metrics of fonts you may not have installed. Word itself does that when you export a PDF, which is why that route is pixel-perfect and this one is not. What a browser can do well is read the document's content and typeset it properly, which is what this tool does.",
  },
  {
    question: "Does it support the old .doc format?",
    answer:
      "No — only .docx. The two share a name and nothing else: .docx is a zip of XML files, while .doc is a binary format from the 1990s built around a compound-file container. Open the file in Word, Google Docs or LibreOffice and save it as .docx, then convert that.",
  },
  {
    question: "What happens to non-English text?",
    answer:
      "Western European languages — English, French, German, Spanish, Italian, Portuguese, Nordic languages, Polish in part — convert correctly, accents and all. Scripts outside that range, such as Devanagari, Chinese, Japanese, Korean, Arabic, Hebrew, Greek and Cyrillic, cannot be drawn by the standard PDF fonts and are replaced with question marks. The tool counts them and tells you afterwards rather than silently producing a page of nonsense. Embedding a Unicode font would mean shipping several megabytes to every visitor for a case most documents do not hit.",
  },
  {
    question: "Are my images and links kept?",
    answer:
      "Photographs and screenshots embedded in the document are carried into the PDF, scaled to fit the page width. Hyperlinks stay clickable — they are written as real PDF link annotations, not just blue text. Charts, SmartArt and shapes drawn inside Word are stored as vector formats a browser cannot decode; those are skipped and reported in the count.",
  },
  {
    question: "Is my document uploaded anywhere?",
    answer:
      "No. The .docx is unzipped and read inside the tab, and the PDF is assembled in memory on your machine. Nothing is sent to a server, which is the whole point for the kind of file this usually is — a contract, an offer letter, a medical form or a CV.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "50MB, which is far more than a text document ever needs. A Word file that large is almost always carrying high-resolution images; compressing those first will make both the conversion and the resulting PDF considerably faster.",
  },
];

export default function WordToPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="word-to-pdf"
      title="Word to PDF"
      description="Convert a .docx Word document to a clean, shareable PDF — headings, lists, tables, links and images included."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Word to PDF" },
      ]}
      steps={[
        "Drop your .docx file into the box above — it stays on your device.",
        "Pick a page size, typeface and margin width.",
        "Convert, then download the PDF.",
      ]}
      articleContent={
        <>
          <h2>Turning a Word file into something anyone can open</h2>
          <p>
            A .docx renders differently on every machine that opens it. Fonts you
            have and the recipient does not get substituted, line breaks move, and
            a two-page document arrives as three. A PDF freezes the result — it
            looks the same everywhere, it cannot be edited by accident, and every
            phone and browser can display one without installing anything.
          </p>
          <p>
            That is why almost every formal handover — a CV to an employer, an
            invoice to a client, a signed agreement, a form for an office — asks
            for PDF. This tool does that conversion without your document leaving
            the browser.
          </p>

          <h2>How the conversion works</h2>
          <p>
            A .docx is a zip archive of XML. The converter unzips it in the tab
            and reads the document body: which paragraphs are headings, which runs
            are bold or italic, where lists start and nest, what the tables
            contain, which words carry hyperlinks, and which images are embedded.
          </p>
          <p>
            That structure is then typeset onto pages with a PDF library — text is
            wrapped to the column, headings are kept with the text beneath them,
            tables are drawn with borders and repeated down the page, images are
            scaled to fit, and links are written as real annotations so they stay
            clickable in the finished file.
          </p>

          <h2>What comes across, and what does not</h2>
          <p>
            <strong>Carried over:</strong> headings and their hierarchy, ordinary
            paragraphs, bold and italic, ordered and unordered lists including
            nested ones, block quotes, tables, hyperlinks, and embedded
            photographs.
          </p>
          <p>
            <strong>Not carried over:</strong> the specific fonts and colors used
            in Word, headers and footers, page numbers, footnotes, multi-column
            layouts, text boxes, shapes, charts and SmartArt, and manual page
            breaks. The output is a clean re-flow of the document&apos;s content
            rather than a copy of its appearance.
          </p>
          <p>
            That trade is deliberate. Reproducing a Word page exactly requires
            Word&apos;s layout engine and the original fonts, neither of which
            exists in a browser tab. Where exact appearance matters more than
            privacy, Word&apos;s own <em>Save as PDF</em> is the better tool and it
            is worth saying so.
          </p>

          <h2>Choosing your settings</h2>
          <p>
            <strong>Page size</strong> — A4 for most of the world, US Letter for
            North America. If the PDF is going to be printed by someone else,
            match their region rather than yours.
          </p>
          <p>
            <strong>Typeface</strong> — Helvetica reads as a modern sans-serif and
            suits CVs, reports and anything shown on screen. Times is the
            traditional serif choice for essays, legal documents and academic
            submissions.
          </p>
          <p>
            <strong>Margins</strong> — Normal suits nearly everything. Narrow fits
            more onto fewer pages when the document is long. Wide leaves room for
            handwritten notes or binding.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Sending a CV or cover letter in the format employers ask for</li>
            <li>Turning a draft agreement into something that cannot be edited</li>
            <li>Producing a fixed copy of a report before circulating it</li>
            <li>Making a document readable on a phone that has no Word app</li>
            <li>Preparing a file for an upload form that only accepts PDF</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            Everything runs on your device. The document is unzipped, read and
            typeset in the tab, and the PDF is built in memory — nothing is
            uploaded, stored or logged. Word documents tend to hold exactly the
            information you would not want on an unknown server: salaries, medical
            details, contract terms, addresses. Keeping the file local removes that
            question entirely.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <WordToPdfTool />
    </ToolPageShell>
  );
}
