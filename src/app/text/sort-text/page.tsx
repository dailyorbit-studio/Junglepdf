import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import SortTextTool from "./SortTextTool";

export const metadata: Metadata = toolMetadata({
  category: "text",
  slug: "sort-text",
  title: "Alphabetical Sort — Sort Lines A–Z Online",
  description:
    "Sort a list of lines alphabetically, A→Z or Z→A, with numeric, case-insensitive and remove-duplicate options. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Can it sort numbers correctly?",
    answer:
      "Yes. Turn on numeric order and 2 sorts before 10, instead of the plain alphabetical order that puts 10 before 2 because it compares character by character.",
  },
  {
    question: "How does case-insensitive sorting work?",
    answer:
      "With it on, 'Apple' and 'apple' sort together as if case did not exist, rather than all capitalised words being grouped ahead of lowercase ones.",
  },
  {
    question: "Can I sort and de-duplicate at once?",
    answer:
      "Yes. Enable remove-duplicates and identical lines are collapsed to one before sorting, so you get a clean, ordered, unique list in a single step.",
  },
  {
    question: "Does it handle accented characters?",
    answer:
      "Yes. Sorting uses your browser's locale-aware comparison, so accented letters land where a reader expects them rather than at the end of the alphabet.",
  },
];

export default function SortTextPage() {
  return (
    <ToolPageShell
      category="text"
      slug="sort-text"
      title="Alphabetical Sort"
      description="Sort lines alphabetically, A→Z or Z→A, with numeric and case options. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Text", href: "/text" },
        { label: "Alphabetical Sort" },
      ]}
      steps={[
        "Paste your list, one item per line.",
        "Pick direction and toggle numeric, case or unique.",
        "Copy the sorted result.",
      ]}
      articleContent={
        <>
          <h2>Order a list the way you mean it</h2>
          <p>
            Sorting a list should be one paste and one click, and it is here —
            but the details matter. Numeric order keeps 2 ahead of 10,
            case-insensitive stops capitalised words from clumping at the top,
            and remove-duplicates cleans the list while it orders it. Reverse to
            Z→A whenever you need the list the other way up.
          </p>
          <h2>Locale-aware, and private</h2>
          <p>
            Comparison uses your browser&apos;s own collation, so accented and
            non-English characters sort where a reader expects rather than being
            dumped after Z. And because it runs on your device, you can sort a
            list of names, emails or anything sensitive without it leaving the
            page.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <SortTextTool />
    </ToolPageShell>
  );
}
