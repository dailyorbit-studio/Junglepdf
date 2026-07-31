import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import WatermarkPdfTool from "./WatermarkPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "watermark-pdf",
  title: "Watermark PDF — Add Text Across Every Page",
  description:
    "Overlay text such as CONFIDENTIAL or DRAFT across every page of a PDF, with control over angle, opacity, size and colour. No uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Does a watermark stop people copying my document?",
    answer:
      "No, and it is important to be clear about that. The watermark is ordinary text drawn into the page content stream. Anyone with a PDF editor can delete it in a few clicks, and it has no effect at all on selecting, copying or printing. What it does is make an unauthorised copy obviously identifiable when someone sees it — which is a social deterrent, not a technical one.",
  },
  {
    question: "What angle and opacity should I use?",
    answer:
      "45 degrees at around 15 to 20 percent opacity is the familiar look, and it stays legible without fighting the text underneath. Go lower on opacity for a document meant to be read closely, higher if the point is that nobody should mistake it for a final version. Zero degrees gives a horizontal band, which reads more like a stamp than a watermark.",
  },
  {
    question: "Why can't I use accented or non-Latin characters?",
    answer:
      "The tool uses one of the fonts built into every PDF reader, which avoids embedding a font file and keeps the output small. Those fonts are WinAnsi-encoded and cover Latin-1 only, so anything outside that range — Cyrillic, Greek, CJK, and many accented characters — cannot be drawn. The tool checks as you type and tells you which character is the problem rather than failing partway through.",
  },
  {
    question: "Can I use an image or logo instead of text?",
    answer:
      "Not in this tool. Text-only keeps the output tiny and the behaviour predictable. If you need a logo watermark, one approach is to build a single-page PDF containing the logo at the opacity you want and use it as a background in whatever produced the original document.",
  },
  {
    question: "Does the watermark go on top of or behind the content?",
    answer:
      "On top. It is drawn after the existing page content, so it overlays text and images. That is what makes a low opacity setting important — at full opacity it would obscure whatever it crosses.",
  },
  {
    question: "Is my PDF uploaded anywhere?",
    answer:
      "No. pdf-lib draws the watermark into each page in your browser's memory and saves the document locally. Nothing is transmitted, which matters given that the documents people watermark are usually the ones they least want on someone else's server.",
  },
];

export default function WatermarkPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="watermark-pdf"
      title="Watermark PDF"
      description="Stamp text diagonally across every page, at the size, colour and transparency you choose. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Watermark PDF" },
      ]}
      articleContent={
        <>
          <h2>What a watermark is for</h2>
          <p>
            A watermark marks a document&apos;s status so that a copy cannot be
            mistaken for something it is not. A contract stamped DRAFT will not
            be signed by accident. A price list stamped SAMPLE will not be
            quoted from. A report stamped CONFIDENTIAL announces its handling
            requirements to anyone who happens to see it on a desk.
          </p>
          <p>
            None of that is enforcement. The value is in making the status
            impossible to overlook, not in preventing anything. Treating a
            watermark as a control is the mistake this tool tries hardest to
            steer you away from.
          </p>
          <h2>Why it is not a security feature</h2>
          <p>
            The text is drawn into the page&apos;s content stream, exactly like
            the document&apos;s own text. It is not a separate layer, not an
            annotation, and not protected by anything. A PDF editor will remove
            it. So will printing the document and rescanning it, or in some
            cases simply selecting and deleting it.
          </p>
          <p>
            Real restrictions on copying and printing require document
            encryption with permission flags, which pdf-lib cannot produce —
            and which, in practice, most PDF tooling ignores anyway. If a
            document genuinely must not leave a set of hands, a watermark is
            not the mechanism.
          </p>
          <h2>Choosing angle, opacity and size</h2>
          <p>
            The diagonal at 45 degrees is conventional for a reason: it crosses
            the maximum amount of page while running against the grain of the
            text, so it stays visible without ever aligning with a line of
            content and becoming hard to distinguish from it.
          </p>
          <p>
            Opacity is the setting that decides whether the document is still
            usable. Somewhere between 10 and 20 percent is legible as a
            watermark while leaving the text underneath comfortable to read.
            Above about 40 percent the document becomes tiring, which is
            occasionally the point — a draft nobody should be reading closely
            is a legitimate reason to make it slightly unpleasant.
          </p>
          <p>
            Size is capped by the page width in the sense that an oversized
            watermark simply runs off both edges and loses its beginning and
            end. The preview shows the relationship between size and angle
            before you commit, which is the fastest way to find the setting
            that fits.
          </p>
          <h2>Common uses</h2>
          <ul>
            <li>Marking contract revisions as DRAFT before a final version exists</li>
            <li>Labelling internal documents CONFIDENTIAL before circulation</li>
            <li>Stamping SAMPLE on portfolio work or template documents</li>
            <li>Marking a duplicate as COPY so the original stays identifiable</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <WatermarkPdfTool />
    </ToolPageShell>
  );
}
