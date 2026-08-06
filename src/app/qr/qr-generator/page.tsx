import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import QrGeneratorTool from "./QrGeneratorTool";

export const metadata: Metadata = toolMetadata({
  category: "qr",
  slug: "qr-generator",
  title: "QR Code Generator — Text & URL to QR, Free",
  description:
    "Turn any text or link into a QR code and download it as a PNG. Runs entirely in your browser — nothing is uploaded, no watermark.",
});

const FAQ_ITEMS = [
  {
    question: "Is the QR code free to use commercially?",
    answer:
      "Yes. The generated PNG is yours to use anywhere — print, packaging, slides — with no watermark, no expiry and no attribution required.",
  },
  {
    question: "Do these QR codes expire?",
    answer:
      "No. The QR encodes your text or link directly, so it works forever and never depends on this site being online. It is a static code, not a redirect through a tracking service.",
  },
  {
    question: "Is my data uploaded?",
    answer:
      "No. The code is generated in your browser. Whatever you encode — a link, a note — never leaves your device.",
  },
];

export default function QrGeneratorPage() {
  return (
    <ToolPageShell
      category="qr"
      slug="qr-generator"
      title="QR Code Generator"
      description="Turn any text or link into a downloadable QR code. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "QR Codes", href: "/qr" },
        { label: "QR Code Generator" },
      ]}
      steps={["Type or paste your text or URL.", "Adjust the size if you need to.", "Download the QR code as a PNG."]}
      articleContent={
        <>
          <h2>Any link or text, as a QR</h2>
          <p>
            A QR code is just a compact, camera-readable way to hand someone a
            piece of text — most often a URL. Paste your link or message and this
            tool encodes it directly into the code, so scanning it returns exactly
            what you entered. Size it to suit a poster or a business card and
            download a clean PNG.
          </p>
          <h2>Static and private</h2>
          <p>
            Because the data is baked into the code itself, there is no redirect
            and no tracking middleman — the code keeps working regardless of this
            site, and nothing you encode is uploaded. That is what makes it safe
            for anything from a WiFi link to a private note.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <QrGeneratorTool />
    </ToolPageShell>
  );
}
