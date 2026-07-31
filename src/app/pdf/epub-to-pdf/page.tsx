import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import EpubToPdfTool from "./EpubToPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "epub-to-pdf",
  title: "EPUB to PDF — Convert an EPUB Book to PDF in Your Browser",
  description:
    "Convert an .epub ebook into a paginated PDF, chapter by chapter, without uploading it. Free, no sign-up, runs entirely in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "My book will not open — why?",
    answer:
      "Almost certainly DRM. Books bought from most major stores are encrypted and tied to an account; the chapters inside the archive cannot be read by anything except that store's own reader. Nothing running in a browser can decrypt them, and this tool does not try. Books from Project Gutenberg, Standard Ebooks, publishers who sell DRM-free, and anything you produced yourself all convert fine.",
  },
  {
    question: "Will the PDF look like the book does in my e-reader?",
    answer:
      "No — and in a sense that question does not have an answer. An EPUB has no pages: it reflows to whatever screen and font size the reader is using, which is the whole point of the format. Converting to PDF means choosing a page size and typesetting it, and this tool uses the settings you pick rather than the publisher's design.",
  },
  {
    question: "Are chapters kept in the right order?",
    answer:
      "Yes. An EPUB carries a spine — an explicit reading order in its package file — and that is what is followed. Without it, chapters would come out in whatever order the zip happens to store them, which is arbitrary and frequently wrong. Each chapter also starts on a fresh page.",
  },
  {
    question: "What about the cover and the table of contents?",
    answer:
      "Neither is carried over. The cover is usually a full-bleed image designed for a completely different aspect ratio, and the EPUB table of contents is a navigation document with links to chapter files, which does not survive being flattened into pages. Chapter headings themselves do come through as PDF headings.",
  },
  {
    question: "Do images inside the book convert?",
    answer:
      "Illustrations embedded in the chapters are included, scaled to fit the page width. Vector graphics that a browser cannot decode are skipped, and the count is reported.",
  },
  {
    question: "Is the book uploaded anywhere?",
    answer:
      "No. The archive is unzipped and its chapters parsed inside the tab, and the PDF is assembled in memory on your machine.",
  },
];

export default function EpubToPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="epub-to-pdf"
      title="EPUB to PDF"
      description="Convert an EPUB ebook into a paginated PDF, chapter by chapter, at the page size you choose."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "EPUB to PDF" },
      ]}
      steps={[
        "Drop your .epub file into the box above — it stays on your device.",
        "Choose page size, typeface and margins.",
        "Convert and download the PDF.",
      ]}
      articleContent={
        <>
          <h2>From a reflowable book to fixed pages</h2>
          <p>
            An EPUB has no pages. It is a zip of web documents that reflow to
            whatever screen is showing them, which is exactly why ebooks work on a
            phone and a seven-inch reader alike. What it does not do is print, or
            open on a machine without a reader app, or hold a fixed reference you
            can cite by page.
          </p>
          <p>
            Converting to PDF trades the format&apos;s flexibility for those
            properties. Because the source has no page design of its own, the
            page size, typeface and margins you choose here are not overriding the
            publisher&apos;s layout — they are supplying one.
          </p>

          <h2>Reading the book in the right order</h2>
          <p>
            Inside the archive, chapters are separate XHTML files with names that
            mean nothing in particular. What gives them an order is the
            <em> spine</em>: a list in the book&apos;s package file naming each
            chapter in reading order. This converter finds the package file
            through <code>META-INF/container.xml</code>, reads the spine, and
            follows it.
          </p>
          <p>
            That detail is the difference between a book and a shuffled pile of
            chapters — sorting zip entries alphabetically puts chapter 10 before
            chapter 2. Each chapter then begins on a fresh page, which is the one
            place a book&apos;s structure genuinely maps onto page breaks.
          </p>

          <h2>What comes across</h2>
          <p>
            <strong>Kept:</strong> chapter text, headings, paragraphs, lists,
            block quotes, italics and bold, embedded illustrations, and links.
          </p>
          <p>
            <strong>Not kept:</strong> the cover, the navigation table of
            contents, the publisher&apos;s typography and stylesheets, footnotes,
            and page-list metadata.
          </p>

          <h2>The DRM question</h2>
          <p>
            Most books bought from major stores are encrypted and tied to an
            account. Their chapters cannot be read by anything but that
            store&apos;s reader, and no browser tool can change that — this one
            will tell you the chapters could not be read rather than producing an
            empty file.
          </p>
          <p>
            Books that convert without trouble: anything from Project Gutenberg or
            Standard Ebooks, DRM-free purchases from publishers who sell that way,
            and EPUBs you made yourself.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Printing a book, or part of one, to read on paper</li>
            <li>Reading on a device that has no EPUB reader</li>
            <li>Getting a public-domain text into a fixed, citable form</li>
            <li>Sending a manuscript to someone as a normal document</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            Everything runs on your device — the archive is unzipped in the tab
            and the PDF is written in memory. Nothing is uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <EpubToPdfTool />
    </ToolPageShell>
  );
}
