import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import HexToRgbTool from "./HexToRgbTool";

export const metadata: Metadata = toolMetadata({
  category: "color",
  slug: "hex-to-rgb",
  title: "HEX to RGB Converter — Color Code Converter",
  description:
    "Convert a HEX colour code to RGB and HSL with a live swatch, ready to copy. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Does it accept short HEX codes?",
    answer:
      "Yes. Three-digit shorthand like #0a3 is expanded to the full six-digit form before converting, so both work.",
  },
  {
    question: "What's the difference between RGB and HSL?",
    answer:
      "RGB describes a colour by its red, green and blue components — how a screen makes it. HSL describes it by hue, saturation and lightness, which is more intuitive for adjusting a colour by hand. The converter shows both.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. The conversion runs entirely in your browser.",
  },
];

export default function HexToRgbPage() {
  return (
    <ToolPageShell
      category="color"
      slug="hex-to-rgb"
      title="HEX to RGB Converter"
      description="Convert a HEX colour code to RGB and HSL, with a live swatch. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Color", href: "/color" },
        { label: "HEX to RGB Converter" },
      ]}
      steps={["Type a HEX code or pick a colour.", "See the RGB and HSL values.", "Copy the format you need."]}
      articleContent={
        <>
          <h2>One colour, every format</h2>
          <p>
            HEX is the compact way to write a colour in CSS, but you often need it
            as rgb() — for an alpha value, say — or as hsl() to tweak it. Paste a
            HEX code or pick from the swatch and this tool shows all three,
            each ready to copy.
          </p>
          <h2>Accurate and local</h2>
          <p>
            The conversion uses the standard colour maths and runs entirely on your
            device, so it is instant and nothing you enter is uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <HexToRgbTool />
    </ToolPageShell>
  );
}
