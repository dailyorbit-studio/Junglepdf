import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import PageNumbersTool from "./PageNumbersTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "page-numbers",
  title: "Add Page Numbers to PDF — Free Browser Tool",
  description:
    "Stamp page numbers onto a PDF with control over position, format, size and starting number. Runs entirely in your browser — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Can I start numbering at something other than 1?",
    answer:
      "Yes. Set the starting number to whatever you need. This matters when a document is one part of a larger set — a chapter that begins on page 47 of a bound report, for instance — or when a cover page should not be counted.",
  },
  {
    question: "How do I leave the cover page unnumbered?",
    answer:
      "Turn on Skip the first page. The first page is left alone and numbering begins on the second. Combine it with the starting number if the second page should read 1 rather than 2.",
  },
  {
    question: "What if my document has landscape or rotated pages?",
    answer:
      "The number is placed relative to what a reader sees, not to the raw page geometry. A page carrying a 90 degree rotation flag reports portrait dimensions internally even though it displays landscape, so the tool inverts the rotation when working out where bottom-centre actually is, and rotates the text to match. A mixed-orientation document ends up with numbers in the same visual spot on every page.",
  },
  {
    question: "Will the numbers overlap my existing content?",
    answer:
      "They can, if your document already uses the margins. The numbers are drawn on top of the page rather than reflowing it, because a PDF has no concept of reflowable text. Increase the margin setting to push them further toward the page edge, or pick a corner your content leaves empty.",
  },
  {
    question: "Can I remove the numbers afterwards?",
    answer:
      "Not with this tool. The numbers become part of the page content stream, indistinguishable from any other text on the page. Keep your original file if you might need an unnumbered version later.",
  },
  {
    question: "Is my PDF uploaded to a server?",
    answer:
      "No. pdf-lib draws the text into each page's content stream in your browser's memory, and the modified document is saved locally. Nothing is transmitted.",
  },
];

export default function PageNumbersPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="page-numbers"
      title="Add Page Numbers"
      description="Stamp numbers onto every page, with control over where they sit, how they read, and where the count starts. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Add Page Numbers" },
      ]}
      articleContent={
        <>
          <h2>Numbering pages after the fact</h2>
          <p>
            Page numbers usually come from whatever produced the document. That
            breaks down as soon as a PDF is assembled from several sources —
            merged reports, scanned batches, contracts with appendices bolted
            on — because each part carries its own numbering or none at all.
          </p>
          <p>
            This tool draws numbers directly into each page&apos;s content
            stream using one of the fonts every PDF reader is required to
            support. Nothing has to be embedded, so a 300-page document grows
            by a few hundred bytes rather than the size of a font file.
          </p>
          <h2>Position, format and where the count starts</h2>
          <p>
            Six positions cover the conventional choices: any corner, or
            centred at the top or bottom. Bottom centre is the traditional
            default for printed documents; outer corners suit anything intended
            to be flipped through rather than read straight.
          </p>
          <p>
            The format options run from a bare numeral to <em>Page 4 of 12</em>.
            The longer forms are more useful than they look on a document that
            will be printed and physically handled, because a reader who drops
            the stack can tell immediately whether anything is missing.
          </p>
          <p>
            The starting number exists for documents that are part of something
            larger. A chapter extracted from a bound report should carry the
            numbers it had in that report, not restart at one.
          </p>
          <h2>Rotated and mixed-orientation documents</h2>
          <p>
            A PDF page stores its dimensions in one place and its display
            rotation in another. A landscape page produced by rotating a
            portrait one still reports portrait dimensions internally. Placing
            a stamp using those raw numbers would land it on what the reader
            sees as the left or right edge, sideways.
          </p>
          <p>
            The tool inverts the page&apos;s rotation to work out where the
            requested position actually falls, then rotates the text by the
            same amount so it reads correctly. On a document mixing portrait
            body pages with landscape tables, the numbers appear in the same
            visual place on every page and all read the right way up.
          </p>
          <h2>Numbering is permanent</h2>
          <p>
            Once drawn, a page number is ordinary page content. There is no
            layer to hide and no annotation to delete — it is as much a part of
            the page as the original text. If you might need an unnumbered
            version later, keep the original file.
          </p>
          <h2>Common uses</h2>
          <ul>
            <li>Numbering a report assembled by merging several separate PDFs</li>
            <li>Adding exhibit or bates-style numbering to a legal bundle</li>
            <li>Preparing a scanned document for printing and physical filing</li>
            <li>Making a long document easier to reference in a meeting</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <PageNumbersTool />
    </ToolPageShell>
  );
}
