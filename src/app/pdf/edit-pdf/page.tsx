import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import EditPdfTool from "./EditPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "edit-pdf",
  title: "Edit PDF — Add Text and White Out Content, In Your Browser",
  description:
    "Add text to a PDF, white out mistakes, and draw boxes or highlights. Runs entirely in your browser — nothing is uploaded, no sign-up.",
});

const FAQ_ITEMS = [
  {
    question: "Can I edit the text that is already in the PDF?",
    answer:
      "Not in place, and no browser tool honestly can. A PDF stores each character at a fixed position with no notion of a paragraph or a text box, so there is nothing to type into — changing one word means recomputing the layout of everything around it with fonts that may not be embedded. What works instead is what this tool does: white out the old text and type new text over it. For genuine re-editing, convert with PDF to Word, edit there, and convert back.",
  },
  {
    question: "Is white-out safe for hiding information?",
    answer:
      "No. It draws an opaque rectangle over the page; the text underneath is still in the file and comes straight out of any extractor, including PDF to Text on this site. It is for correcting mistakes, not for concealment. To actually remove content, use Redact PDF, which rebuilds pages as images.",
  },
  {
    question: "Does the PDF stay searchable after editing?",
    answer:
      "Yes. Everything you add is drawn as vector content on top of the existing page, and nothing is rasterised. The file keeps its text layer, stays selectable, and does not balloon in size.",
  },
  {
    question: "What font does added text use?",
    answer:
      "Helvetica, one of the standard PDF fonts, so nothing extra is embedded and the file stays small. It covers Western European characters; anything outside that range is replaced with a question mark and the count is reported. Matching the document's own font is not possible unless that font is embedded and licensed for editing.",
  },
  {
    question: "Can I move something after placing it?",
    answer:
      "Not yet — use Undo and place it again. Undo steps back through everything you have added, across all pages.",
  },
  {
    question: "Is my document uploaded?",
    answer:
      "No. The page is rendered for preview and your changes are written into the file entirely in your browser.",
  },
];

export default function EditPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="edit-pdf"
      title="Edit PDF"
      description="Add text to a PDF, white out mistakes and draw boxes — all in the browser, with the text layer intact."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Edit PDF" },
      ]}
      steps={[
        "Drop your PDF into the box above — it stays on your device.",
        "Click to add text, or drag to white out, box or highlight.",
        "Save and download the edited PDF.",
      ]}
      articleContent={
        <>
          <h2>What &quot;editing a PDF&quot; can actually mean</h2>
          <p>
            PDF is a final format. It records each character at a fixed position
            on the page, with no paragraphs, no text boxes and no reflow. There
            is no field to click into and retype, because there is no field —
            only glyphs with coordinates.
          </p>
          <p>
            That is why changing a word properly is so hard: you would have to
            re-lay-out everything around it, in a font that may not be embedded
            in the file and may not be licensed for editing if it is. Software
            that appears to do this is reconstructing a guess at the text flow,
            with results that fall apart on anything complicated.
          </p>

          <h2>The approach that works</h2>
          <p>
            Cover and overwrite. White out the text that is wrong, then type what
            should be there on top. It is exactly what correction fluid does on
            paper, and for the things people actually need — a wrong date, an old
            address, a name, a figure — it is quick and the result looks right.
          </p>
          <p>
            Add to that boxes for emphasis, highlights, and a pen for marking,
            and most real editing jobs are covered without pretending to a
            capability that does not exist.
          </p>

          <h2>Everything is additive</h2>
          <p>
            Your changes are drawn as vectors on top of the existing page. The
            original content is untouched, nothing is rasterised, and the file
            keeps its text layer — so it stays searchable and selectable, and
            does not grow much.
          </p>

          <h2>White-out is not redaction</h2>
          <p>
            This is the one thing worth being unambiguous about. Drawing an
            opaque rectangle over text hides it from view and leaves it in the
            file. It still selects, still copies, and comes straight out of any
            text extractor — including PDF to Text on this site.
          </p>
          <p>
            For a typo or an old address, that is fine. For a bank account
            number, a name or anything confidential, it is not: use Redact PDF,
            which rebuilds each page as an image so the content is genuinely
            removed.
          </p>

          <h2>When to convert instead</h2>
          <p>
            If you need to rewrite paragraphs rather than patch a line, convert
            with PDF to Word, edit properly in a word processor, and convert back
            with Word to PDF. You lose the original&apos;s exact appearance and
            gain a document you can actually write in — usually the right trade
            when the changes are substantial.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Correcting a date, name or figure on a form</li>
            <li>Filling in a printed form that has no interactive fields</li>
            <li>Covering an outdated address and typing the new one</li>
            <li>Adding a note or reference number to a document</li>
            <li>Boxing or highlighting a section for someone&apos;s attention</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            The document never leaves your device. Editing usually means the file
            matters and the change is personal — neither is a reason to hand it
            to a server.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <EditPdfTool />
    </ToolPageShell>
  );
}
