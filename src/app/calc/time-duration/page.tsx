import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import TimeDurationTool from "./TimeDurationTool";

export const metadata: Metadata = toolMetadata({
  category: "calc",
  slug: "time-duration",
  title: "Time Duration Calculator — Hours Between Times",
  description:
    "Calculate the duration between a start and end time in hours and minutes, including spans that cross midnight. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Does it handle overnight shifts?",
    answer:
      "Yes. If the end time is earlier in the day than the start, the tool treats the span as crossing midnight — so 22:00 to 06:00 correctly reads as 8 hours, not a negative number.",
  },
  {
    question: "Can I get the result as decimal hours?",
    answer:
      "Yes. Alongside the hours-and-minutes figure, the breakdown shows the total in decimal hours and in minutes, which is what timesheets and billing usually want.",
  },
  {
    question: "Are my times uploaded?",
    answer: "No. The calculation runs entirely in your browser.",
  },
];

export default function TimeDurationPage() {
  return (
    <ToolPageShell
      category="calc"
      slug="time-duration"
      title="Time Duration"
      description="Calculate the duration between a start and end time, even across midnight. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calc" },
        { label: "Time Duration" },
      ]}
      steps={[
        "Enter the start time.",
        "Enter the end time.",
        "Read the duration in hours and minutes.",
      ]}
      articleContent={
        <>
          <h2>How long between two times</h2>
          <p>
            Working out the gap between two clock times means carrying minutes and
            watching for midnight — the sort of small sum that is easy to get
            wrong on a timesheet. This tool does it instantly, in hours and
            minutes, and also as decimal hours for billing.
          </p>
          <h2>Overnight handled</h2>
          <p>
            When the end time falls before the start time, the calculator assumes
            the period runs past midnight rather than producing a negative result,
            so night shifts and late sessions come out right. It all runs on your
            device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <TimeDurationTool />
    </ToolPageShell>
  );
}
