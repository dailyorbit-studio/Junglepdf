import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import BarcodeTool from "./BarcodeTool";

export const metadata: Metadata = toolMetadata({
  category: "qr",
  slug: "barcode",
  title: "Barcode Generator — CODE128, EAN, UPC & More",
  description:
    "Generate a barcode in CODE128, EAN, UPC and other formats and download it as a PNG. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Which format should I use?",
    answer:
      "CODE128 handles any text or number and is the safe default. Use EAN-13 or UPC-A only for real retail product codes — they require an exact digit count and a valid check digit, so arbitrary text will be rejected.",
  },
  {
    question: "Why does it say my value is invalid?",
    answer:
      "Each retail format has strict rules — EAN-13 needs 12 or 13 digits, UPC-A needs 11 or 12, and so on. If the value does not fit, switch to CODE128, which accepts almost anything.",
  },
  {
    question: "Is the barcode free and uploaded anywhere?",
    answer:
      "It is free to use with no watermark, and it is generated entirely in your browser — the value you encode is never uploaded.",
  },
];

export default function BarcodePage() {
  return (
    <ToolPageShell
      category="qr"
      slug="barcode"
      title="Barcode Generator"
      description="Generate a barcode in CODE128, EAN, UPC and other formats. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "QR Codes", href: "/qr" },
        { label: "Barcode Generator" },
      ]}
      steps={["Enter the value to encode.", "Pick a barcode format.", "Download the barcode as a PNG."]}
      articleContent={
        <>
          <h2>Barcodes for labels and stock</h2>
          <p>
            A barcode encodes a number or short string as bars a scanner can read.
            This generator supports the common one-dimensional formats — CODE128
            for general use, plus the retail EAN and UPC families — and renders the
            barcode live as you type, ready to download as a clean PNG for labels
            or inventory.
          </p>
          <h2>Strict where it needs to be</h2>
          <p>
            Retail formats enforce a fixed length and a check digit, so the tool
            tells you when a value does not fit rather than producing a barcode
            that will not scan. For anything that is not an official product code,
            CODE128 is the flexible choice. Everything is generated on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <BarcodeTool />
    </ToolPageShell>
  );
}
