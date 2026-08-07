import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import PaletteTool from "./PaletteTool";

export const metadata: Metadata = toolMetadata({
  category: "color",
  slug: "palette",
  title: "Color Palette Generator — Schemes From One Color",
  description:
    "Generate complementary, analogous, triadic and tetradic palettes from a single base colour. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How are the palettes made?",
    answer:
      "By rotating your base colour around the colour wheel. Complementary is the opposite hue; analogous are the neighbours; triadic and tetradic are evenly-spaced sets. These relationships are the classic starting points for a harmonious scheme.",
  },
  {
    question: "Which scheme should I use?",
    answer:
      "Analogous schemes feel calm and cohesive; complementary schemes give strong contrast for accents; triadic and tetradic offer more variety. Try each against your design and pick what fits.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. The palettes are generated in your browser. Click any swatch to copy its HEX.",
  },
];

export default function PalettePage() {
  return (
    <ToolPageShell
      category="color"
      slug="palette"
      title="Palette Generator"
      description="Generate complementary, analogous and triadic palettes from one base colour. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Color", href: "/color" },
        { label: "Palette Generator" },
      ]}
      steps={["Pick a base colour.", "Compare the generated schemes.", "Click any swatch to copy its HEX."]}
      articleContent={
        <>
          <h2>Harmonious colours from one choice</h2>
          <p>
            Colour schemes that work tend to follow relationships on the colour
            wheel. Give this tool a base colour and it builds the classic sets —
            complementary, analogous, triadic and tetradic — by rotating the hue,
            so you can see several coherent directions at a glance.
          </p>
          <h2>A starting point, generated locally</h2>
          <p>
            These schemes are a strong foundation to refine rather than a finished
            palette, and every swatch copies with a click. It all runs on your
            device with nothing uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <PaletteTool />
    </ToolPageShell>
  );
}
