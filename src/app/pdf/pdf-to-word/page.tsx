import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import PdfToWordTool from "./PdfToWordTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "pdf-to-word",
  title: "PDF to Word — Convert PDF to Editable DOCX in Your Browser",
  description:
    "Convert a PDF into an editable Word document without uploading it. Rebuilds paragraphs, headings and lists, and strips repeated headers. Free, no sign-up.",
});

const FAQ_ITEMS = [
  {
    question: "Will the Word file look exactly like the PDF?",
    answer:
      "No. What you get is the document's text rebuilt as editable paragraphs, headings and lists — not a facsimile of the page. A PDF does not record that a run of glyphs is a paragraph, or that a block of them is a table; it records where each character was drawn. Everything this tool produces is inferred from those positions, which works well for ordinary prose and progressively less well as the layout gets more elaborate.",
  },
  {
    question: "My PDF came back with an error saying no text was found. Why?",
    answer:
      "Because it is a scan. A PDF exported from Word or printed from a browser contains real text objects. A PDF produced by a scanner or a phone camera contains a photograph of a page — there is no text in the file at all. Converting that would need OCR, which this tool deliberately does not do. An easy check: open the PDF in any reader and try to select a word. If you cannot, there is nothing to convert.",
  },
  {
    question: "Why don't you support OCR?",
    answer:
      "OCR in a browser means tesseract.js: several megabytes of WebAssembly plus a trained model for every language, downloaded before the first character appears. That is an order of magnitude heavier than anything else on this site and still worse than a desktop tool. Saying so plainly is more useful than shipping something that half works.",
  },
  {
    question: "What happens to tables?",
    answer:
      "Their contents come across as text, in the order the PDF stores them, but they do not become Word tables. Table structure is not written into a PDF — the borders you see are drawn lines and the cells are just text at coordinates. Reconstructing a grid from that is guesswork, and a wrong guess is worse than plain text you can put into a table yourself.",
  },
  {
    question: "What does \"rejoin wrapped lines\" do?",
    answer:
      "A PDF stores every visual line separately, so a paragraph that wrapped over four lines arrives as four fragments. With this on, the fragments are merged back into one editable paragraph, using the line's ending position, the vertical gap and the punctuation to decide where the paragraph really ended. Turn it off for forms, addresses, poetry or code, where each line is meant to stay a line.",
  },
  {
    question: "How does it know what a heading is?",
    answer:
      "By relative size. The tool measures which size most of the document's text is set in, then treats anything meaningfully larger as a heading — the bigger the jump, the higher the level. Short lines that are entirely bold are treated as headings too. They come out mapped to Word's own Heading 1–3 styles, so the navigation pane and table of contents work.",
  },
  {
    question: "Is my PDF uploaded anywhere?",
    answer:
      "No. pdf.js reads the document inside your browser and the .docx is zipped together in memory on your machine. Nothing is transmitted. That matters here more than on most tools — the PDFs people most want to edit are contracts, statements, letters and reports.",
  },
];

export default function PdfToWordPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="pdf-to-word"
      title="PDF to Word"
      description="Convert a PDF into an editable .docx — paragraphs, headings and lists rebuilt from the page."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "PDF to Word" },
      ]}
      steps={[
        "Drop your PDF into the box above — it stays on your device.",
        "Choose how paragraphs and page breaks should be handled.",
        "Convert, then download the .docx and open it in Word.",
      ]}
      articleContent={
        <>
          <h2>Getting text back out of a PDF</h2>
          <p>
            PDF is a final format. It was designed to fix a document&apos;s
            appearance so it survives being sent anywhere, and it does that by
            recording where every character sits on the page. What it does not
            record is the structure underneath — which characters formed a
            sentence, where one paragraph ended, which line was a heading.
          </p>
          <p>
            That is why editing a PDF directly is awkward, and why converting one
            back to Word is a reconstruction rather than a translation. This tool
            reads the text layer with pdf.js, groups the glyph runs into lines,
            works out where paragraphs and headings were, and writes the result as
            a real .docx you can open and edit.
          </p>

          <h2>What it rebuilds</h2>
          <p>
            <strong>Paragraphs.</strong> Lines that belong to the same paragraph
            are merged back together, using the gap between baselines, whether the
            previous line reached the right margin, and how the line ends. Words
            hyphenated across a line break are rejoined.
          </p>
          <p>
            <strong>Headings.</strong> The most common text size in the document
            is taken as the body size, and anything meaningfully larger becomes a
            Word heading — mapped to the built-in Heading 1, 2 and 3 styles, so
            Word&apos;s navigation pane and automatic tables of contents work.
          </p>
          <p>
            <strong>Lists.</strong> Bullets and numbers at the start of a line are
            recognised and turned into real Word list paragraphs, with each list
            getting its own numbering so a second list does not carry on counting
            from the first.
          </p>
          <p>
            <strong>Page size.</strong> The .docx inherits the PDF&apos;s page
            dimensions, so an A4 document opens as A4 rather than defaulting to US
            Letter.
          </p>

          <h2>Repeated headers and footers</h2>
          <p>
            A running head or a page number appears on every page of the PDF, and
            in a re-flowed document it lands in the middle of your text every few
            hundred words. The converter looks at the top and bottom of every
            page, finds the lines that repeat across most of them — comparing with
            digits masked out, so &quot;Page 4 of 30&quot; matches &quot;Page 5 of
            30&quot; — and removes them, telling you how many it took out.
          </p>
          <p>
            It only does this on documents of three pages or more, where the
            pattern is meaningful, and you can switch it off if the repeated line
            is content you want to keep.
          </p>

          <h2>What does not come across</h2>
          <p>
            Tables become text rather than Word tables. Images, charts and drawings
            are not carried over. Exact fonts, colors and positions are replaced by
            ordinary Word styles. Multi-column pages are read in the order the PDF
            stores them, which for an academic paper often means reading across
            both columns rather than down one.
          </p>
          <p>
            None of that is an oversight — those are the parts a PDF genuinely does
            not describe well enough to recover. The output is a working draft to
            edit, which is what people converting a PDF to Word almost always
            want.
          </p>

          <h2>Not OCR</h2>
          <p>
            <strong>This reads the text that is already in the file.</strong> If
            your PDF is a scan or a photograph of a page, there is no text in it —
            a person reading it on screen is doing character recognition with their
            eyes, and the computer has no equivalent unless something has run OCR
            and written a text layer back in. The tool detects that case and says
            so rather than handing you an empty document.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Editing a report whose original Word file is long gone</li>
            <li>Updating a contract or template you only have as a PDF</li>
            <li>Reusing text from a paper without retyping it</li>
            <li>Getting a CV back into an editable form to tailor it</li>
            <li>Pulling a long document into a format you can track changes in</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            Everything runs on your device. The PDF is parsed in the tab and the
            Word file is assembled in memory — nothing is uploaded, stored or
            logged. Given what tends to be locked inside a PDF, that is the point.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <PdfToWordTool />
    </ToolPageShell>
  );
}
