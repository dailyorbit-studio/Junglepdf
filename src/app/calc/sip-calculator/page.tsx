import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import SipCalculatorTool from "./SipCalculatorTool";

export const metadata: Metadata = toolMetadata({
  category: "calc",
  slug: "sip-calculator",
  title: "SIP Calculator — Mutual Fund Returns Estimate",
  description:
    "Estimate the future value of a monthly SIP from the amount, expected return and duration, split into what you invest and what you gain. Runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "How is the SIP value estimated?",
    answer:
      "Each monthly contribution compounds at the expected rate for the time it stays invested, using the standard future-value-of-an-annuity formula. Earlier instalments grow the most because they compound the longest.",
  },
  {
    question: "Is the return guaranteed?",
    answer:
      "No. Market-linked returns vary year to year, so the figure is a projection based on the constant rate you enter, not a promise. Use a realistic long-term average and treat the result as an estimate.",
  },
  {
    question: "Are my numbers uploaded?",
    answer: "No. Everything is calculated in your browser.",
  },
];

export default function SipCalculatorPage() {
  return (
    <ToolPageShell
      category="calc"
      slug="sip-calculator"
      title="SIP Calculator"
      description="Estimate the future value of a monthly SIP, split into invested amount and gains. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calc" },
        { label: "SIP Calculator" },
      ]}
      steps={[
        "Enter your monthly investment, expected return and duration.",
        "See the estimated maturity value.",
        "Compare what you invested against the projected gains.",
      ]}
      articleContent={
        <>
          <h2>The power of investing monthly</h2>
          <p>
            A systematic investment plan puts a fixed amount into a fund every
            month, and each instalment then compounds for as long as it stays
            invested. This calculator projects where that lands you, and — often
            more revealing — how much of the final figure is your own money
            versus growth on top.
          </p>
          <h2>An estimate, honestly labelled</h2>
          <p>
            Real returns fluctuate, so the projection assumes the steady rate you
            enter rather than predicting the market. It is best used to compare
            scenarios — a bigger monthly amount, a longer horizon — and to see how
            much time in the market matters. It runs entirely on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <SipCalculatorTool />
    </ToolPageShell>
  );
}
