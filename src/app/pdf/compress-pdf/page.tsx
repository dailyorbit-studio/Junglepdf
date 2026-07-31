import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import CompressPdfTool from "./CompressPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "compress-pdf",
  title: "Compress PDF — Reduce PDF File Size",
  description:
    "Shrink a PDF by rewriting its internal structure and stripping unused objects and metadata. Runs in your browser, and returns the original if the rewrite is larger.",
});

const FAQ_ITEMS = [
  {
    question: "How much smaller will my PDF get?",
    answer:
      "It depends entirely on what's inside. Files carrying structural bloat from repeated edits can drop 20–40%. Text-only PDFs may only shrink 5–15%. Files that are already tight may not shrink at all — see below.",
  },
  {
    question: "Will this compress the images in my PDF?",
    answer:
      "No. This is a structural optimization: it re-serializes the document with object streams and drops objects orphaned by earlier edits. Re-encoding embedded images requires a full rendering pipeline that pdf-lib doesn't provide. If your PDF is large because of high-resolution scans, expect only modest gains.",
  },
  {
    question: "Does compression affect text quality?",
    answer:
      "No. Text in PDFs is stored as vector data, which is resolution-independent. Nothing about the page rendering changes — only the internal object structure and metadata.",
  },
  {
    question: "Can I compress a password-protected PDF?",
    answer:
      "No. If the PDF requires a password to open, the tool cannot read it and will say so. Remove the password protection in your PDF reader first, then compress the unprotected version.",
  },
  {
    question: "What if the compressed file comes out larger?",
    answer:
      "That happens with already-optimized files, and the tool handles it: it compares the result against the original and hands back the original untouched, with a notice explaining why. You'll never get a 'compressed' file that's bigger than what you started with.",
  },
];

export default function CompressPDFPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="compress-pdf"
      title="Compress PDF"
      description="Reduce your PDF file size by stripping metadata and optimizing the internal document structure. No uploads — runs in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Compress PDF" },
      ]}
      articleContent={
        <>
          <h2>How PDF compression works in the browser</h2>
          <p>
            This tool uses pdf-lib to load your PDF and re-serialize it using
            object streams — a more compact internal format that groups small
            objects together and compresses them as a single unit. It also
            copies all pages into a fresh document, which eliminates orphaned
            objects left behind by previous edits, and drops document metadata.
          </p>
          <p>
            The result is a structurally cleaner PDF. How much smaller it
            actually gets depends entirely on how much structural bloat the
            original carried.
          </p>
          <h2>What this tool does not do</h2>
          <p>
            It does not re-encode images. That&apos;s worth being clear about,
            because image data is what makes most large PDFs large. Genuinely
            compressing a scanned document means rasterizing each page,
            re-encoding the bitmaps at lower quality, and rebuilding the file —
            a rendering pipeline that pdf-lib doesn&apos;t include. If your PDF
            is mostly high-resolution scans, expect single-digit gains.
          </p>
          <p>
            Where this tool does help is documents that have been edited,
            merged, or re-saved repeatedly, accumulating orphaned objects and
            redundant cross-references along the way.
          </p>
          <h2>When the result is bigger</h2>
          <p>
            Re-serialization can inflate a file that was already written
            efficiently. When that happens the tool returns your original file
            unchanged and tells you why, rather than reporting a 0% reduction
            over a file it quietly made worse.
          </p>
          <h2>What stays the same</h2>
          <p>
            All visible content is preserved. Text, images, vector graphics,
            and page-level annotations appear exactly as they did in the
            original. Two document-level structures cannot survive the page
            copy: bookmarks and interactive form fields. The tool detects
            these and warns you before you download.
          </p>
          <p>
            The entire process runs in your browser. Your PDF file is
            read into memory, processed by pdf-lib&apos;s JavaScript engine,
            and the output is generated locally. Nothing is sent to any server.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <CompressPdfTool />
    </ToolPageShell>
  );
}
