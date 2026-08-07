import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import RgbToHslTool from "./RgbToHslTool";

export const metadata: Metadata = toolMetadata({
  category: "color",
  slug: "rgb-to-hsl",
  title: "RGB to HSL Converter — Color Code Converter",
  description:
    "Convert RGB values to HSL and HEX with a live swatch, ready to copy. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Why convert RGB to HSL?",
    answer:
      "HSL — hue, saturation, lightness — makes a colour easy to adjust by hand: nudge the lightness for a tint or shade, or rotate the hue for a related colour. Those edits are awkward in raw RGB.",
  },
  {
    question: "What range do the RGB values use?",
    answer:
      "0 to 255 for each of red, green and blue, the standard 8-bit range. Values are clamped to that range as you type.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. The conversion runs entirely in your browser.",
  },
];

export default function RgbToHslPage() {
  return (
    <ToolPageShell
      category="color"
      slug="rgb-to-hsl"
      title="RGB to HSL Converter"
      description="Convert RGB values to HSL and HEX, with a live swatch. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Color", href: "/color" },
        { label: "RGB to HSL Converter" },
      ]}
      steps={["Enter the red, green and blue values.", "See the HSL and HEX equivalents.", "Copy the format you need."]}
      articleContent={
        <>
          <h2>From screen values to something adjustable</h2>
          <p>
            RGB is how a screen builds a colour, but HSL is how a person thinks
            about one. Enter red, green and blue and this tool gives you the hue,
            saturation and lightness — plus the HEX code — so you can read the
            colour and tweak it in whichever form suits the task.
          </p>
          <h2>Instant and private</h2>
          <p>
            The conversion is standard colour maths run on your device, so it is
            immediate and nothing you enter leaves the page.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <RgbToHslTool />
    </ToolPageShell>
  );
}
