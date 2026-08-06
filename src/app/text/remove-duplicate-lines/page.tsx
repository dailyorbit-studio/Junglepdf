import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import RemoveDuplicateLinesTool from "./RemoveDuplicateLinesTool";

export const metadata: Metadata = toolMetadata({
  category: "text",
  slug: "remove-duplicate-lines",
  title: "Remove Duplicate Lines — Free Online Tool",
  description:
    "Remove repeated lines from a list, keeping the first of each, with optional case-insensitive matching. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Which copy of a duplicate is kept?",
    answer:
      "The first occurrence. Every later line identical to one already seen is dropped, so the surviving lines stay in their original order rather than being shuffled.",
  },
  {
    question: "Can it ignore case and spacing?",
    answer:
      "Yes. Turn on case-insensitive to treat 'Apple' and 'apple' as the same line, and ignore surrounding spaces to match lines that differ only by leading or trailing whitespace.",
  },
  {
    question: "Does it sort the lines?",
    answer:
      "No. Deduplication preserves order. If you also want the result sorted, run it through the Alphabetical Sort tool, which has its own remove-duplicates option.",
  },
  {
    question: "Is my text uploaded?",
    answer:
      "No. The whole operation runs in your browser as you type. Nothing is sent to a server.",
  },
];

export default function RemoveDuplicateLinesPage() {
  return (
    <ToolPageShell
      category="text"
      slug="remove-duplicate-lines"
      title="Remove Duplicate Lines"
      description="Remove repeated lines from a list, keeping the first of each. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Text", href: "/text" },
        { label: "Remove Duplicate Lines" },
      ]}
      steps={[
        "Paste your list into the input box.",
        "Optionally ignore case or surrounding spaces.",
        "Copy the de-duplicated result.",
      ]}
      articleContent={
        <>
          <h2>De-duplicating a list</h2>
          <p>
            Paste a list and every line that repeats an earlier one is removed,
            leaving one of each in the order they first appeared. It is the quick
            fix for a merged list, an exported column, or any text where the same
            entry has crept in more than once.
          </p>
          <h2>Matching that fits the data</h2>
          <p>
            &quot;Duplicate&quot; is not always exact. The case-insensitive option
            treats differently-cased copies as the same, and ignoring surrounding
            spaces catches lines that differ only by stray whitespace — the two
            reasons a list looks deduplicated but is not. Everything runs on your
            device as you type.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <RemoveDuplicateLinesTool />
    </ToolPageShell>
  );
}
