import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import OrganizePdfTool from "./OrganizePdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "organize-pdf",
  title: "Organize PDF — Delete and Reorder Pages With Previews",
  description:
    "Remove pages from a PDF and rearrange the rest, working from real page thumbnails. Runs entirely in your browser — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "How do I delete a page?",
    answer:
      "Click the cross on its thumbnail. The page dims rather than disappearing, and the cross becomes a tick so you can put it back. Nothing is actually removed until you press Save, so there is no way to lose a page you did not mean to.",
  },
  {
    question: "How do I change the page order?",
    answer:
      "Use the arrows on each thumbnail to move a page earlier or later. When a page ends up somewhere other than where it started, its label shows the original number and the new position, so you can see at a glance what has moved.",
  },
  {
    question: "Why does it take a moment to load my PDF?",
    answer:
      "Every page is rendered to a real preview image using pdf.js, so you are looking at your actual content rather than numbered boxes. That render is the loading time, and it scales with page count. A 200-page document takes noticeably longer than a 5-page one — but it is the difference between deleting page 47 with confidence and guessing.",
  },
  {
    question: "Does this preserve bookmarks and form fields?",
    answer:
      "No, and the tool tells you when your file has them. Rebuilding a document copies pages into a fresh container, and the outline tree and AcroForm dictionary live on the document catalog rather than on individual pages, so they cannot be carried across. If you need a filled form preserved, flatten it in your PDF reader first.",
  },
  {
    question: "Is my PDF uploaded anywhere?",
    answer:
      "No. Both halves of this tool run locally — pdf.js renders the previews in your browser, and pdf-lib rebuilds the document in memory. Nothing is transmitted, which is what makes it safe for contracts, medical records and anything else you would not hand to a stranger's server.",
  },
];

export default function OrganizePdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="organize-pdf"
      title="Organize PDF"
      description="Delete the pages you don't want and rearrange the ones you keep, working from real previews rather than page numbers. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Organize PDF" },
      ]}
      articleContent={
        <>
          <h2>Editing page structure without an upload</h2>
          <p>
            This tool does two jobs that are really the same job. Deleting a
            page means leaving it out of the output; moving a page means
            emitting it at a different position. Both are expressed as a single
            ordered list of source pages, which is then copied into a fresh
            document with pdf-lib.
          </p>
          <p>
            The previews come from pdf.js, the same rendering engine Firefox
            uses to display PDFs. Every page is rasterised in your browser at
            thumbnail resolution so you can see what you are about to remove.
            Neither library needs a server, so the document stays on your
            device throughout.
          </p>
          <h2>Why previews matter more than they sound</h2>
          <p>
            Tools that ask you to type page numbers work fine when you already
            know the document. They fail badly the moment you do not — deleting
            the blank separator pages from a 90-page scan, or pulling the
            appendix out of a report someone else assembled, means opening the
            file in another program first and writing numbers down.
          </p>
          <p>
            Rendering the pages costs a few seconds up front and removes that
            entire step. It also removes a class of mistake: you cannot
            accidentally delete page 34 when you meant 43 if you are looking at
            both.
          </p>
          <h2>What rebuilding a PDF carries across</h2>
          <p>
            Page content copies faithfully. Text, vector graphics, embedded
            images and annotations attached to a page all survive the move
            into the new document, at their original quality — nothing is
            re-rendered or re-compressed.
          </p>
          <p>
            Two document-level structures do not survive. Bookmarks live in an
            outline tree hanging off the document catalog, and interactive form
            fields live in an AcroForm dictionary in the same place. Neither is
            attached to the pages being copied, so neither comes along. The
            tool inspects your file first and warns you when it contains
            either, rather than letting you discover it after the fact.
          </p>
          <h2>Common uses</h2>
          <ul>
            <li>Stripping blank pages and separator sheets out of a bulk scan</li>
            <li>Pulling a single signed section out of a long contract</li>
            <li>Moving an appendix from the middle of a report to the end</li>
            <li>Removing pages containing information you do not want to share</li>
            <li>Reversing the order of a document scanned back to front</li>
          </ul>
          <p>
            That last case is worth flagging: if a duplex scanner produced your
            pages in the wrong order, reordering here is lossless and takes
            seconds, where re-scanning does not.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <OrganizePdfTool />
    </ToolPageShell>
  );
}
