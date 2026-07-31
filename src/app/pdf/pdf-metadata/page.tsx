import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import PdfMetadataTool from "./PdfMetadataTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "pdf-metadata",
  title: "PDF Metadata Editor — View, Edit or Remove PDF Properties",
  description:
    "See what a PDF says about its author and origin, edit any field, or strip them all. Removes the name your word processor put there. No uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Why does my PDF have my full name in it?",
    answer:
      "Because Word, LibreOffice, Pages and most PDF printers copy the name registered with the application or the operating system account into the Author field automatically. Almost nobody sets it deliberately, and almost nobody knows it is there.",
  },
  {
    question: "Does clearing the metadata make my PDF anonymous?",
    answer:
      "It removes the document information fields, which is where most identifying detail lives. It does not touch XMP metadata, which some producers write in parallel, and it cannot remove a name printed inside the page content itself. For anything sensitive, verify with a metadata viewer afterwards.",
  },
  {
    question: "Will editing the metadata change how the document looks?",
    answer:
      "No. The pages are untouched — this only rewrites the properties dictionary. The file size barely moves and nothing is re-rendered.",
  },
  {
    question: "What is the difference between Creator and Producer?",
    answer:
      "Creator is the application the document was authored in, such as Microsoft Word. Producer is whatever actually wrote the PDF bytes, often a library or a print driver. A file made in Word and printed to PDF usually names both.",
  },
  {
    question: "Is my PDF uploaded?",
    answer:
      "No. The properties are read and rewritten by pdf-lib in your browser. The document never leaves the tab.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="pdf"
      slug="pdf-metadata"
      title="PDF Metadata"
      description="See what your PDF is telling people about you — then change it, or clear it."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "PDF Metadata" },
      ]}
      steps={[
        "Drop in a PDF to see its current properties",
        "Edit the fields, or clear them all at once",
        "Save, then download the PDF",
      ]}
      articleContent={
        <>
          <h2>What a PDF says about you without asking</h2>
          <p>
            Every PDF carries a document information dictionary — Title, Author, Subject,
            Keywords, Creator and Producer — and most of it is filled in automatically by
            whatever produced the file.
          </p>
          <p>
            The Author field usually holds your operating system account name or the name
            registered in Word, which is very often your real full name. Creator names
            the application, and Producer names the library. Together they describe your
            software stack and identify you, on a file you may be sending to a stranger,
            attaching to a job application, or publishing.
          </p>
          <h2>Editing versus clearing</h2>
          <p>
            Filling the fields in properly is worth doing on anything published: a real
            Title is what a PDF viewer shows in its window bar, what many search engines
            display, and what document management systems index.
          </p>
          <p>
            Clearing them is the privacy case, and one click empties every field at once.
            The dates are set to a fixed placeholder rather than removed, because the
            format has no way to express “absent” — and a visibly meaningless date is
            more honest than silently stamping today’s.
          </p>
          <h2>The limit you need to know about</h2>
          <p>
            This rewrites the information dictionary. A PDF may <em>also</em> carry an
            XMP metadata stream — an XML packet that Acrobat and some other producers
            write, frequently duplicating the same author and title values.
          </p>
          <p>
            pdf-lib has no XMP interface, so that stream is left as it is. For a document
            that has to be genuinely anonymous, clear the fields here and then check the
            result in a metadata viewer before sending it. Saying so is better than
            implying a file is clean when it may not be.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <PdfMetadataTool />
    </ToolPageShell>
  );
}
