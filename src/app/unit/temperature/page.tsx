import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import TemperatureTool from "./TemperatureTool";

export const metadata: Metadata = toolMetadata({
  category: "unit",
  slug: "temperature",
  title: "Temperature Converter — Celsius, Fahrenheit, Kelvin",
  description:
    "Convert between Celsius, Fahrenheit and Kelvin with the correct formulas. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Why isn't temperature a simple ratio?",
    answer:
      "Because the scales do not share a zero point. Converting Celsius to Fahrenheit multiplies by 9/5 and then adds 32; Kelvin shifts Celsius by 273.15. This tool applies the real formulas rather than a single factor, so the results are correct.",
  },
  {
    question: "What's the quick Celsius-to-Fahrenheit rule?",
    answer:
      "Multiply by 1.8 and add 32. For example 20°C × 1.8 = 36, plus 32 = 68°F. The converter does it exactly, but that mental shortcut is close enough for a quick estimate.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. The conversion runs entirely in your browser.",
  },
];

export default function TemperaturePage() {
  return (
    <ToolPageShell
      category="unit"
      slug="temperature"
      title="Temperature Converter"
      description="Convert between Celsius, Fahrenheit and Kelvin. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Unit Converter", href: "/unit" },
        { label: "Temperature Converter" },
      ]}
      steps={["Enter a temperature and its scale.", "Pick the scale to convert to.", "Read the result, or swap the scales."]}
      articleContent={
        <>
          <h2>The three scales, done right</h2>
          <p>
            Temperature is the one everyday conversion that is not a simple
            multiplication, because Celsius, Fahrenheit and Kelvin do not start
            from the same zero. This converter uses the correct formula for each
            direction, so 0°C comes out as exactly 32°F and 273.15 K, not an
            approximation.
          </p>
          <h2>Instant and local</h2>
          <p>
            The calculation runs on your device, so it is immediate and works
            offline once loaded, with nothing uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <TemperatureTool />
    </ToolPageShell>
  );
}
