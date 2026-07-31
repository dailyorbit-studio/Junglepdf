import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import PdfToPngTool from "./PdfToPngTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "pdf-to-png",
  title: "PDF to PNG — Convert PDF Pages to Lossless PNG",
  description:
    "Render PDF pages as lossless PNG images at up to 300 DPI. Sharper than JPG on text and diagrams. Everything runs in your browser — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Should I use PNG or JPG for my PDF?",
    answer:
      "PNG if the pages are text, tables, diagrams or screenshots — it stays sharp. JPG if they are photographs or scans of photographs, where the files come out far smaller with no visible difference.",
  },
  {
    question: "Why are the files so large?",
    answer:
      "PNG stores every pixel exactly rather than approximating. That is the point of it, but on a full-page render it adds up quickly. Lowering the DPI is the most effective way to bring the size down; switching to JPG is the other.",
  },
  {
    question: "Will the PNG have a transparent background?",
    answer:
      "Usually not. Most PDF pages paint a white background, and the renderer draws what the page declares. You would only get transparency from a PDF that was deliberately authored without a background.",
  },
  {
    question: "Can I pick which pages to convert?",
    answer:
      "Yes — switch to specific pages and enter numbers and ranges, like 2, 5-9. On a long document that is much faster than rendering everything.",
  },
  {
    question: "Is anything uploaded?",
    answer:
      "No. pdf.js renders the pages to a canvas in your browser and the browser encodes the PNGs. Your document never leaves the tab.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="pdf"
      slug="pdf-to-png"
      title="PDF to PNG"
      description="Render each page as a lossless PNG — no compression artefacts on text or line art."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "PDF to PNG" },
      ]}
      steps={[
        "Drop in a PDF",
        "Pick a resolution",
        "Convert, then download the images",
      ]}
      articleContent={
        <>
          <h2>Lossless, and what that buys you</h2>
          <p>
            PNG compression is exact. Every pixel that comes out of the renderer is the
            pixel you get back, which matters most for the things PDFs are usually full
            of: text, tables, charts and line drawings.
          </p>
          <p>
            JPG reconstructs an approximation instead, and its errors cluster exactly
            where the contrast is highest. On a page of black text that means faint grey
            halos around the letterforms. At 300 DPI you may never notice; at 72 DPI on a
            dense page it is obvious.
          </p>
          <h2>The trade-off is file size</h2>
          <p>
            PNG files from a text page are typically two to five times larger than the
            JPG equivalent, and on a photographic page the gap widens dramatically — a
            scanned photograph can be ten times the size as PNG.
          </p>
          <p>
            So the rule is straightforward: PNG for pages that are mostly text, diagrams
            or screenshots, JPG for pages that are mostly photographs. If a document is
            a mix and size matters, JPG at a higher DPI often beats PNG at a lower one.
          </p>
          <h2>Transparency</h2>
          <p>
            PDF pages usually declare a white background, and that is what gets rendered.
            A PNG from this tool will therefore have a white background rather than a
            transparent one in almost every case — the transparency PNG supports is
            available, but the page has to actually be transparent for it to appear.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <PdfToPngTool />
    </ToolPageShell>
  );
}
