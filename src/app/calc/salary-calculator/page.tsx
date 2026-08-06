import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import SalaryCalculatorTool from "./SalaryCalculatorTool";

export const metadata: Metadata = toolMetadata({
  category: "calc",
  slug: "salary-calculator",
  title: "Salary Calculator — Annual to Monthly & Hourly",
  description:
    "Break a yearly salary down to monthly, weekly, daily and hourly pay based on your working hours. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Are these figures before or after tax?",
    answer:
      "Before. They are gross conversions of your annual salary across pay periods. Income tax, provident fund and other deductions are not applied, so your take-home will be lower.",
  },
  {
    question: "How is the hourly rate worked out?",
    answer:
      "By dividing the annual salary by the hours you work in a year — 52 weeks times your weekly hours. Change the hours-per-week field and the hourly figure updates to match.",
  },
  {
    question: "Are my figures uploaded?",
    answer: "No. The conversion runs entirely in your browser.",
  },
];

export default function SalaryCalculatorPage() {
  return (
    <ToolPageShell
      category="calc"
      slug="salary-calculator"
      title="Salary Calculator"
      description="Break a yearly salary down to monthly, weekly, daily and hourly pay. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calc" },
        { label: "Salary Calculator" },
      ]}
      steps={[
        "Enter your annual salary.",
        "Set your usual hours per week.",
        "Read the monthly, weekly, daily and hourly equivalents.",
      ]}
      articleContent={
        <>
          <h2>One salary, every pay period</h2>
          <p>
            Comparing a monthly offer to an hourly rate, or a yearly figure to
            what it works out to per day, means dividing by numbers that are easy
            to get wrong. This calculator does all of them at once from your
            annual salary and working hours, so the equivalents are there at a
            glance.
          </p>
          <h2>Gross, and clearly so</h2>
          <p>
            The figures are before tax and deductions — a like-for-like breakdown
            of the headline salary rather than a take-home estimate, which
            depends on your personal tax position. Everything is computed on your
            device with nothing sent anywhere.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <SalaryCalculatorTool />
    </ToolPageShell>
  );
}
