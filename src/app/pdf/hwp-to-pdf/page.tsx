import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import HwpToPdfTool from "./HwpToPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "hwp-to-pdf",
  title: "HWP to PDF — Convert an HWPX Document to PDF in Your Browser",
  description:
    "Convert a Hangul Word Processor .hwpx document to PDF without uploading it. Reads paragraphs and tables. Classic binary .hwp is not supported.",
});

const FAQ_ITEMS = [
  {
    question: "My Korean text came out as question marks.",
    answer:
      "It will, and this is the honest limit of the tool. Drawing text in a PDF requires a font that contains those glyphs. The fourteen standard PDF fonts cover Western European characters only — they contain no Hangul at all. Producing Korean output means embedding a Korean font, which is several megabytes downloaded to every visitor, and that is not shipped here. If your document is genuinely Korean, use Hangul's own PDF export.",
  },
  {
    question: "Why won't it open my .hwp file?",
    answer:
      "Because .hwp and .hwpx are completely different formats that share a name. HWPX is a zip of XML, readable with the tools a browser already has. The classic .hwp is a Microsoft compound-file container holding zlib-compressed records in Hancom's own record layout, with optional encryption — a dedicated parser, not something a browser can do. The tool rejects it by name rather than failing later with a confusing error.",
  },
  {
    question: "How do I convert a .hwp to .hwpx?",
    answer:
      "Open it in Hangul and choose Save As, picking HWPX. Recent versions of Hangul write HWPX by default. Some online converters will do it too, though that means uploading the document — which rather defeats the point of converting locally afterwards.",
  },
  {
    question: "What survives the conversion?",
    answer:
      "Paragraph text and tables. Fonts, colours, headers, footers, images and drawing objects do not — as with every document converter here, the output is a clean re-flow of the content rather than a copy of the page. Character formatting like bold and italic is stored in a property table referenced by id rather than on the text itself, and is not resolved.",
  },
  {
    question: "Is my document uploaded?",
    answer:
      "No. The archive is unzipped and its XML parsed inside your browser. HWP files are common in government and legal work in Korea, where that guarantee matters.",
  },
];

export default function HwpToPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="hwp-to-pdf"
      title="HWP to PDF"
      description="Convert a Hangul Word Processor .hwpx document into a PDF — paragraphs and tables included."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "HWP to PDF" },
      ]}
      steps={[
        "Drop your .hwpx file into the box above — it stays on your device.",
        "Choose page size, typeface and margins.",
        "Convert and download the PDF.",
      ]}
      articleContent={
        <>
          <h2>Two formats, one name</h2>
          <p>
            Hangul Word Processor is the standard word processor in South Korea,
            and its documents are everywhere in Korean government, legal and
            academic work. People outside that world usually meet an HWP file the
            same way: someone sends one, and nothing they own will open it.
          </p>
          <p>
            There are two formats behind the name. <strong>HWPX</strong>, from
            2010 onwards, is a zip of XML in the OWPML schema — the same shape as
            .docx, .xlsx and .odt, and readable with the tools a browser already
            has. The classic <strong>.hwp</strong> is a Microsoft compound-file
            container holding zlib-compressed records in Hancom&apos;s own
            layout, with optional encryption. That one needs a dedicated parser
            and is refused here by name rather than failing halfway with an
            unhelpful error.
          </p>

          <h2>The font problem, stated plainly</h2>
          <p>
            An HWP document is almost always Korean, and this is where the tool
            runs into a wall that no amount of parsing fixes.
          </p>
          <p>
            Drawing text into a PDF needs a font containing those glyphs. The
            fourteen standard PDF fonts — the ones every reader has built in, and
            the reason a PDF made here is a few kilobytes rather than a few
            megabytes — cover Western European characters and contain no Hangul
            whatsoever. Korean text therefore converts to question marks.
          </p>
          <p>
            Fixing that means embedding a Korean font, and a font with full
            Hangul coverage is several megabytes that every visitor to the site
            would download. That is a real trade, and the choice here is to be
            clear about the limit rather than ship the weight. For a genuinely
            Korean document, Hangul&apos;s own PDF export is the right tool.
          </p>

          <h2>What it is good for</h2>
          <p>
            An HWPX whose content is Latin script — an English report written in
            Hangul, a document of names, codes, numbers or tables — converts
            cleanly, and that is a real case for anyone who receives HWP files
            and does not own the software.
          </p>
          <p>
            It is also a way to see what is inside a file you otherwise cannot
            open at all: paragraphs and tables come through, so the structure and
            any Latin-script content are recoverable.
          </p>

          <h2>Privacy</h2>
          <p>
            The document is unzipped and read entirely in your browser. Nothing
            is uploaded, which is the point when the file came from a government
            or legal process.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <HwpToPdfTool />
    </ToolPageShell>
  );
}
