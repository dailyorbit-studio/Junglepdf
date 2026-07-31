import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import MergePdfTool from "./MergePdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "merge-pdf",
  title: "Merge PDF — Combine Multiple PDFs Into One",
  description:
    "Combine several PDF files into one document, in any order you choose. Up to 20 files at a time, entirely in your browser — nothing is uploaded to a server.",
});

const FAQ_ITEMS = [
  {
    question: "How many PDFs can I merge at once?",
    answer:
      "Up to 20 PDF files in a single operation, each up to 100MB. If you add more than the remaining slots allow, the tool tells you how many it took. To merge more, work in batches.",
  },
  {
    question: "Does merging preserve bookmarks and form fields?",
    answer:
      "Page content — text, images, vector graphics, and page-level annotations — is copied faithfully. Document-level structures are not: the outline (bookmarks) and interactive form fields live on the document catalog rather than the pages, and cannot be carried across. The tool detects these before merging and warns you when your files contain them.",
  },
  {
    question: "Can I change the page order?",
    answer:
      "Yes. After adding your files, use the up and down controls to arrange them. The merged PDF follows that order, with all pages from each file included in sequence.",
  },
  {
    question: "What about password-protected PDFs?",
    answer:
      "Encrypted PDFs can't be read. The tool names the specific file and tells you to remove its password first, rather than failing with a generic error.",
  },
  {
    question: "Are the files uploaded to a server?",
    answer:
      "No. The merge runs entirely in your browser using the pdf-lib library. Your PDF files are read into memory, processed locally, and the merged result is generated on your device. Nothing is transmitted over the network.",
  },
];

export default function MergePDFPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="merge-pdf"
      title="Merge PDF"
      description="Combine multiple PDF files into a single document. Arrange the order, then merge. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Merge PDF" },
      ]}
      articleContent={
        <>
          <h2>How PDF merging works in the browser</h2>
          <p>
            This tool uses the open-source pdf-lib library to read each PDF
            file you add, extract every page, and copy them into a new
            combined document. Text, images, vector graphics, and annotations
            attached to individual pages all carry over to the merged output.
          </p>
          <p>
            Because pdf-lib runs entirely in JavaScript, the merge happens
            in your browser&apos;s memory. There&apos;s no server involved.
            Your documents are never transmitted over the internet, which
            makes this safe for confidential or sensitive files.
          </p>
          <h2>What a merge cannot carry across</h2>
          <p>
            A PDF stores some things on individual pages and others on the
            document as a whole. Page-level content copies cleanly. Two
            document-level structures do not: the outline tree that produces
            bookmarks, and the AcroForm dictionary that makes form fields
            interactive.
          </p>
          <p>
            When those exist in your input files, copying pages into a fresh
            document leaves them behind — filled-in form values would become
            flat, non-interactive content. Rather than let that happen
            silently, the tool inspects each file first and shows a warning
            alongside the result. If you need to preserve a filled form,
            flatten it in your PDF reader before merging.
          </p>
          <h2>When to use PDF merging</h2>
          <ul>
            <li>Combining scanned documents into a single file for archiving</li>
            <li>Assembling a report from separate chapters or sections</li>
            <li>Merging signed contracts with appendices</li>
            <li>Creating a single submission file from multiple forms</li>
          </ul>
          <h2>File order and page sequence</h2>
          <p>
            The merged PDF follows the order you arrange your files in. Use
            the up and down controls to rearrange before merging. All pages
            from each file are included in sequence — there&apos;s no option
            to select individual pages during a merge. If you need to extract
            specific pages first, use the Split PDF tool.
          </p>
          <p>
            The tool handles up to 20 files at a time, each up to 100MB.
            Processing time depends on the total page count and your
            device&apos;s available memory.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <MergePdfTool />
    </ToolPageShell>
  );
}
