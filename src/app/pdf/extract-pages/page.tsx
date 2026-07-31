import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ExtractPagesTool from "./ExtractPagesTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "extract-pages",
  title: "Extract Pages from PDF — Pull Out the Pages You Need",
  description:
    "Select pages from a PDF and save them as a new document. Enter ranges like 1-3, 8, 12-15. Runs entirely in your browser — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "What's the difference between extracting and splitting?",
    answer:
      "Extracting gives you one document containing the pages you named. Splitting gives you a separate document for each range you named. If you want pages 1-3 and 8-10 as a single 6-page file, extract. If you want them as two files, split.",
  },
  {
    question: "Can I extract pages in a custom order?",
    answer:
      "No — the output is always in ascending page order. If you type \"5, 1-2\" you get pages 1, 2, 5. Naming pages out of order describes a set rather than a sequence, and silently reordering someone's document to match their typing is the kind of surprise that costs you a contract. Use the Organize PDF tool when you actually want to rearrange.",
  },
  {
    question: "Does the extracted file keep the original quality?",
    answer:
      "Yes. Pages are copied as complete objects — the same text, vectors, fonts and images, byte for byte. Nothing is re-rendered or re-compressed, so an extracted page is pixel-identical to the original and the file size scales with how many pages you kept.",
  },
  {
    question: "Why did I lose the form fields or bookmarks?",
    answer:
      "Interactive form fields and the bookmark tree live on the document catalog rather than on individual pages, and the page-copying operation cannot carry them across. The tool detects both and warns you when it happens rather than quietly dropping them. Page content, text and images are always unaffected.",
  },
  {
    question: "Is my PDF uploaded anywhere?",
    answer:
      "No. The file is read into your browser's memory, the pages are copied with pdf-lib, and the new document is written back out as a download. Nothing is transmitted over the network, which is what makes this safe for contracts, medical records, and financial statements.",
  },
];

export default function ExtractPagesPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="extract-pages"
      title="Extract Pages from PDF"
      description="Pick the pages you want and save them as a new PDF. The rest is left behind."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Extract Pages" },
      ]}
      steps={[
        "Drop your PDF into the box above — it stays on your device.",
        "Type the pages you want to keep, like 1-3, 8, 12-15.",
        "Extract, then download the new document.",
      ]}
      articleContent={
        <>
          <h2>Taking a few pages out of a long document</h2>
          <p>
            Most PDFs arrive bigger than the part you actually need. A 90-page
            tenancy agreement where only the schedule matters, a bank statement
            where you need one month, a scanned report where three pages are
            going to a colleague and the rest are not. Extracting gives you
            exactly those pages as a clean, standalone document.
          </p>
          <p>
            The operation is a <strong>copy</strong>, not a re-render. Each page
            you name is lifted out of the source document&apos;s object graph
            with its text, fonts, vectors and images intact and written into a
            new file. Nothing is rasterised and nothing is re-compressed, so the
            output is indistinguishable from the original at any zoom level.
          </p>

          <h2>How the page syntax works</h2>
          <p>
            The field accepts individual numbers and ranges separated by commas.
            &ldquo;1-3, 8, 12-15&rdquo; means pages 1, 2, 3, 8, 12, 13, 14 and
            15 — eight pages in one document. Ranges are inclusive at both ends,
            and overlapping entries are collapsed rather than duplicated, so
            &ldquo;1-5, 3&rdquo; gives you five pages and not six.
          </p>
          <p>
            Anything the parser cannot make sense of is rejected with a message
            naming the part that failed, rather than being silently skipped.
            A typo like &ldquo;1-3-5&rdquo; is far more likely to be a mistake
            than an instruction, and quietly reading it as &ldquo;1-3&rdquo;
            would hand you a document missing pages you thought you asked for.
          </p>

          <h2>Extract, split, or organise?</h2>
          <p>
            Three tools here overlap and it is worth knowing which one you want.{" "}
            <strong>Extract</strong> produces one file from the pages you name.{" "}
            <strong>Split</strong> produces one file per range, which is what you
            want when a bound document needs to become separate chapters.{" "}
            <strong>Organize</strong> works visually from page thumbnails and is
            the only one of the three that can reorder pages as well as remove
            them.
          </p>

          <h2>What does not come across</h2>
          <p>
            Two document-level structures cannot survive page copying: interactive
            form fields (AcroForm) and the bookmark outline. Both are stored on
            the document catalog rather than attached to individual pages, so
            there is nothing on a copied page for them to travel with.
          </p>
          <p>
            The tool inspects the source for both before it starts and warns you
            when either is present. That is deliberately different from the more
            common behaviour of dropping them without comment — if you extract
            pages from a filled-in form and the values vanish, you need to know
            before you send the file, not after.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Pulling a single signed page out of a long contract</li>
            <li>Sharing one section of a report without the rest of it</li>
            <li>Isolating one month from a combined bank statement</li>
            <li>Removing appendices before printing</li>
            <li>Building a short excerpt from a scanned book or manual</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ExtractPagesTool />
    </ToolPageShell>
  );
}
