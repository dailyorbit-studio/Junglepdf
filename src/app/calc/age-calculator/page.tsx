import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import AgeCalculatorTool from "./AgeCalculatorTool";

export const metadata: Metadata = toolMetadata({
  category: "calc",
  slug: "age-calculator",
  title: "Age Calculator — Exact Age in Years, Months, Days",
  description:
    "Work out an exact age in years, months and days from a date of birth, to today or any date, plus total days lived. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How exact is the age?",
    answer:
      "It counts full calendar years, then the remaining whole months, then the leftover days — the way age is normally stated. It also shows the total number of days lived if you want a single figure.",
  },
  {
    question: "Can I find an age on a past or future date?",
    answer:
      "Yes. The second date defaults to today but you can set it to any date — useful for working out how old someone was at an event, or will be on a future one.",
  },
  {
    question: "Is my date of birth uploaded?",
    answer: "No. The calculation happens entirely in your browser.",
  },
];

export default function AgeCalculatorPage() {
  return (
    <ToolPageShell
      category="calc"
      slug="age-calculator"
      title="Age Calculator"
      description="Work out an exact age in years, months and days from a date of birth. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calc" },
        { label: "Age Calculator" },
      ]}
      steps={[
        "Enter the date of birth.",
        "Leave the second date as today, or set another date.",
        "Read the exact age and total days lived.",
      ]}
      articleContent={
        <>
          <h2>Age, counted properly</h2>
          <p>
            Age is not just this year minus the birth year — it depends on whether
            the birthday has passed. This calculator does the calendar arithmetic
            correctly, giving the full years, the months since the last birthday,
            and the days on top, along with the total number of days lived.
          </p>
          <h2>Any two dates</h2>
          <p>
            Because the reference date is adjustable, you can find an age at any
            moment — at a wedding, on a future milestone, on a form&apos;s cut-off
            date. It runs on your device, so a date of birth you enter never
            leaves the page.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <AgeCalculatorTool />
    </ToolPageShell>
  );
}
