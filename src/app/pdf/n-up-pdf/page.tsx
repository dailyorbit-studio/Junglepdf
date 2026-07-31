import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import NupPdfTool from "./NupPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "n-up-pdf",
  title: "Multiple Pages per Sheet — 2, 4, 6 or 9-Up PDF Printing",
  description:
    "Put several PDF pages on each sheet to save paper. Text stays selectable because pages are embedded, not rasterised. Runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "Is the text still selectable afterwards?",
    answer:
      "Yes. Pages are embedded as scalable content rather than rendered to images, so text remains text — you can select it, search it, and it prints at full printer resolution rather than at whatever DPI an image would have used.",
  },
  {
    question: "How much paper does this actually save?",
    answer:
      "Exactly what the arithmetic says: 2-up halves the sheets, 4-up quarters them, 9-up cuts them to a ninth. A 40-page document at 4-up is 10 sheets, or 5 printed double-sided.",
  },
  {
    question: "Will it still be readable at 9-up?",
    answer:
      "For slides and large-text documents, usually yes. For dense body text at 10 or 11 point, 9-up puts it at roughly a third of its original size, which is too small for most people. 2-up and 4-up are the practical settings for ordinary documents.",
  },
  {
    question: "What does the gap setting do?",
    answer:
      "It adds space between the placed pages and around the edge of the sheet. Some gap makes the boundaries between pages obvious; none packs the maximum content in. If you set it very large there will not be room left for the pages, and the tool says so rather than producing something unusable.",
  },
  {
    question: "Is my PDF uploaded?",
    answer:
      "No. The re-imposition happens with pdf-lib inside your browser. Nothing is sent anywhere.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="pdf"
      slug="n-up-pdf"
      title="Multiple Pages per Sheet"
      description="Fit 2, 4, 6 or 9 pages onto every sheet — handouts, drafts, anything you print a lot of."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Multiple Pages per Sheet" },
      ]}
      steps={[
        "Drop in a PDF",
        "Choose how many pages per sheet and how much gap",
        "Combine, then download the result",
      ]}
      articleContent={
        <>
          <h2>Why do this in the file rather than in the print dialog</h2>
          <p>
            Most print dialogs offer pages-per-sheet, and when it works it is fine. The
            problem is that it is a driver feature: the setting lives on one computer,
            behaves differently on every printer, is frequently missing entirely from
            mobile and web printing, and cannot be sent to anyone else.
          </p>
          <p>
            Doing it in the document produces a file that is already laid out. It prints
            the same way from any device, can be emailed to someone who will print it
            correctly without instructions, and can be checked on screen before any paper
            is used.
          </p>
          <h2>Embedded, not rasterised</h2>
          <p>
            Each source page is embedded as a form XObject — a reusable piece of page
            content that can be drawn at any scale. That keeps everything vector: the
            text in a 4-up handout is still real text, still selectable, still
            searchable, and still sharp when printed.
          </p>
          <p>
            The simpler approach would be to render each page to an image and paste the
            images down. That is far easier to write and throws away both the text layer
            and the resolution, which is why it is not what happens here.
          </p>
          <h2>Layout and orientation</h2>
          <p>
            The 2-up and 6-up layouts turn the sheet landscape, because two portrait
            pages side by side need a wide sheet. The 4-up and 9-up layouts keep it
            portrait, since a square-ish grid of portrait pages fits a portrait sheet.
          </p>
          <p>
            Pages of different sizes are each scaled to fit their slot while keeping
            their own proportions, so a mixed document does not end up with some pages
            stretched.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <NupPdfTool />
    </ToolPageShell>
  );
}
