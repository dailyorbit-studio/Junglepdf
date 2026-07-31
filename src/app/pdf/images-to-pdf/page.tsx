import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ImagesToPdfTool from "./ImagesToPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "images-to-pdf",
  title: "Images to PDF — Convert JPG and PNG to PDF Free",
  description:
    "Combine JPG, PNG and WebP images into a single PDF, one image per page, with a page size and margin you choose. No uploads.",
});

const FAQ_ITEMS = [
  {
    question: "What does the Match each image page size do?",
    answer:
      "It makes every page exactly the pixel dimensions of the image on it, with no margins and no letterboxing. The result is a PDF that looks precisely like your images with no white space added. It is ideal for screenshots and comics, and awkward for printing, since each page may be a different physical size.",
  },
  {
    question: "How do I control the page order?",
    answer:
      "The PDF follows the order shown in the list. Use the arrows on each row to move an image earlier or later. Files are added in the order your browser reports them, which for a multi-file selection is usually alphabetical rather than the order you clicked.",
  },
  {
    question: "Which image formats can be embedded without quality loss?",
    answer:
      "JPEG and PNG only. Those two are the formats the PDF specification supports natively, so their original compressed bytes are stored as-is with no re-encoding. Everything else — WebP, AVIF, BMP, GIF — has to be transcoded to JPEG through a canvas first. The tool lists which files that happened to, so you know exactly where the extra generation of loss occurred.",
  },
  {
    question: "Why did my JPEG get rejected?",
    answer:
      "A small number of JPEG variants cannot be embedded directly — CMYK colour JPEGs from print workflows and 12-bit files from some scanners are the usual culprits. The tool names the file rather than failing the whole batch anonymously. Converting it to PNG first, with the Image Converter, works around it.",
  },
  {
    question: "How large can the images be?",
    answer:
      "Up to 50MB each, and up to 50 images per PDF. Because JPEG and PNG are stored without re-encoding, the resulting PDF is roughly the sum of your input files plus a small overhead. A batch of large photographs produces a large PDF — use the Image Compressor first if the size matters.",
  },
  {
    question: "Are my images uploaded anywhere?",
    answer:
      "No. pdf-lib assembles the document in your browser's memory. Nothing is transmitted, which matters for the common case here: photographing documents, receipts and ID pages to send somewhere as a single file.",
  },
];

export default function ImagesToPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="images-to-pdf"
      title="Images to PDF"
      description="Turn a set of photos or screenshots into one PDF, one image per page. Choose a standard page size or let each page match its image. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Images to PDF" },
      ]}
      articleContent={
        <>
          <h2>Why a PDF rather than a folder of images</h2>
          <p>
            A single document travels better than a set of files. It keeps its
            page order, it cannot arrive with half the pages missing, it opens
            the same way on every device, and most systems that accept document
            uploads accept PDF and nothing else.
          </p>
          <p>
            That is why photographing a paper document and converting to PDF is
            such a common task: the recipient wants one file that behaves like
            the paper did, not eight camera images named IMG_4471 through
            IMG_4478.
          </p>
          <h2>How images are embedded</h2>
          <p>
            The PDF format supports JPEG and PNG image data natively. When you
            add a file in either of those formats, its original compressed
            bytes are copied into the document untouched — no decoding, no
            re-encoding, and no quality loss at all. The image inside the PDF
            is bit-for-bit the image you started with.
          </p>
          <p>
            WebP, AVIF, BMP and GIF have no such support. Those are decoded and
            re-encoded as JPEG at high quality on the way in. For a lossy
            source such as WebP that means one extra generation of compression;
            for a lossless source such as BMP it means the first. The tool
            reports which files went through that path rather than leaving you
            to guess.
          </p>
          <h2>Page size, orientation and margins</h2>
          <p>
            Choosing A4, Letter or Legal gives you a document with consistent,
            printable pages. Each image is scaled to fit inside the margins
            while keeping its aspect ratio, and centred — never cropped, and
            never enlarged beyond the space available.
          </p>
          <p>
            Match each image does the opposite: every page becomes exactly the
            size of its image. Nothing is scaled and no white space is added,
            so the PDF is a faithful container rather than a layout. This is
            the right choice for screenshots, scanned artwork, and anything
            where added margins would be a distraction — and the wrong choice
            for anything destined for a printer.
          </p>
          <p>
            The margin setting applies only to the fixed page sizes. Zero puts
            the image right up against the page edge, which looks striking on
            screen but risks being clipped by printers that cannot print
            edge to edge. Around half an inch is the safe default.
          </p>
          <h2>Common uses</h2>
          <ul>
            <li>Turning phone photos of a paper document into one file to email</li>
            <li>Bundling receipts or invoices for an expense claim</li>
            <li>Assembling scanned artwork or a portfolio into a single document</li>
            <li>Packaging screenshots into a report or bug write-up</li>
            <li>Preparing ID or certificate photos for an application that requires PDF</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ImagesToPdfTool />
    </ToolPageShell>
  );
}
