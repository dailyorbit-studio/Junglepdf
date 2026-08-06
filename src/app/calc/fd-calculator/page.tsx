import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import FdCalculatorTool from "./FdCalculatorTool";

export const metadata: Metadata = toolMetadata({
  category: "calc",
  slug: "fd-calculator",
  title: "FD Calculator — Fixed Deposit Maturity & Interest",
  description:
    "Calculate the maturity amount and interest on a fixed deposit at any compounding frequency. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Why does compounding frequency matter?",
    answer:
      "The more often interest is added to the balance, the more it earns interest itself. Quarterly compounding — the usual bank default — yields a little more than yearly at the same rate, and monthly a little more again.",
  },
  {
    question: "Is this the amount I receive?",
    answer:
      "It is the gross maturity value. Interest on a fixed deposit is taxable, and TDS may apply, so your in-hand amount can be lower depending on your tax situation.",
  },
  {
    question: "Are my figures uploaded?",
    answer: "No. The calculation runs entirely in your browser.",
  },
];

export default function FdCalculatorPage() {
  return (
    <ToolPageShell
      category="calc"
      slug="fd-calculator"
      title="FD Calculator"
      description="Calculate the maturity amount and interest on a fixed deposit. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calc" },
        { label: "FD Calculator" },
      ]}
      steps={[
        "Enter the deposit amount, rate and tenure.",
        "Choose how often interest compounds.",
        "Read the maturity amount and interest earned.",
      ]}
      articleContent={
        <>
          <h2>What your deposit grows to</h2>
          <p>
            A fixed deposit earns compound interest, so the maturity value is more
            than the simple rate times the years. This calculator applies the
            compounding at the frequency your bank uses and shows both the final
            amount and how much of it is interest.
          </p>
          <h2>Compare the frequencies</h2>
          <p>
            Switch the compounding between yearly, quarterly and monthly to see
            how the maturity value shifts at the same rate — a small but real
            difference over a long tenure. Note the figure is before tax. It all
            runs on your device, so nothing you enter is stored.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <FdCalculatorTool />
    </ToolPageShell>
  );
}
