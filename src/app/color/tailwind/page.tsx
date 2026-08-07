import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import TailwindTool from "./TailwindTool";

export const metadata: Metadata = toolMetadata({
  category: "color",
  slug: "tailwind",
  title: "Tailwind Color Generator — 50–950 Shade Scale",
  description:
    "Generate a Tailwind-style 50 to 950 shade scale from any base colour, with config ready to paste. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How is the scale built?",
    answer:
      "It keeps your colour's hue and saturation and steps the lightness across the 11 Tailwind stops, from a very light 50 to a very dark 950. The result mirrors how Tailwind's own palettes are structured.",
  },
  {
    question: "How do I use the output?",
    answer:
      "Copy the config block and drop it into the colors section of your tailwind.config.js under a name of your choice, then use classes like bg-brand-500 or text-brand-700.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. The scale and config are generated in your browser. Click any swatch to copy its HEX.",
  },
];

export default function TailwindPage() {
  return (
    <ToolPageShell
      category="color"
      slug="tailwind"
      title="Tailwind Color Generator"
      description="Generate a Tailwind-style 50–950 shade scale from any base colour. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Color", href: "/color" },
        { label: "Tailwind Color Generator" },
      ]}
      steps={["Pick a base colour and name it.", "Review the 11-step scale.", "Copy the config into tailwind.config.js."]}
      articleContent={
        <>
          <h2>A full Tailwind scale from one colour</h2>
          <p>
            Tailwind expects each colour as an 11-step scale from 50 to 950, and
            hand-picking all eleven is tedious. Give this tool a base colour and it
            generates the whole scale by holding the hue and saturation and
            stepping the lightness, then hands you a config block ready to paste.
          </p>
          <h2>Copy and go</h2>
          <p>
            Name the colour, copy the generated object into your Tailwind config,
            and the usual utility classes work against it. Every swatch also copies
            its HEX with a click. It all runs on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <TailwindTool />
    </ToolPageShell>
  );
}
