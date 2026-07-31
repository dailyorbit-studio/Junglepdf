import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import RemovePagesTool from "./RemovePagesTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "remove-pages",
  title: "Remove Pages from PDF — Delete Pages Online, Free",
  description:
    "Delete specific pages from a PDF and keep the rest in order. Enter ranges like 2, 5-7. Runs entirely in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Are the deleted pages really gone from the file?",
    answer:
      "Yes. A new document is built from the pages you kept, and the removed pages are never copied into it. This is genuinely different from cropping or drawing a black box over content, both of which leave the original data sitting in the file where anyone can recover it.",
  },
  {
    question: "Can I remove every page?",
    answer:
      "No, and the tool will stop you. A PDF is required by the specification to contain at least one page, so a document with none is malformed and most readers will refuse to open it. If you want nothing, delete the file rather than emptying it.",
  },
  {
    question: "Does removing pages make the file smaller?",
    answer:
      "Usually, and roughly in proportion to what you removed — a 40-page document cut to 10 pages tends to land near a quarter of its original size. It is not exact, because fonts and images shared across pages are only dropped once nothing references them any more.",
  },
  {
    question: "Will the remaining pages be renumbered?",
    answer:
      "The physical page order closes up, so a 10-page document with page 3 removed becomes a 9-page document. But any page numbers printed into the page content are part of the artwork and do not change — if the old page 4 had \"4\" typed on it, it still says 4. Use the Add Page Numbers tool afterwards to restamp them.",
  },
  {
    question: "Is my PDF uploaded to a server?",
    answer:
      "No. The document is read into your browser's memory, rebuilt with pdf-lib, and handed back as a download. Nothing crosses the network at any point.",
  },
];

export default function RemovePagesPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="remove-pages"
      title="Remove Pages from PDF"
      description="Delete the pages you don't want and keep everything else exactly as it was."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Remove Pages" },
      ]}
      steps={[
        "Drop your PDF into the box above — it never leaves your device.",
        "Type the pages to delete, like 2, 5-7.",
        "Remove, then download the trimmed document.",
      ]}
      articleContent={
        <>
          <h2>Deleting pages without touching the rest</h2>
          <p>
            Removing pages is the complement of extracting them. You name what
            should go, and everything else is reassembled in its original order
            as a new document. Blank pages from a scanner, a cover sheet, an
            internal appendix, a duplicated fax header — all the things that
            arrive attached to a document and have no business being forwarded
            with it.
          </p>
          <p>
            The pages that survive are <strong>copied, not re-rendered</strong>.
            Their text stays selectable, their fonts stay embedded, their images
            keep their original encoding. Nothing is rasterised, so there is no
            generational quality loss no matter how many times a document passes
            through this tool.
          </p>

          <h2>Removal is not redaction</h2>
          <p>
            This distinction matters enough to be worth stating plainly. Removing
            a page deletes it — the page&apos;s content is never copied into the
            output, so it is genuinely unrecoverable from the new file.
          </p>
          <p>
            What this does <em>not</em> do is remove sensitive content from a page
            you keep. Drawing a black rectangle over a paragraph in any PDF editor
            leaves the text underneath, fully selectable and fully searchable, and
            people have leaked settlement figures and unredacted names exactly this
            way. If a page has to stay but part of it has to go, the only safe
            approach is to remove the text itself rather than cover it.
          </p>

          <h2>How the page syntax works</h2>
          <p>
            The field takes numbers and ranges separated by commas.
            &ldquo;2, 5-7&rdquo; deletes four pages: 2, 5, 6 and 7. Ranges include
            both endpoints, and overlapping entries collapse rather than erroring —
            &ldquo;5-7, 6&rdquo; still removes three pages.
          </p>
          <p>
            Page numbers refer to the document&apos;s physical order, counting from
            1, which is not always what a reader displays. A scanned report with an
            unnumbered cover shows &ldquo;1&rdquo; on its second physical page, so
            check the page count in your reader rather than the printed number if
            the two disagree.
          </p>

          <h2>What does not come across</h2>
          <p>
            Interactive form fields and the bookmark outline live on the document
            catalog rather than on individual pages, so page copying cannot carry
            them. The tool detects both up front and warns you when the document
            has either, rather than discovering it yourself after sending the file
            on. Page content, text and images are never affected.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Stripping blank pages a document feeder picked up</li>
            <li>Removing a cover sheet or internal routing page before sharing</li>
            <li>Cutting appendices out of a report to make it printable</li>
            <li>Deleting duplicate pages from a re-scanned document</li>
            <li>Trimming an over-long PDF down to fit an email attachment limit</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <RemovePagesTool />
    </ToolPageShell>
  );
}
