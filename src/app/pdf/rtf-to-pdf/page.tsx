import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import RtfToPdfTool from "./RtfToPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "rtf-to-pdf",
  title: "RTF to PDF — Convert Rich Text Format to PDF in Your Browser",
  description:
    "Convert an .rtf document to PDF without uploading it. Keeps paragraphs, bold and italic. Free, no sign-up, runs entirely in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "What is an RTF file?",
    answer:
      "Rich Text Format is Microsoft's interchange format from the late 1980s — a plain-text control language that carries basic formatting. It exists so documents can move between programs that share nothing else, which is why WordPad, TextEdit, older accounting systems and many legal and government workflows still produce it.",
  },
  {
    question: "How much formatting survives?",
    answer:
      "Paragraphs, bold and italic, and explicit page breaks. Fonts, colors, tables and embedded images do not. RTF stores images as hex-encoded blobs in a private format, and the file's font and colour tables refer to fonts your machine may not have — so the output is a clean re-flow of the text, not a copy of the original's appearance.",
  },
  {
    question: "Why does my file say it is missing the RTF header?",
    answer:
      "Every RTF file begins with the literal characters {\\rtf. If yours does not, it is a different format wearing an .rtf extension — most often a .doc or .docx that was renamed. Open it in Word or WordPad and save it again, choosing Rich Text Format explicitly.",
  },
  {
    question: "What about non-English text?",
    answer:
      "The parser reads RTF's escape sequences, including its Unicode runs, so accented Western European text converts correctly. Scripts outside cp1252 — Devanagari, Chinese, Japanese, Arabic, Greek, Cyrillic — cannot be drawn by the standard PDF fonts and are replaced with question marks, with the count reported afterwards.",
  },
  {
    question: "Should I use this or convert to Word first?",
    answer:
      "If your RTF is mostly text, convert directly here. If it contains tables or images you need to keep, open it in Word or LibreOffice, save as .docx, and use the Word to PDF tool instead — that path carries tables and pictures across.",
  },
  {
    question: "Is the file uploaded?",
    answer:
      "No. RTF is parsed and the PDF written entirely in your browser. Given that RTF turns up most often in legal and administrative work, that is the point.",
  },
];

export default function RtfToPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="rtf-to-pdf"
      title="RTF to PDF"
      description="Convert a Rich Text Format document into a PDF, keeping paragraphs and basic formatting."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "RTF to PDF" },
      ]}
      steps={[
        "Drop your .rtf file into the box above — it stays on your device.",
        "Choose page size, typeface and margins.",
        "Convert and download the PDF.",
      ]}
      articleContent={
        <>
          <h2>A format that refuses to die, for good reasons</h2>
          <p>
            Rich Text Format is nearly forty years old and still turns up
            constantly, because it solves a problem nothing else quite does: it
            carries basic formatting in a file that is fundamentally plain text,
            readable by almost any word processor ever written, on any platform.
          </p>
          <p>
            That makes it the safe export option for systems that cannot assume
            what the recipient runs — case management software, older accounting
            packages, government forms, WordPad on Windows and TextEdit on Mac.
            The result is a file people are handed regularly and cannot always
            open conveniently, which is where converting to PDF helps.
          </p>

          <h2>How it is read</h2>
          <p>
            Because RTF is a control language rather than a binary container, it
            can be parsed directly in the browser without a conversion library.
            The reader walks the file&apos;s nested groups, tracks bold and italic
            state, decodes its character escapes and Unicode runs, and skips the
            sections that hold metadata rather than document text — font tables,
            colour tables, stylesheets, embedded objects.
          </p>
          <p>
            Unrecognised control words are ignored, which is the format&apos;s own
            rule: readers are expected to skip what they do not understand rather
            than fail. That is what lets a partial reader handle real-world files
            written by a dozen different programs.
          </p>

          <h2>What you get, and what you do not</h2>
          <p>
            <strong>Kept:</strong> the text, its paragraph structure, bold and
            italic runs, and any explicit page breaks the file contains.
          </p>
          <p>
            <strong>Not kept:</strong> fonts and colours, tables, embedded
            images, headers, footers and footnotes. If your document leans on
            those, the better route is to open it in Word or LibreOffice, save as
            .docx, and use the Word to PDF tool — that path carries tables and
            pictures.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Turning an RTF export from a legacy system into a shareable PDF</li>
            <li>Sending a WordPad or TextEdit document to someone without Word</li>
            <li>Filing a document where only PDF is accepted</li>
            <li>Freezing a draft so it cannot be edited by accident</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            Everything happens on your device. The RTF is parsed in the tab and
            the PDF is assembled in memory — nothing is uploaded, stored or
            logged.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <RtfToPdfTool />
    </ToolPageShell>
  );
}
