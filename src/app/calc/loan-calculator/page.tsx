import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import LoanCalculatorTool from "./LoanCalculatorTool";

export const metadata: Metadata = toolMetadata({
  category: "calc",
  slug: "loan-calculator",
  title: "Loan Calculator — Monthly Payment & Total Interest",
  description:
    "Calculate the monthly payment, total interest and total cost of any loan from the amount, rate and term. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What does 'total interest' include?",
    answer:
      "Every rupee of interest paid across the life of the loan — the difference between the total repaid and the amount borrowed. On longer terms it can rival or exceed the principal itself.",
  },
  {
    question: "How can I reduce the total interest?",
    answer:
      "A shorter term or a lower rate both cut it, and a shorter term does so most sharply because interest accrues over fewer months. Raising the term lowers the monthly payment but adds to the lifetime cost.",
  },
  {
    question: "Are my figures uploaded?",
    answer: "No. The calculation runs entirely in your browser.",
  },
];

export default function LoanCalculatorPage() {
  return (
    <ToolPageShell
      category="calc"
      slug="loan-calculator"
      title="Loan Calculator"
      description="See the monthly payment, total interest and total cost of any loan. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calc" },
        { label: "Loan Calculator" },
      ]}
      steps={[
        "Enter the loan amount, interest rate and term.",
        "Read the monthly payment.",
        "Check the total interest and total repaid.",
      ]}
      articleContent={
        <>
          <h2>The full cost of a loan</h2>
          <p>
            The monthly payment is only half the picture. This calculator also
            shows what the loan costs in total — the interest you pay on top of
            the amount borrowed — so you can compare offers on the number that
            actually matters rather than just the headline monthly figure.
          </p>
          <h2>Model before you commit</h2>
          <p>
            Change the amount, rate or term and watch the payment and total
            interest respond. It is the quickest way to find a term you can
            afford monthly without overpaying across the years. Every figure is
            computed on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <LoanCalculatorTool />
    </ToolPageShell>
  );
}
