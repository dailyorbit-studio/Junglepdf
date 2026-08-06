import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import EmiCalculatorTool from "./EmiCalculatorTool";

export const metadata: Metadata = toolMetadata({
  category: "calc",
  slug: "emi-calculator",
  title: "EMI Calculator — Monthly Loan Instalment",
  description:
    "Calculate the monthly EMI on a home, car or personal loan from the amount, interest rate and tenure, with total interest and total payable. Runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "How is EMI calculated?",
    answer:
      "With the standard reducing-balance formula: EMI = P·r·(1+r)^n ÷ ((1+r)^n − 1), where P is the loan amount, r is the monthly interest rate, and n is the number of months. Every bank uses this same formula.",
  },
  {
    question: "Does the total interest look high?",
    answer:
      "Over a long tenure it often exceeds the amount borrowed, because interest compounds monthly over many years. A shorter tenure raises the EMI but cuts the total interest sharply — try both to see the trade-off.",
  },
  {
    question: "Are my figures uploaded?",
    answer: "No. The calculation runs entirely in your browser; nothing you enter is sent anywhere.",
  },
];

export default function EmiCalculatorPage() {
  return (
    <ToolPageShell
      category="calc"
      slug="emi-calculator"
      title="EMI Calculator"
      description="Work out the monthly EMI on a loan, with total interest and total payable. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calc" },
        { label: "EMI Calculator" },
      ]}
      steps={[
        "Enter the loan amount, interest rate and tenure.",
        "Read the monthly EMI instantly.",
        "Check the total interest and total payable below.",
      ]}
      articleContent={
        <>
          <h2>What your EMI really costs</h2>
          <p>
            An EMI — equated monthly instalment — is the fixed amount you repay
            each month, part principal and part interest. This calculator shows
            not just that monthly figure but the total interest you will pay over
            the loan and the total amount that leaves your account, so the real
            cost of borrowing is clear before you sign.
          </p>
          <h2>Try the levers</h2>
          <p>
            Interest rate and tenure both move the numbers a lot. A longer tenure
            lowers the monthly EMI but adds years of interest; a slightly better
            rate compounds into a large saving over time. Adjust the inputs and
            watch the breakdown update — it all happens on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <EmiCalculatorTool />
    </ToolPageShell>
  );
}
