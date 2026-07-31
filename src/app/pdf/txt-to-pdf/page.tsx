import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import TxtToPdfTool from "./TxtToPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "txt-to-pdf",
  title: "TXT to PDF — Convert a Text File to PDF in Your Browser",
  description:
    "Turn a .txt, .log, .md or .csv file into a clean, paginated PDF. Choose page size, typeface and margins. Runs in your browser — no uploads, no sign-up.",
});

const FAQ_ITEMS = [
  {
    question: "What is the difference between the two line modes?",
    answer:
      "A text file gives no indication of whether a line break is meaningful. \"Join wrapped lines\" treats a blank line as the paragraph boundary and reflows everything between, which is right for prose that was hard-wrapped at 80 characters. \"Keep every line break\" makes each line its own line in the PDF, which is right for logs, code, addresses, poetry and anything tabular. If your output looks like one endless paragraph, switch to the second mode.",
  },
  {
    question: "Can it handle a very large log file?",
    answer:
      "Up to 25MB, which is several hundred thousand lines. It is worth knowing that this produces a correspondingly enormous PDF — a 10MB log is a few thousand pages. Everything runs in the tab, so a file that big will take a moment and use real memory.",
  },
  {
    question: "Does it keep bullet points and numbering?",
    answer:
      "Yes, where they are recognisable. A run of lines beginning with -, *, • or 1. is set as a proper indented list with hanging indents, rather than being reflowed into a paragraph. Mixed content is treated as prose.",
  },
  {
    question: "What happens to non-English characters?",
    answer:
      "Western European text converts correctly, accents included. The standard PDF fonts cover cp1252 only, so scripts like Devanagari, Chinese, Japanese, Arabic, Hebrew, Greek and Cyrillic cannot be drawn and are replaced with question marks. The tool counts them and tells you afterwards rather than failing silently.",
  },
  {
    question: "Will a CSV come out as a table?",
    answer:
      "No — it comes out as text, one row per line, using \"keep every line break\". Columns will not align, because a proportional typeface gives every character a different width. For a real table, convert the CSV in a spreadsheet program first.",
  },
  {
    question: "Is my file uploaded?",
    answer:
      "No. The text is read and the PDF assembled entirely inside your browser. Log files and notes are exactly the sort of thing that should not be pasted into an unknown server.",
  },
];

export default function TxtToPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="txt-to-pdf"
      title="TXT to PDF"
      description="Turn a plain text file into a clean, paginated PDF with the page size and typeface you choose."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "TXT to PDF" },
      ]}
      steps={[
        "Drop your text file into the box above — it stays on your device.",
        "Pick how line breaks should be treated, then set page size and margins.",
        "Convert and download the PDF.",
      ]}
      articleContent={
        <>
          <h2>Why convert text to PDF at all</h2>
          <p>
            A .txt file has no formatting, no page boundaries and no guaranteed
            appearance — it renders differently in every editor, at whatever font
            and width that editor happens to use. A PDF fixes all of that. It
            paginates, it prints predictably, and it opens the same way on every
            device without anyone needing a text editor.
          </p>
          <p>
            That matters most when a text file has to become a document someone
            else receives: a log attached to a support ticket, notes submitted
            with an application, a README included in a deliverable, or a
            transcript that needs to be filed.
          </p>

          <h2>The one setting that matters</h2>
          <p>
            Plain text does not record whether a line break was the author&apos;s
            intent or just where the line ran out. That single ambiguity is why
            this tool asks.
          </p>
          <p>
            <strong>Join wrapped lines</strong> reflows the text, treating a blank
            line as the real paragraph break. A file that was hard-wrapped at 80
            characters becomes proper flowing paragraphs that fill the page width.
          </p>
          <p>
            <strong>Keep every line break</strong> preserves the file exactly as
            written. Use it for log files, source code, addresses, poetry, or
            anything where a line is a unit of meaning.
          </p>

          <h2>What the layout does for you</h2>
          <p>
            Text is set at 11pt with automatic word wrapping and pagination. Tabs
            become four spaces so indentation survives. Runs of lines starting
            with a dash, bullet or number are recognised and set as proper lists
            with hanging indents. Windows, Mac and Unix line endings are all
            normalised, so a file that came from another platform does not draw
            stray boxes.
          </p>
          <p>
            You choose A4 or US Letter, a sans-serif or serif typeface, and one of
            three margin widths. Narrow margins fit noticeably more onto fewer
            pages, which is worth having on a long log.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Attaching a log file to a ticket in a readable, paginated form</li>
            <li>Turning notes or a draft into something printable</li>
            <li>Submitting a plain text document where only PDF is accepted</li>
            <li>Archiving text with fixed pagination for reference</li>
            <li>Converting a Markdown file into a shareable document</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            The file is read with the browser&apos;s own file API and the PDF is
            built in memory on your machine. Nothing is uploaded, stored or
            logged.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <TxtToPdfTool />
    </ToolPageShell>
  );
}
