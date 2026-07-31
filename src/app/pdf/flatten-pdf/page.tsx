import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import FlattenPdfTool from "./FlattenPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "flatten-pdf",
  title: "Flatten PDF — Bake Form Fields Into the Page",
  description:
    "Flatten a filled-in PDF form so its values become permanent page content. Fixes forms that print blank. Free, no uploads, runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "What does flattening actually do?",
    answer:
      "A PDF form keeps your answers in live fields layered above the page — the page and the values are separate things. Flattening draws those values into the page itself and removes the fields. What was a text box you could click into becomes printed text, indistinguishable from the rest of the document.",
  },
  {
    question: "My filled form prints blank. Will this fix it?",
    answer:
      "Usually, yes — that is the classic case. Some viewers save field values without generating the appearance streams that describe how they should be drawn, so a reader that does not render form fields itself shows nothing. Flattening writes real page content, which every viewer and printer can draw.",
  },
  {
    question: "Does flattening protect or lock the PDF?",
    answer:
      "No, and this gets misrepresented elsewhere, so it is worth being blunt. A flattened PDF is not encrypted, not password-protected and not read-only. It simply no longer contains editable form fields. Anything that edits page content can still edit it. If you need real protection, you need encryption, which is a different thing entirely.",
  },
  {
    question: "I flattened a PDF and nothing changed.",
    answer:
      "Then it had no interactive form fields to begin with — the tool says so rather than implying it did something. Many PDFs that look like forms are just printed lines and boxes with no interactivity at all. If yours came back unchanged and you were trying to make it uneditable, flattening was not the operation you needed.",
  },
  {
    question: "Are annotations and signatures flattened too?",
    answer:
      "Form fields are, including the image signatures placed by tools like this site's Sign PDF. Comment-style annotations and digital certificate signatures are left alone — flattening a certificate signature would destroy the very thing that makes it verifiable.",
  },
  {
    question: "Is my PDF uploaded?",
    answer:
      "No. The document is read and rewritten entirely in your browser. Filled-in forms are among the most sensitive files people handle — applications, tax documents, medical paperwork — which is exactly why this runs locally.",
  },
];

export default function FlattenPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="flatten-pdf"
      title="Flatten PDF"
      description="Bake a filled-in form's values into the page so they are permanent, printable and no longer editable."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Flatten PDF" },
      ]}
      steps={[
        "Drop your filled-in PDF into the box above — it stays on your device.",
        "Flatten it. Field values become ordinary page content.",
        "Download the result and send it on.",
      ]}
      articleContent={
        <>
          <h2>Two layers, made one</h2>
          <p>
            A PDF form is really two documents in a trench coat. There is the page
            — the lines, labels and boxes that were printed — and above it a layer
            of interactive fields holding whatever has been typed in. They are
            stored separately, and only software that understands the form layer
            shows your answers.
          </p>
          <p>
            Flattening collapses the two. Each field&apos;s current value is drawn
            into the page as ordinary content and the field itself is removed.
            Afterwards there is no form, only a document that happens to have your
            answers printed on it.
          </p>

          <h2>Why you would want that</h2>
          <p>
            <strong>The form prints blank.</strong> The most common reason people
            arrive here. Some viewers save field values but never generate the
            appearance streams that say how they should look, so a different
            reader — or a printer — draws nothing. Flattening produces real page
            content that every viewer can render.
          </p>
          <p>
            <strong>The values should stop moving.</strong> Sending a live form
            means sending something the recipient can retype. Flattened, the
            answers are part of the page.
          </p>
          <p>
            <strong>It has to render identically everywhere.</strong> Form field
            appearance varies between viewers — fonts, alignment, whether a
            checkbox draws as a tick or a cross. Flattened content does not vary.
          </p>
          <p>
            <strong>Something downstream cannot read forms.</strong> Plenty of
            document systems ingest page content and ignore the form layer
            entirely, receiving what looks like an empty document.
          </p>

          <h2>What flattening is not</h2>
          <p>
            It is not protection. A flattened PDF is not encrypted, not password
            protected and not read-only, and anyone with a PDF editor can still
            change the page. This gets sold elsewhere as a security step and it
            simply is not one — real protection means encryption, which is a
            different operation with a different tool.
          </p>
          <p>
            It is also not reversible. Once the values are page content, they
            cannot be turned back into fields. Keep the original if you might need
            to change an answer.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Finalising a completed application before submitting it</li>
            <li>Fixing a form whose answers vanish when printed</li>
            <li>Sending a filled form that should not be edited further</li>
            <li>Preparing a document for a system that ignores form fields</li>
            <li>Making a signed agreement render the same for everyone</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            The whole operation runs in your browser. Filled-in forms carry
            addresses, salaries, medical details and signatures — the kind of file
            that should never be uploaded to an unknown server to have something
            trivial done to it.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <FlattenPdfTool />
    </ToolPageShell>
  );
}
