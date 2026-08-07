import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import LengthTool from "./LengthTool";

export const metadata: Metadata = toolMetadata({
  category: "unit",
  slug: "length",
  title: "Length Converter — cm, inches, feet, miles & More",
  description:
    "Convert between metres, centimetres, feet, inches, miles and kilometres instantly. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Which units are supported?",
    answer:
      "Metric (mm, cm, m, km) and imperial (inch, foot, yard, mile), plus the nautical mile. Pick any two and convert in either direction.",
  },
  {
    question: "How accurate is it?",
    answer:
      "Conversions use the exact internationally-defined factors — an inch is exactly 25.4 mm, a mile exactly 1609.344 m — so the results are precise to well beyond everyday needs.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. The conversion runs entirely in your browser.",
  },
];

export default function LengthPage() {
  return (
    <ToolPageShell
      category="unit"
      slug="length"
      title="Length Converter"
      description="Convert between metres, feet, inches, miles and more. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Unit Converter", href: "/unit" },
        { label: "Length Converter" },
      ]}
      steps={["Enter a value and choose its unit.", "Pick the unit to convert to.", "Read the result, or swap the two units."]}
      articleContent={
        <>
          <h2>Metric and imperial, either way</h2>
          <p>
            Length is the conversion people reach for most — a height in cm to
            inches, a distance in km to miles, a measurement in feet to metres.
            This converter handles all of them from a single value, and the swap
            button flips the direction without retyping.
          </p>
          <h2>Exact factors, on your device</h2>
          <p>
            The tool uses the exact standard conversion factors, so results are
            accurate rather than rounded approximations. Everything is computed
            locally, so it works instantly and offline once the page has loaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <LengthTool />
    </ToolPageShell>
  );
}
