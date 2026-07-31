import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import PdfToImagesTool from "./PdfToImagesTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "pdf-to-images",
  title: "PDF to Images — Convert PDF Pages to PNG or JPG",
  description:
    "Export every page of a PDF as a PNG or JPG at up to 300 DPI, bundled as a ZIP. Runs entirely in your browser — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "What resolution should I choose?",
    answer:
      "150 DPI is the right default for anything that will be looked at on a screen — it is sharp on a high-density display and produces manageable file sizes. 72 DPI matches the PDF's own internal units and gives you the smallest files, useful for thumbnails or previews. 300 DPI is print quality: a single A4 page becomes roughly 2480 by 3508 pixels, which is 8.7 megapixels per page, so a long document at that setting produces a very large ZIP.",
  },
  {
    question: "PNG or JPG?",
    answer:
      "PNG is lossless and much better for pages that are mostly text, line art or diagrams — the sharp edges stay sharp and flat areas compress well. JPG is better for pages that are mostly photographs, where it produces far smaller files at effectively the same visible quality. For a mixed document, PNG is the safer choice because JPG artifacts around small text are noticeable in a way they are not around a photograph.",
  },
  {
    question: "Why were my pages rendered smaller than the DPI I asked for?",
    answer:
      "Browsers cap how large a canvas can be, and the tightest limit — around 16.7 million pixels — comes from Safari on iOS. A large-format page such as A0 at 300 DPI is far past that. Rather than producing a blank image, which is what an over-cap canvas silently does, the tool renders as large as it safely can and tells you it did. Lowering the DPI makes the output exact again.",
  },
  {
    question: "Can I export only some pages?",
    answer:
      "Yes. Choose Specific pages and enter numbers and ranges separated by commas, like 1-3, 5, 8-10. Only those pages are rendered, so a five-page selection from a 300-page document takes seconds rather than minutes.",
  },
  {
    question: "Can I get the images without the ZIP?",
    answer:
      "Yes — each page has its own download link in the result list. The ZIP exists because a 40-page document otherwise means 40 clicks. Inside the ZIP, filenames are zero-padded so your file manager sorts page 10 after page 9 rather than after page 1.",
  },
  {
    question: "Is my PDF uploaded anywhere?",
    answer:
      "No. Rendering uses pdf.js, the same engine Firefox uses to display PDFs, running in a worker inside your browser tab. The pages are drawn to a canvas and encoded locally, and the ZIP is assembled in memory. Nothing is transmitted.",
  },
];

export default function PdfToImagesPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="pdf-to-images"
      title="PDF to Images"
      description="Render each page as a PNG or JPG at the resolution you pick, and take them away as a ZIP. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "PDF to Images" },
      ]}
      articleContent={
        <>
          <h2>Rasterising a PDF in the browser</h2>
          <p>
            A PDF is a description of a page, not a picture of one. Text is
            stored as glyph references, shapes as vector paths, and layout as
            coordinates. Turning that into an image means actually drawing it,
            which needs a rendering engine.
          </p>
          <p>
            This tool uses pdf.js — the renderer Firefox ships to display PDFs
            natively — running in a worker thread in your browser. Each page is
            drawn onto a canvas at the scale corresponding to your chosen DPI,
            then encoded by the browser&apos;s own image encoder. No server is
            involved at any point.
          </p>
          <h2>Understanding DPI in a PDF</h2>
          <p>
            PDF user space is defined as 72 units per inch, which is why an A4
            page measures 595 by 842 units. Exporting at 72 DPI therefore
            produces an image with exactly one pixel per unit — a 1:1 render of
            the page&apos;s own coordinate system.
          </p>
          <p>
            Higher settings are simple multiples of that. 150 DPI renders at
            roughly 2.08 times the page dimensions; 300 DPI at 4.17 times. The
            pixel count grows with the square of that factor, so moving from
            150 to 300 DPI does not double the file size — it roughly
            quadruples it.
          </p>
          <p>
            The useful consequence: pick the resolution by what the images are
            for, not by which number sounds highest. Screen viewing almost
            never benefits from 300 DPI, and the file sizes are real.
          </p>
          <h2>Canvas limits and very large pages</h2>
          <p>
            Every browser caps canvas dimensions and total area. The strictest
            practical limit is around 16.7 million pixels, imposed by Safari on
            iOS. Exceeding it does not throw an error — the canvas simply
            renders blank, which would mean silently handing you a ZIP full of
            white rectangles.
          </p>
          <p>
            To avoid that, the requested scale is checked against the
            page&apos;s size and reduced if necessary. When that happens the
            result carries a notice, so a downscale is something you are told
            about rather than something you discover later.
          </p>
          <h2>Common uses</h2>
          <ul>
            <li>Pulling a diagram or chart out of a report to drop into a slide deck</li>
            <li>Producing preview thumbnails of a document for a website</li>
            <li>Getting a page into an editor that cannot open PDF</li>
            <li>Sharing a single page as an image without sending the whole document</li>
            <li>Archiving a document in a format that will still open in thirty years</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <PdfToImagesTool />
    </ToolPageShell>
  );
}
