import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import DateDifferenceTool from "./DateDifferenceTool";

export const metadata: Metadata = toolMetadata({
  category: "calc",
  slug: "date-difference",
  title: "Date Difference Calculator — Days Between Dates",
  description:
    "Count the days, weeks and months between two dates, with an exact years-months-days breakdown. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Does the order of the dates matter?",
    answer:
      "No. The tool always reports a positive difference, so you can enter the dates in either order and still get the correct gap between them.",
  },
  {
    question: "Is the end date counted?",
    answer:
      "The result is the number of whole days from the start date to the end date. If you need to include both endpoints — for instance to count days of leave — add one to the day figure.",
  },
  {
    question: "Are my dates uploaded?",
    answer: "No. The calculation runs entirely in your browser.",
  },
];

export default function DateDifferencePage() {
  return (
    <ToolPageShell
      category="calc"
      slug="date-difference"
      title="Date Difference"
      description="Count the days, weeks and months between two dates. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calc" },
        { label: "Date Difference" },
      ]}
      steps={[
        "Pick a start date.",
        "Pick an end date.",
        "Read the gap in days, weeks and years-months-days.",
      ]}
      articleContent={
        <>
          <h2>The exact gap between two dates</h2>
          <p>
            Counting days across months and years by hand is error-prone,
            especially over a leap year. This calculator gives the precise number
            of days between any two dates, plus the same span expressed in weeks
            and as a years-months-days breakdown.
          </p>
          <h2>Either order, on your device</h2>
          <p>
            Enter the dates in whichever order you like — the result is always
            positive. It is handy for deadlines, anniversaries, notice periods and
            project planning, and because it runs locally, the dates you enter
            stay private.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <DateDifferenceTool />
    </ToolPageShell>
  );
}
