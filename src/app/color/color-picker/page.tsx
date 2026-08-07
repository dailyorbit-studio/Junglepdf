import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ColorPickerTool from "./ColorPickerTool";

export const metadata: Metadata = toolMetadata({
  category: "color",
  slug: "color-picker",
  title: "Color Picker — HEX, RGB, HSL Codes & Shades",
  description:
    "Pick a colour from the spectrum and get its HEX, RGB and HSL codes plus a row of tints and shades. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How is this different from the image colour picker?",
    answer:
      "This one picks from the full colour spectrum and gives you its codes and a set of lighter and darker variations. The image tool in the Image section is an eyedropper that samples colours from a photo you upload — different jobs.",
  },
  {
    question: "What are tints and shades for?",
    answer:
      "They are lighter and darker versions of your chosen colour, useful for hover states, borders and backgrounds that need to relate to a main colour. Click any swatch to copy its HEX.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. Everything runs in your browser.",
  },
];

export default function ColorPickerPage() {
  return (
    <ToolPageShell
      category="color"
      slug="color-picker"
      title="Color Picker"
      description="Pick a colour and get its HEX, RGB and HSL codes plus tints and shades. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Color", href: "/color" },
        { label: "Color Picker" },
      ]}
      steps={["Pick a colour from the spectrum.", "Copy its HEX, RGB or HSL code.", "Grab a tint or shade from the row below."]}
      articleContent={
        <>
          <h2>A colour and everything around it</h2>
          <p>
            Pick a colour from the spectrum and this tool shows its HEX, RGB and
            HSL codes, plus a spread of tints and shades derived from it. That
            range is what you actually need in practice — a base colour rarely
            travels alone, it comes with the lighter and darker steps for states
            and surfaces.
          </p>
          <h2>Click to copy, all local</h2>
          <p>
            Every code and every shade copies with a click, and none of it leaves
            your device. It is a fast way to lift a whole mini-scale from a single
            colour choice.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ColorPickerTool />
    </ToolPageShell>
  );
}
