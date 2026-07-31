import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ReversePdfTool from "./ReversePdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "reverse-pdf",
  title: "Reverse PDF — Flip the Page Order Back to Front",
  description:
    "Reverse the page order of a PDF so the last page comes first. Lossless — pages are copied, not re-rendered. Runs entirely in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "Does reversing lose any quality?",
    answer:
      "None. The pages are copied as-is into a new document — no rendering, no re-encoding, no resampling. The result is byte-for-byte the same page content in the opposite order.",
  },
  {
    question: "Can I reverse only part of the document?",
    answer:
      "Not in this tool — it reverses everything. To reverse a section, use Extract Pages to pull that range out, reverse it here, then merge it back with the other parts.",
  },
  {
    question: "Will my bookmarks survive?",
    answer:
      "No. Bookmarks and form fields are stored on the document catalogue, not the pages, and cannot be carried across by the copy operation. The tool detects them and tells you when your file contains either.",
  },
  {
    question: "My scanner produced pages in the wrong order — is this the fix?",
    answer:
      "If the whole document is simply backwards, yes. If the pages are interleaved oddly — all odds then all evens, for example — use Organize PDF instead, which lets you set an arbitrary order.",
  },
  {
    question: "Is my PDF uploaded?",
    answer:
      "No. The document is rearranged by pdf-lib inside your browser and handed straight back as a download.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="pdf"
      slug="reverse-pdf"
      title="Reverse PDF"
      description="Flip the page order so the document runs back to front."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Reverse PDF" },
      ]}
      steps={[
        "Drop in a PDF",
        "Reverse",
        "Download the result",
      ]}
      articleContent={
        <>
          <h2>When you need this</h2>
          <p>
            The usual reason is a scanner. Feed a stack of paper face-up into a
            document feeder and the pages come out in the opposite order to the one you
            wanted, and a long scan is not something anyone wants to redo.
          </p>
          <p>
            The other common case is a duplex workaround: scanning all the odd pages,
            flipping the stack, and scanning the evens — which produces a reversed second
            half that has to be turned around before the two can be interleaved.
          </p>
          <h2>Nothing is re-rendered</h2>
          <p>
            Reversing copies the existing page objects into a new document in the
            opposite order. The text stays text, images keep their exact resolution and
            encoding, and the file size stays where it was.
          </p>
          <p>
            Copying into a fresh document rather than shuffling the original in place
            also drops any orphaned objects the original was carrying, so the output is
            occasionally slightly smaller than the input.
          </p>
          <h2>What does not survive</h2>
          <p>
            Bookmarks and interactive form fields live on the document catalogue rather
            than on individual pages, and the page-copying API cannot bring them across.
            If your file has either, the tool detects it and says so after the conversion
            rather than losing them quietly.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ReversePdfTool />
    </ToolPageShell>
  );
}
