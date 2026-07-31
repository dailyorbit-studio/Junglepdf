import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import SplitPdfTool from "./SplitPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "split-pdf",
  title: "Split PDF — Extract Pages from PDF",
  description:
    "Split a PDF into separate files by page or page range, or pull out a single section. Everything happens in your browser, so confidential documents never leave it.",
});

const FAQ_ITEMS = [
  {
    question: "What page range format should I use?",
    answer:
      "Comma-separated ranges like '1-3, 5, 7-10'. Each range becomes a separate PDF. Single numbers extract individual pages. Page numbers start at 1, and anything outside your document's range is rejected with an explanation.",
  },
  {
    question: "Can I extract just one page?",
    answer:
      "Yes. Enter a single page number (like '3') to extract just that one page as its own PDF file.",
  },
  {
    question: "What happens to the original file?",
    answer:
      "Nothing — the original is only read, never modified. The split creates new PDF files from copies of the selected pages.",
  },
  {
    question: "Are bookmarks and form fields kept?",
    answer:
      "Page content and page-level annotations are copied. Bookmarks and interactive form fields are stored on the document rather than on pages, so they can't survive an extraction. The tool checks for them and warns you when your file has them.",
  },
  {
    question: "Is there a page limit?",
    answer:
      "The tool works with PDFs of any page count. Processing time scales with the number of pages being extracted. Files up to 100MB are supported.",
  },
];

export default function SplitPDFPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="split-pdf"
      title="Split PDF"
      description="Extract specific pages or ranges from a PDF and download them as separate files. Enter ranges like 1-3, 5, 7-10."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Split PDF" },
      ]}
      articleContent={
        <>
          <h2>How PDF splitting works</h2>
          <p>
            The split tool loads your PDF using the pdf-lib JavaScript
            library, reads the total page count, and lets you specify which
            pages to extract. Each page range you enter becomes a separate
            output file. The tool copies the selected pages into new PDF
            documents, preserving page content, formatting, and embedded
            media.
          </p>
          <p>
            The original file is never modified — the tool only reads it.
            All new files are generated from copies of the relevant pages.
          </p>
          <h2>Page range syntax</h2>
          <ul>
            <li><strong>Single page</strong>: Enter &quot;5&quot; to extract just page 5</li>
            <li><strong>Range</strong>: Enter &quot;1-3&quot; to extract pages 1 through 3 as one file</li>
            <li><strong>Multiple ranges</strong>: Enter &quot;1-3, 5, 8-10&quot; to create three separate files</li>
          </ul>
          <p>
            Malformed input is rejected rather than guessed at. A range like
            &quot;1-3-5&quot; is a typo, not a valid range, so the tool asks
            you to fix it instead of quietly reading it as 1–3.
          </p>
          <h2>Use cases</h2>
          <p>
            Common reasons to split a PDF include extracting a single page
            from a multi-page scanned document, separating chapters of a
            long report for individual distribution, or pulling out specific
            forms from a packet. The tool is also useful for removing
            unnecessary pages before sharing a document — split out only
            the pages you need, and the rest stays behind.
          </p>
          <p>
            Processing happens entirely in your browser. Your PDF data
            never leaves your device. This is safe for confidential
            documents, contracts, medical records, and any other sensitive
            files.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <SplitPdfTool />
    </ToolPageShell>
  );
}
