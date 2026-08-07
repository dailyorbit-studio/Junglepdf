import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import WeightTool from "./WeightTool";

export const metadata: Metadata = toolMetadata({
  category: "unit",
  slug: "weight",
  title: "Weight Converter — kg, lbs, oz, grams, stones",
  description:
    "Convert between kilograms, pounds, ounces, grams, stones and tonnes instantly. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Does it include stones?",
    answer:
      "Yes. Stones are included alongside kilograms, pounds, ounces, grams and tonnes, which is useful for body weight in places that still use them — one stone is about 6.35 kg.",
  },
  {
    question: "Is this weight or mass?",
    answer:
      "Strictly these are units of mass, but in everyday use they are called weight. The converter treats them as the standard interchangeable units, which is what people expect.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. The conversion runs entirely in your browser.",
  },
];

export default function WeightPage() {
  return (
    <ToolPageShell
      category="unit"
      slug="weight"
      title="Weight Converter"
      description="Convert between kilograms, pounds, ounces, grams, stones and tonnes. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Unit Converter", href: "/unit" },
        { label: "Weight Converter" },
      ]}
      steps={["Enter a value and choose its unit.", "Pick the unit to convert to.", "Read the result, or swap the units."]}
      articleContent={
        <>
          <h2>Kilograms to pounds and back</h2>
          <p>
            Weight is one of the most common conversions — kilograms to pounds for
            travel, grams to ounces for cooking, stones for body weight. This tool
            covers the metric and imperial units together so you never have to
            chain two conversions to get where you need.
          </p>
          <h2>Exact and on-device</h2>
          <p>
            It uses the exact definition of a pound (0.45359237 kg) and computes
            everything locally, so the result is precise and instant, with nothing
            uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <WeightTool />
    </ToolPageShell>
  );
}
