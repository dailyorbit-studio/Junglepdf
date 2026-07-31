import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import AnnotatePdfTool from "./AnnotatePdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "annotate-pdf",
  title: "PDF Annotator — Highlight and Mark Up a PDF In Your Browser",
  description:
    "Highlight text, draw with a pen and add notes to a PDF without uploading it. The document keeps its text layer. Free, no sign-up.",
});

const FAQ_ITEMS = [
  {
    question: "Can the person I send it to remove my highlights?",
    answer:
      "Not easily. These are drawn onto the page as content, not added as PDF comment annotations that a reader can hide or delete with a click. That is usually what people want when marking up a document to send on — but it does mean you should keep the original if you might need a clean copy.",
  },
  {
    question: "Does the PDF stay searchable?",
    answer:
      "Yes. Everything is drawn as vectors on top of the existing content, and the original text layer is untouched. The file stays searchable, selectable and roughly the same size. Nothing is rasterised.",
  },
  {
    question: "Does highlighting hide anything?",
    answer:
      "No — and this matters. A highlight is translucent so you can read through it, and even an opaque box drawn over text leaves that text in the file, fully extractable. If your goal is to remove something rather than mark it, use Redact PDF, which rebuilds pages as images so the content is genuinely gone.",
  },
  {
    question: "Why does the pen look smoother in the preview?",
    answer:
      "The preview draws your stroke as a single SVG path, while the PDF is built from connected line segments with round caps, since PDF has no polyline primitive that survives the coordinate flip cleanly. On any normal stroke the two are visually identical; a very fast scribble may look slightly more angular in the output.",
  },
  {
    question: "Can I annotate a scanned PDF?",
    answer:
      "Yes. Annotations are drawn on top of whatever the page contains, so a scan works exactly the same way — you simply cannot highlight by selecting text, because there is no text to select. Drag the highlight over the area you want.",
  },
  {
    question: "Is my document uploaded?",
    answer:
      "No. The page is rendered for preview and the marks are written back into the file entirely in your browser.",
  },
];

export default function AnnotatePdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="annotate-pdf"
      title="PDF Annotator"
      description="Highlight, draw and add notes on a PDF — marks are written into the file and the text layer survives."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "PDF Annotator" },
      ]}
      steps={[
        "Drop your PDF into the box above — it stays on your device.",
        "Pick a tool and colour, then mark up any page.",
        "Save and download the annotated PDF.",
      ]}
      articleContent={
        <>
          <h2>Marking up without an app</h2>
          <p>
            Reviewing a document usually means highlighting a few passages,
            circling something and writing a note beside it. Doing that normally
            means a PDF application, and on a shared or locked-down machine, or a
            phone, you may not have one that can write to the file.
          </p>
          <p>
            This does it in the browser. Highlights, pen strokes and text are
            drawn onto the page and written back into a real PDF that opens
            anywhere.
          </p>

          <h2>Drawn on, not attached</h2>
          <p>
            PDF has two ways to add a mark. It can be an <em>annotation object</em>
            — a comment layered above the page that a reader can show, hide or
            delete — or it can be <em>page content</em>, drawn into the document
            itself.
          </p>
          <p>
            This tool draws page content. That means your marks travel with the
            file and cannot be toggled off by whoever opens it, which is normally
            the point of marking a document before sending it. It also means they
            are permanent, so keep the original if you might want a clean copy.
          </p>

          <h2>The text layer survives</h2>
          <p>
            Everything is drawn as vectors on top of what is already there. The
            original content is not touched and nothing is rasterised, so the
            annotated file stays searchable and selectable, and stays about the
            same size.
          </p>
          <p>
            That is the right trade for annotation and exactly the wrong one for
            hiding information — which is worth stating plainly, because the two
            look identical on screen.
          </p>

          <h2>A highlight is not a redaction</h2>
          <p>
            Drawing over text does not remove it. Even a solid black box leaves
            the text underneath, still selectable and still returned by any
            extractor. People leak documents this way constantly.
          </p>
          <p>
            If your goal is to take something out rather than draw attention to
            it, use Redact PDF, which rebuilds each page as an image so the
            content is genuinely gone. This tool is for marking up; that one is
            for removing.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Highlighting the clauses that matter in a contract</li>
            <li>Marking corrections on a draft before sending it back</li>
            <li>Circling a figure in a report and writing a note next to it</li>
            <li>Signing off a document with a handwritten tick or initials</li>
            <li>Marking up a scan, where there is no text to select</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            The document stays on your device throughout. Contracts and drafts
            under review are exactly the files that should not be uploaded to
            have a few lines drawn on them.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <AnnotatePdfTool />
    </ToolPageShell>
  );
}
