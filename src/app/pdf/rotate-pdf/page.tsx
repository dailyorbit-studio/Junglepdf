import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import RotatePdfTool from "./RotatePdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "rotate-pdf",
  title: "Rotate PDF — Turn PDF Pages 90, 180 or 270 Degrees",
  description:
    "Rotate every page of a PDF or just the ones you choose. Lossless — nothing is re-rendered. Runs entirely in your browser, no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Does rotating a PDF reduce quality?",
    answer:
      "No, not at all. A PDF page carries a rotation entry that viewers apply when displaying it. This tool changes that entry and nothing else — no text is re-laid out, no image is re-encoded, and the file size barely moves. It is genuinely lossless in a way that rotating a JPEG is not.",
  },
  {
    question: "Why did my page end up at 180 degrees instead of 90?",
    answer:
      "Because rotation is cumulative. If a scanner already saved the page with a 90 degree rotation and you ask for another 90, the correct result is 180. Anything else would mean the tool silently discarding what was already there — which is exactly the surprise you would hit when a document mixes sideways and upright pages.",
  },
  {
    question: "Can I rotate only some of the pages?",
    answer:
      "Yes. Choose Specific pages and enter numbers and ranges separated by commas, like 1-3, 5, 8-10. This is the common case for scanned documents where a handful of landscape tables sit among portrait pages.",
  },
  {
    question: "The rotation looks right here but wrong in another program. Why?",
    answer:
      "Some older software ignores the page rotation entry and renders the raw page content instead. That is a bug in the reader rather than in the file, but if you need a document that behaves identically everywhere, printing it to PDF from a viewer that honours rotation will bake the orientation into the content stream.",
  },
  {
    question: "Is my PDF uploaded to a server?",
    answer:
      "No. The rotation happens in your browser using pdf-lib. The file is read into memory, the rotation entries are updated, and the document is re-saved locally. Nothing is transmitted over the network.",
  },
];

export default function RotatePdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="rotate-pdf"
      title="Rotate PDF"
      description="Turn pages 90, 180 or 270 degrees — all of them, or just the ones you name. Lossless, and nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Rotate PDF" },
      ]}
      articleContent={
        <>
          <h2>How PDF rotation actually works</h2>
          <p>
            Unlike a photograph, a PDF page does not need its contents redrawn
            to appear rotated. Every page carries a <strong>/Rotate</strong>{" "}
            entry — a number that must be a multiple of 90 — and viewers apply
            it at display time. The page&apos;s text, vectors and images stay
            exactly where they were.
          </p>
          <p>
            That makes rotation the cheapest operation in this toolkit. There
            is no re-encoding step, no quality setting, and no meaningful
            growth in file size. A 200-page document rotates as fast as a
            one-page one.
          </p>
          <h2>Rotation is cumulative, on purpose</h2>
          <p>
            Scanners and phone scanning apps frequently write a rotation entry
            of their own. When you ask this tool for a 90 degree turn, it adds
            to whatever was already there rather than replacing it.
          </p>
          <p>
            The alternative — overwriting the existing value — would mean that
            rotating a mixed document produces pages that all end up facing the
            same way regardless of how they started, which is almost never what
            anyone wants. Adding preserves the relative orientation between
            pages, so a document where half the pages were already sideways
            stays internally consistent.
          </p>
          <h2>When a rotated PDF still looks wrong elsewhere</h2>
          <p>
            Honouring /Rotate is required by the PDF specification, but a
            handful of older tools and some poorly-written print pipelines
            ignore it and render the raw page content instead. The symptom is a
            document that looks correct in your browser and in Acrobat, then
            comes out of a printer sideways.
          </p>
          <p>
            If you hit that, the workaround is to flatten the rotation into the
            content itself by printing to PDF from a viewer that does honour
            it. You lose the losslessness, but you gain a file that every
            downstream tool agrees about.
          </p>
          <h2>Common uses</h2>
          <ul>
            <li>Fixing scanned documents where the feeder pulled pages in sideways</li>
            <li>Turning landscape spreadsheets or tables upright inside a portrait report</li>
            <li>Correcting a phone-scanned document before sending it on</li>
            <li>Preparing a file for a printer that will not rotate for you</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <RotatePdfTool />
    </ToolPageShell>
  );
}
