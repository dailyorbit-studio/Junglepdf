import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import RedactPdfTool from "./RedactPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "redact-pdf",
  title: "Redact PDF — Permanently Remove Content, In Your Browser",
  description:
    "Black out text in a PDF so it is actually gone, not just covered. Pages are rebuilt as images, so redacted content cannot be recovered. No uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Is the redacted text really gone?",
    answer:
      "Yes. Each page is rendered to an image, the boxes are painted onto those pixels, and the PDF is rebuilt from the images. The original text objects are not in the output file at all — there is nothing left to select, copy or extract. That is the entire reason this tool works the way it does.",
  },
  {
    question: "Why not just draw black rectangles over the text?",
    answer:
      "Because that is not redaction, and it is how documents get leaked. A rectangle in a PDF is a graphic drawn above the page; the text underneath is untouched. It still selects, still copies, and still comes out of any text extractor — including the PDF to Text tool on this site. Court filings, medical records and unredacted names have been exposed this way repeatedly. If a tool lets you keep a searchable text layer after redacting, it did not remove anything.",
  },
  {
    question: "Why can't I search or select text in the result?",
    answer:
      "That is the cost of the guarantee. Removing the text means the text is not there any more, so there is nothing left to search. A redacted PDF that is still fully searchable is a redacted PDF that did not delete anything. If you need searchable output, redact first and then run the result through an OCR tool — accepting that OCR will re-read only what remains visible.",
  },
  {
    question: "The file got bigger. Is that normal?",
    answer:
      "Yes. Text is extraordinarily compact — a page of it can be a few kilobytes — while an image of that same page at 200 DPI is hundreds of kilobytes. Choosing a lower resolution reduces the size; 150 DPI is fine for reading on screen, 300 DPI for printing.",
  },
  {
    question: "What about metadata and other pages?",
    answer:
      "The rebuilt document carries no metadata from the original — author, title, creation software and revision history are all left behind, because the new file is assembled from scratch. Every page is rasterised, not just the ones you drew on, so no page keeps a hidden text layer.",
  },
  {
    question: "Is cropping the same as redacting?",
    answer:
      "No, and it is worth being clear since this site has a Crop PDF tool too. Cropping sets a CropBox, which tells a viewer to display less of the page — the content outside it is still in the file and reappears the moment someone changes the box. Cropping hides. This removes.",
  },
  {
    question: "Is my document uploaded?",
    answer:
      "No. Rendering, painting and rebuilding all happen in your browser. A document you are redacting is by definition one with something sensitive in it, which is exactly the file that should never be uploaded to have that done.",
  },
];

export default function RedactPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="redact-pdf"
      title="Redact PDF"
      description="Black out anything in a PDF and have it genuinely removed from the file — not just covered over."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Redact PDF" },
      ]}
      steps={[
        "Drop your PDF into the box above — it stays on your device.",
        "Drag across anything that should be removed, on any page.",
        "Redact, then download. The content is gone, not hidden.",
      ]}
      articleContent={
        <>
          <h2>The mistake this tool exists to prevent</h2>
          <p>
            Open a PDF in almost any editor, draw a black rectangle over a name,
            and save. It looks redacted. It is not. The rectangle is a graphic
            painted above the page, and the text is still sitting underneath it,
            unchanged — selectable, copyable, and returned in full by any text
            extractor.
          </p>
          <p>
            This is not a theoretical failure. Governments, law firms, hospitals
            and newspapers have all published documents redacted exactly this way
            and had the hidden text pulled out within hours. It keeps happening
            because the wrong method looks identical to the right one.
          </p>

          <h2>How this works instead</h2>
          <p>
            Every page is rendered to an image at the resolution you choose. The
            boxes you drew are painted onto those pixels. Then a new PDF is
            assembled from the images.
          </p>
          <p>
            After that, the redacted content is not concealed — it does not exist
            in the file. There are no text objects to recover, no hidden layer,
            no earlier revision. Everything you did not cover remains perfectly
            visible; what you covered is black pixels and nothing else.
          </p>
          <p>
            Because the document is rebuilt from scratch, the original&apos;s
            metadata does not come with it either. Author, title, producing
            software and revision history are all left behind — details that have
            given away as much as visible text has.
          </p>

          <h2>What it costs</h2>
          <p>
            <strong>No text layer.</strong> The output cannot be searched or
            selected. This is unavoidable and it is the point: text that can
            still be searched is text that is still there. A tool offering
            redaction with searchable output has not removed anything.
          </p>
          <p>
            <strong>A larger file.</strong> Text is compact; images are not. Pick
            150 DPI for something to be read on screen, 300 DPI for print.
          </p>
          <p>
            If you need both a clean redaction and searchable text, redact here
            and run the result through OCR afterwards — which will read back only
            what is still visible, as it should.
          </p>

          <h2>Redacting, cropping and flattening are three different things</h2>
          <p>
            <strong>Cropping</strong> sets a box telling a viewer to show less of
            the page. Everything outside it is still in the file and returns the
            moment someone changes the box.
          </p>
          <p>
            <strong>Flattening</strong> bakes form field values into the page.
            Useful for finalising a form, irrelevant to hiding anything.
          </p>
          <p>
            <strong>Redacting</strong>, as done here, removes the content. Only
            this one is safe to use before publishing a document.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Removing account numbers from a statement before sharing it</li>
            <li>Taking names or addresses out of a document before publishing</li>
            <li>Preparing a contract for disclosure with commercial terms removed</li>
            <li>Sending an ID or record with sensitive fields taken out</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            The document never leaves your device. Uploading a file to have its
            secrets removed is a contradiction, and this tool does not ask you
            to.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <RedactPdfTool />
    </ToolPageShell>
  );
}
