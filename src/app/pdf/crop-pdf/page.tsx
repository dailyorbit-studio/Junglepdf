import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import CropPdfTool from "./CropPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "crop-pdf",
  title: "Crop PDF — Trim Margins and White Space Online, Free",
  description:
    "Crop the margins off a PDF with a live preview. Trim every page or just the ones you pick. Runs entirely in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Does cropping actually delete the content outside the box?",
    answer:
      "No, and this is the single most important thing to know about it. Cropping sets the page's CropBox — a rectangle telling viewers which part to display. The content outside it is still in the file, and anyone can widen the box again and read it. Never use cropping to hide a signature, a header, or anything confidential.",
  },
  {
    question: "So how do I actually remove something from a page?",
    answer:
      "You cannot, safely, with any crop or annotation tool. Drawing a black box over text leaves the text underneath, selectable and searchable — that is how several well-publicised legal redaction failures happened. The only reliable approach is to remove the sensitive text in the source document and re-export the PDF, or to remove the whole page.",
  },
  {
    question: "Why is cropping lossless if the file changes?",
    answer:
      "Because nothing is re-rendered. The page's content stream — its text, fonts, vectors and images — is left exactly as it was, and only a rectangle in the page dictionary changes. That is why cropping a 300-page document is instant and why the file size barely moves.",
  },
  {
    question: "The preview looks right but the crop trimmed the wrong side.",
    answer:
      "That usually means the page carries a rotation flag, most often from a scanner. A page displayed sideways still has an upright coordinate system underneath, so \"top\" as you see it is a different edge internally. This tool accounts for rotation, but if a document mixes rotated and unrotated pages, crop them in separate passes using the page selection field.",
  },
  {
    question: "Can I crop each page differently?",
    answer:
      "Not in one pass — the margins you set apply to every page you select. To crop pages differently, run the tool more than once, naming a different set of pages each time. Each pass measures its margins against what is currently visible, so the results stack the way you would expect.",
  },
  {
    question: "Is my PDF uploaded to a server?",
    answer:
      "No. The preview is rendered by pdf.js and the crop is applied by pdf-lib, both inside your browser. Nothing crosses the network.",
  },
];

export default function CropPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="crop-pdf"
      title="Crop PDF"
      description="Trim the margins off a PDF with a live preview of exactly what you'll keep."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Crop PDF" },
      ]}
      steps={[
        "Drop your PDF into the box above — it stays on your device.",
        "Drag the margin sliders until the preview shows what you want to keep.",
        "Crop, then download the trimmed document.",
      ]}
      articleContent={
        <>
          <h2>What cropping a PDF actually does</h2>
          <p>
            Every PDF page carries a <strong>MediaBox</strong> — the size of the
            sheet it was laid out on — and may also carry a{" "}
            <strong>CropBox</strong>, a smaller rectangle telling viewers which
            part of that sheet to display. Cropping here writes the CropBox and
            changes nothing else.
          </p>
          <p>
            That makes it the cheapest operation available. The content stream is
            untouched, so text stays selectable, fonts stay embedded, images keep
            their original encoding, and there is no quality loss of any kind. A
            300-page document crops as fast as a one-page one, and the file size
            barely moves.
          </p>

          <h2>Cropping is not redaction</h2>
          <p>
            This is worth stating bluntly because it catches people out with real
            consequences. The content outside the CropBox{" "}
            <strong>is still in the file</strong>. It is not displayed, but it has
            not been deleted — anyone who opens the document in an editor and
            widens the box can read every word of it.
          </p>
          <p>
            The same trap applies to drawing a black rectangle over a paragraph:
            the rectangle is a new object painted on top, and the text underneath
            remains fully selectable and fully searchable. Court filings and
            corporate documents have leaked exactly this way, repeatedly.
          </p>
          <p>
            If something must genuinely be removed, remove it in the source
            document and re-export, or delete the whole page with the Remove Pages
            tool. There is no safe shortcut.
          </p>

          <h2>Rotation, and why it matters here</h2>
          <p>
            Scanners frequently save pages with a rotation flag rather than
            rotating the content itself. Such a page displays sideways but still
            has an upright coordinate system underneath, which means the edge you
            think of as &ldquo;top&rdquo; is not the top as far as the file is
            concerned.
          </p>
          <p>
            This tool reads each page&apos;s rotation and re-maps your margins to
            match, so the preview and the result agree. Where a single document
            mixes rotated and unrotated pages, crop them in separate passes with
            the page selection field — the correct margins for one group are
            rarely the correct margins for the other.
          </p>

          <h2>Cropping a page that was already cropped</h2>
          <p>
            Margins are measured against what is currently visible rather than
            against the full sheet. A page that already has a CropBox has been
            cropped before, and applying another 10% takes 10% off what you can
            see now — which is what anyone adjusting a crop actually expects.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Removing the wide white margins from a scanned book so it fills an e-reader</li>
            <li>Trimming printer crop marks and bleed off a proof</li>
            <li>Cutting a running header or footer out of the visible area</li>
            <li>Making a document fit a tablet screen without shrinking the text</li>
            <li>Squaring up a photographed page before printing</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <CropPdfTool />
    </ToolPageShell>
  );
}
