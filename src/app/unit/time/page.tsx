import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import TimeTool from "./TimeTool";

export const metadata: Metadata = toolMetadata({
  category: "unit",
  slug: "time",
  title: "Time Converter — seconds, minutes, hours, days",
  description:
    "Convert between milliseconds, seconds, minutes, hours, days, weeks and years instantly. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How are months and years defined?",
    answer:
      "A month is taken as 30 days and a year as 365 days, which are the standard approximations for unit conversion. For exact calendar spans between two dates — accounting for leap years and varying month lengths — use the Date Difference calculator instead.",
  },
  {
    question: "Can it convert to milliseconds?",
    answer:
      "Yes. Milliseconds through to years are all included, so it works for both programming durations and everyday time spans.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. The conversion runs entirely in your browser.",
  },
];

export default function TimePage() {
  return (
    <ToolPageShell
      category="unit"
      slug="time"
      title="Time Converter"
      description="Convert between seconds, minutes, hours, days, weeks and years. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Unit Converter", href: "/unit" },
        { label: "Time Converter" },
      ]}
      steps={["Enter a value and choose its unit.", "Pick the unit to convert to.", "Read the result, or swap the units."]}
      articleContent={
        <>
          <h2>Durations across every scale</h2>
          <p>
            Converting a duration — hours to minutes, days to hours, seconds to
            milliseconds — is simple arithmetic that is easy to get wrong under
            pressure. This converter handles the whole range from milliseconds to
            years in one place, in either direction.
          </p>
          <h2>Units, not calendar dates</h2>
          <p>
            Note that months and years use the standard 30- and 365-day
            approximations. For the exact gap between two actual dates, the Date
            Difference calculator accounts for leap years and real month lengths.
            This tool runs entirely on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <TimeTool />
    </ToolPageShell>
  );
}
