import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import PdfToJpgTool from "./PdfToJpgTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "pdf-to-jpg",
  title: "PDF to JPG — Convert PDF Pages to JPG Images",
  description:
    "Turn every page of a PDF into a JPG image at 72, 150 or 300 DPI. Multiple pages arrive as a ZIP. Runs entirely in your browser — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "What resolution should I pick?",
    answer:
      "150 DPI for anything you will look at on a screen, 300 DPI if it will be printed or you need to zoom in. 72 DPI is only really useful for thumbnails. Higher is not automatically better — 300 DPI on a long document produces very large files and takes noticeably longer.",
  },
  {
    question: "Why do the letters look slightly fuzzy?",
    answer:
      "Two possible reasons. Either the DPI is too low for the text size, or JPG compression is showing on the sharp edges. Raise the DPI first; if it persists, this is a page that wants PNG rather than JPG.",
  },
  {
    question: "Can I convert only some of the pages?",
    answer:
      "Yes. Switch from every page to specific pages and enter numbers and ranges separated by commas, such as 1-3, 7, 12-15. This is much faster than converting a long document and discarding most of it.",
  },
  {
    question: "Does this work on a scanned PDF?",
    answer:
      "Yes, and it is one of the better uses. A scanned page is already an image inside the PDF, so rendering it out to JPG is close to a straight extraction. Text-based PDFs are also fine — they get drawn to a canvas first.",
  },
  {
    question: "Is my PDF uploaded to a server?",
    answer:
      "No. Pages are rendered by pdf.js inside your browser and encoded to JPG by the browser itself. Nothing is transmitted at any point.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="pdf"
      slug="pdf-to-jpg"
      title="PDF to JPG"
      description="Render each page as a JPG at the resolution you choose."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "PDF to JPG" },
      ]}
      steps={[
        "Drop in a PDF",
        "Pick a resolution and quality",
        "Convert, then download the images",
      ]}
      articleContent={
        <>
          <h2>JPG or PNG?</h2>
          <p>
            JPG is the right choice when the pages are photographs, scans or anything
            with continuous tone. Its compression is designed for that kind of image and
            the files come out several times smaller than the equivalent PNG.
          </p>
          <p>
            It is the wrong choice for pages that are mostly text, line art or diagrams.
            JPG works by discarding high-frequency detail, and sharp black-on-white edges
            are nothing but high-frequency detail — you get the faint halos around
            letters known as ringing. For those pages, use PDF to PNG instead.
          </p>
          <h2>What DPI actually controls</h2>
          <p>
            DPI here decides how many pixels each page is rendered into. An A4 page at 72
            DPI is about 595 × 842 pixels, at 150 DPI about 1240 × 1754, and at 300 DPI
            about 2480 × 3508.
          </p>
          <p>
            72 is fine for a thumbnail or a quick preview. 150 is the sensible default
            for reading on screen and for most re-use. 300 is print resolution and worth
            it when the image will be printed or when you need to zoom into fine detail —
            but it is four times the pixels of 150, so expect it to be slower and much
            larger.
          </p>
          <h2>Why several pages arrive as a ZIP</h2>
          <p>
            Browsers block a rapid series of downloads after the first few, as an
            anti-abuse measure. A 40-page document would silently deliver three or four
            images and then stop, which looks exactly like a broken tool.
          </p>
          <p>
            Bundling into a single archive avoids that entirely. A single-page PDF is
            handed to you as a plain image, since there is nothing to bundle.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <PdfToJpgTool />
    </ToolPageShell>
  );
}
