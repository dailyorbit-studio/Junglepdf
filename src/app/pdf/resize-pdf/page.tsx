import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ResizePdfTool from "./ResizePdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "resize-pdf",
  title: "Resize PDF Pages — Convert Between A4, Letter and More",
  description:
    "Change a PDF’s page size between A4, Letter, Legal, A3 and A5. Content is scaled to fit and centred, never stretched. Runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "Why is there a white margin down one side?",
    answer:
      "Because the two paper sizes have different proportions. Scaling a Letter page onto A4 fits it by the tighter dimension and leaves a margin on the other, which is the only way to change size without stretching the content.",
  },
  {
    question: "Does resizing reduce quality?",
    answer:
      "No, for text and vector graphics — they are redrawn at the new size. Embedded photographs keep their original pixel count, so scaling a page up spreads the same pixels over more area, exactly as it would anywhere else.",
  },
  {
    question: "Can I use this to shrink a PDF’s file size?",
    answer:
      "No. This changes the page dimensions, not the compression. The file size stays roughly the same. Compress PDF is the tool for reducing size, though it is structural only.",
  },
  {
    question: "Which should I choose, A4 or Letter?",
    answer:
      "A4 for almost everywhere in the world; US Letter for the United States and Canada. If a printer or submission system has specified one, use that — a mismatch is what produces unexpected margins or a scaled print.",
  },
  {
    question: "Is my file uploaded?",
    answer:
      "No. The re-boxing is done by pdf-lib in your browser and the result is handed straight back.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="pdf"
      slug="resize-pdf"
      title="Resize PDF Pages"
      description="Move a document onto a different paper size — without distorting it."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Resize PDF Pages" },
      ]}
      steps={[
        "Drop in a PDF",
        "Pick the target paper size",
        "Resize, then download the result",
      ]}
      articleContent={
        <>
          <h2>A4 and Letter are not the same shape</h2>
          <p>
            A4 is 210 × 297mm, with an aspect ratio of about 1:1.414. US Letter is 216 ×
            279mm, about 1:1.294. Letter is slightly wider and noticeably shorter, which
            means neither fits inside the other without leaving a gap somewhere.
          </p>
          <p>
            Any tool that promises to “fill” the new page is therefore stretching your
            document — subtly, but enough to distort circles into ovals and to change
            every measurement in a technical drawing. This scales to fit and centres the
            result, so one axis gains a slightly larger margin. That margin is the
            geometry of the two paper sizes, not a mistake.
          </p>
          <h2>Vector all the way through</h2>
          <p>
            Pages are embedded and redrawn at the new scale rather than rendered to
            images. Text stays text, vector graphics stay vector, and embedded images
            keep their original pixels — they are simply drawn into a different sized
            box.
          </p>
          <p>
            That means scaling up from A5 to A3 does not soften anything: the type is
            redrawn at the larger size rather than enlarged as a bitmap. Photographs are
            the exception, since a photograph has a fixed pixel count however it is
            drawn.
          </p>
          <h2>Landscape pages</h2>
          <p>
            By default, a page that was landscape stays landscape and gets the landscape
            version of the target size. That keeps mixed documents — a report with a few
            wide tables in it — internally consistent.
          </p>
          <p>
            Turning that option off forces every page portrait, which is occasionally
            what a printing service or a submission system requires.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ResizePdfTool />
    </ToolPageShell>
  );
}
