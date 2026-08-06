import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import PercentageCalculatorTool from "./PercentageCalculatorTool";

export const metadata: Metadata = toolMetadata({
  category: "calc",
  slug: "percentage-calculator",
  title: "Percentage Calculator — Percent Of, Change & More",
  description:
    "Solve the common percentage questions: X% of a number, X is what percent of Y, and percentage increase or decrease. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What can it work out?",
    answer:
      "Three things: a percentage of a number (20% of 150), what percentage one number is of another (30 is what % of 150), and the percentage change between two numbers (from 150 to 180). Switch tabs to pick the question.",
  },
  {
    question: "How is percentage change calculated?",
    answer:
      "As the difference divided by the starting value, times 100. A rise from 150 to 180 is a 20% increase; a fall from 180 to 150 is a 16.67% decrease — note the base is different each way.",
  },
  {
    question: "Are my numbers uploaded?",
    answer: "No. Every calculation runs in your browser.",
  },
];

export default function PercentageCalculatorPage() {
  return (
    <ToolPageShell
      category="calc"
      slug="percentage-calculator"
      title="Percentage Calculator"
      description="Solve the common percentage questions — of, what-percent, and change. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calc" },
        { label: "Percentage Calculator" },
      ]}
      steps={[
        "Pick the question you want to answer.",
        "Enter the two numbers.",
        "Read the result instantly.",
      ]}
      articleContent={
        <>
          <h2>Three percentage questions, one tool</h2>
          <p>
            Most percentage problems are one of three: finding a percentage of a
            number, working out what percentage one number is of another, or
            measuring the change between two values. Rather than remember which
            way to divide each time, pick the question here and enter your
            numbers.
          </p>
          <h2>Instant and private</h2>
          <p>
            The answer updates as you type, so it doubles as a quick sanity check
            on a figure someone has quoted you. It all runs on your device —
            nothing you enter leaves the page.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <PercentageCalculatorTool />
    </ToolPageShell>
  );
}
