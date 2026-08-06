import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import TimestampConverterTool from "./TimestampConverterTool";

export const metadata: Metadata = toolMetadata({
  category: "dev",
  slug: "timestamp-converter",
  title: "Unix Timestamp Converter — Epoch to Date Online",
  description:
    "Convert a Unix timestamp to a human date and back, in your local time and UTC. Handles seconds and milliseconds. Runs entirely in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "Does it handle seconds and milliseconds?",
    answer:
      "Yes. The tool auto-detects: a value up to ten digits is read as seconds, a longer one as milliseconds. That covers Unix timestamps from most languages, which usually use seconds, and JavaScript, which uses milliseconds.",
  },
  {
    question: "What is a Unix timestamp?",
    answer:
      "The number of seconds (or milliseconds) that have elapsed since midnight UTC on 1 January 1970 — the 'Unix epoch'. It is a compact, timezone-free way to store an instant, which is why it is everywhere in software.",
  },
  {
    question: "Which timezone are the results in?",
    answer:
      "Both. Converting a timestamp shows the date in UTC and in your browser's local timezone side by side, so you can read whichever you need without doing the offset in your head.",
  },
  {
    question: "Is anything sent to a server?",
    answer:
      "No. All conversion uses your browser's own date handling. Nothing is uploaded.",
  },
];

export default function TimestampConverterPage() {
  return (
    <ToolPageShell
      category="dev"
      slug="timestamp-converter"
      title="Timestamp Converter"
      description="Convert a Unix timestamp to a human date and back, in local time and UTC. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Developer", href: "/dev" },
        { label: "Timestamp Converter" },
      ]}
      steps={[
        "Paste a Unix timestamp to see the date in local time and UTC.",
        "Or pick a date to get its timestamp in seconds and milliseconds.",
        "Copy whichever value you need.",
      ]}
      articleContent={
        <>
          <h2>Both directions, both timezones</h2>
          <p>
            A Unix timestamp is a single number standing for an exact instant,
            which is perfect for machines and unreadable for people. This tool
            converts either way — timestamp to a readable date, or a date back to
            a timestamp — and always shows the date in both UTC and your local
            timezone so there is no offset arithmetic to do by hand.
          </p>
          <h2>Seconds or milliseconds, sorted out for you</h2>
          <p>
            One of the commonest bugs with timestamps is mixing up seconds and
            milliseconds — a factor of a thousand that lands you in 1970 or the
            year 50,000. The converter detects which unit you pasted and handles
            it, and when producing a timestamp it gives you both so you can copy
            the one your system expects. It all runs in your browser.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <TimestampConverterTool />
    </ToolPageShell>
  );
}
