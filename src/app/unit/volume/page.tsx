import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import VolumeTool from "./VolumeTool";

export const metadata: Metadata = toolMetadata({
  category: "unit",
  slug: "volume",
  title: "Volume Converter — litres, gallons, cups, ml",
  description:
    "Convert between litres, gallons, millilitres, cups, tablespoons and more instantly. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Does it include cooking measures?",
    answer:
      "Yes — teaspoons, tablespoons, cups, fluid ounces and pints (US), alongside metric litres and millilitres, so it works for recipes as well as fuel or containers.",
  },
  {
    question: "US or UK gallons?",
    answer:
      "Both are listed separately, because they differ noticeably — a UK gallon is about 4.55 litres versus 3.79 for a US gallon. Pick the one your recipe or spec uses.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. The conversion runs entirely in your browser.",
  },
];

export default function VolumePage() {
  return (
    <ToolPageShell
      category="unit"
      slug="volume"
      title="Volume Converter"
      description="Convert between litres, gallons, cups, millilitres and more. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Unit Converter", href: "/unit" },
        { label: "Volume Converter" },
      ]}
      steps={["Enter a value and choose its unit.", "Pick the unit to convert to.", "Read the result, or swap the units."]}
      articleContent={
        <>
          <h2>Recipes, fuel and containers</h2>
          <p>
            Volume conversions crop up in the kitchen and the workshop alike —
            cups to millilitres, litres to gallons, tablespoons to fluid ounces.
            This converter covers metric, US and cooking units together, with the
            US and UK gallons kept separate because the difference matters.
          </p>
          <h2>Instant and private</h2>
          <p>
            Everything is computed on your device using exact factors, so the
            answer is accurate and immediate, and nothing you enter is uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <VolumeTool />
    </ToolPageShell>
  );
}
