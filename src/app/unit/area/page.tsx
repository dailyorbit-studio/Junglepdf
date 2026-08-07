import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import AreaTool from "./AreaTool";

export const metadata: Metadata = toolMetadata({
  category: "unit",
  slug: "area",
  title: "Area Converter — sq ft, sq m, acres, hectares",
  description:
    "Convert between square metres, square feet, acres, hectares and more instantly. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Can it convert land units like acres and hectares?",
    answer:
      "Yes. Alongside the square metric and imperial units it includes acres and hectares, which are the units land is usually measured in — an acre is about 0.4 hectares.",
  },
  {
    question: "How accurate are the conversions?",
    answer:
      "They use exact standard factors, so an acre converts to precisely 4046.8564224 square metres. Results are accurate to well beyond practical needs.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. The conversion runs entirely in your browser.",
  },
];

export default function AreaPage() {
  return (
    <ToolPageShell
      category="unit"
      slug="area"
      title="Area Converter"
      description="Convert between square metres, acres, hectares, square feet and more. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Unit Converter", href: "/unit" },
        { label: "Area Converter" },
      ]}
      steps={["Enter a value and choose its unit.", "Pick the unit to convert to.", "Read the result, or swap the units."]}
      articleContent={
        <>
          <h2>From floor plans to farmland</h2>
          <p>
            Area conversions span everything from a room in square feet to a plot
            in acres or a field in hectares. This converter covers the square
            metric and imperial units plus the common land units, so you can move
            between them without keeping a table of factors handy.
          </p>
          <h2>Precise and local</h2>
          <p>
            The conversions use exact definitions and run entirely on your device,
            so they are both accurate and instant, with nothing uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <AreaTool />
    </ToolPageShell>
  );
}
