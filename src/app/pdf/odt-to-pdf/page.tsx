import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import OdtToPdfTool from "./OdtToPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "odt-to-pdf",
  title: "ODT to PDF — Convert OpenDocument Text to PDF",
  description:
    "Convert a LibreOffice or OpenOffice .odt document to PDF without uploading it. Keeps headings, lists and tables. Free and runs entirely in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "What is an ODT file?",
    answer:
      "OpenDocument Text — the native format of LibreOffice and OpenOffice, and the international standard (ISO 26300) that many governments and public institutions mandate for documents. Google Docs exports it too. Under the extension it is a zip archive of XML files, which is what makes it readable in a browser without a conversion service.",
  },
  {
    question: "How much of the document survives?",
    answer:
      "Headings and their hierarchy, paragraphs, lists including nested ones, and tables. What does not come across: the specific fonts and colours, headers and footers, page numbering, footnotes, text frames and drawings. The result is a clean re-flow of the document's content rather than a copy of how LibreOffice paints the page.",
  },
  {
    question: "Why not just use LibreOffice's own Export as PDF?",
    answer:
      "If you have LibreOffice open, do exactly that — it will be pixel-exact, because it is the program that laid the document out in the first place. This tool is for when you do not have it: you have been sent an .odt, you are on a machine without an office suite, and you need to read or send it as a PDF right now.",
  },
  {
    question: "Does it work with .ods or .odp?",
    answer:
      "Not yet — this reads OpenDocument Text specifically. Spreadsheets (.ods) and presentations (.odp) use the same container but a completely different content model, and each needs its own reader to be worth anything.",
  },
  {
    question: "What about non-Latin text?",
    answer:
      "Western European languages convert correctly, accents and all. The standard PDF fonts cannot draw Devanagari, Chinese, Japanese, Korean, Arabic, Hebrew, Greek or Cyrillic, so those characters are replaced with question marks and counted, with the total reported after the conversion.",
  },
  {
    question: "Is my document uploaded?",
    answer:
      "No. The archive is unzipped and its XML read inside the tab, and the PDF is built in memory on your machine. Nothing is sent anywhere.",
  },
];

export default function OdtToPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="odt-to-pdf"
      title="ODT to PDF"
      description="Convert a LibreOffice or OpenOffice document into a PDF — headings, lists and tables included."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "ODT to PDF" },
      ]}
      steps={[
        "Drop your .odt file into the box above — it stays on your device.",
        "Choose page size, typeface and margins.",
        "Convert and download the PDF.",
      ]}
      articleContent={
        <>
          <h2>The open standard, converted openly</h2>
          <p>
            OpenDocument Text is what LibreOffice and OpenOffice write by default,
            and it is the format many governments and public bodies require for
            documents precisely because it is an open standard rather than one
            company&apos;s file layout. Google Docs exports it as well.
          </p>
          <p>
            The practical consequence is that people are regularly sent .odt files
            they cannot open — Word handles them inconsistently, phones mostly do
            not, and installing an office suite to read one document is a poor
            trade. Converting to PDF solves it in a few seconds.
          </p>

          <h2>How it works</h2>
          <p>
            An .odt is a zip archive. Inside it, <code>content.xml</code> holds the
            document in OpenDocument&apos;s own XML vocabulary — headings are
            <code> text:h</code> with an outline level, paragraphs are
            <code> text:p</code>, lists are <code>text:list</code>, tables are
            <code> table:table</code>. Those map onto the same structures a PDF
            typesetter needs almost one for one.
          </p>
          <p>
            So the archive is unzipped in the browser, the XML is parsed with the
            browser&apos;s own parser, and the resulting structure is typeset onto
            pages. No conversion library, no upload, no server.
          </p>

          <h2>What comes across</h2>
          <p>
            <strong>Kept:</strong> headings and their hierarchy, paragraphs, lists
            including nested ones, and tables.
          </p>
          <p>
            <strong>Not kept:</strong> fonts and colours, headers and footers,
            page numbering, footnotes, text frames, drawings and charts. As
            everywhere on this site, the output is a clean re-flow of the content
            rather than a facsimile of the original page.
          </p>
          <p>
            If exact appearance is what you need and you have LibreOffice
            available, its own <em>Export as PDF</em> will always beat this,
            because it is the program that laid the document out.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Reading an .odt on a machine with no office suite installed</li>
            <li>Sending a LibreOffice document to someone who only has Word</li>
            <li>Submitting to a portal that accepts PDF only</li>
            <li>Freezing a document so it cannot be edited in transit</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            The file never leaves your device. Given that the format is standard
            in government and legal work, that is exactly the property that
            matters here.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <OdtToPdfTool />
    </ToolPageShell>
  );
}
