import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import RemoveBlankLinesTool from "./RemoveBlankLinesTool";

export const metadata: Metadata = toolMetadata({
  category: "text",
  slug: "remove-blank-lines",
  title: "Remove Blank Lines — Delete Empty Lines Online",
  description:
    "Strip empty and whitespace-only lines from a block of text, and optionally trim the rest. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Does it remove whitespace-only lines too?",
    answer:
      "Yes. A line that looks empty but contains spaces or tabs is treated as blank and removed, which is the usual reason 'empty' lines survive a naive find-and-replace.",
  },
  {
    question: "What does 'trim each line' do?",
    answer:
      "It removes leading and trailing whitespace from every line that is kept, so the result is not just gap-free but also free of trailing spaces.",
  },
  {
    question: "Will it collapse the text onto one line?",
    answer:
      "No. It only removes lines that are blank. The non-blank lines keep their order and their own line breaks — you get a compact version of the same list.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. It runs entirely in your browser as you type.",
  },
];

export default function RemoveBlankLinesPage() {
  return (
    <ToolPageShell
      category="text"
      slug="remove-blank-lines"
      title="Remove Blank Lines"
      description="Strip empty and whitespace-only lines from your text. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Text", href: "/text" },
        { label: "Remove Blank Lines" },
      ]}
      steps={[
        "Paste your text into the input box.",
        "Optionally trim whitespace on the remaining lines.",
        "Copy the compacted result.",
      ]}
      articleContent={
        <>
          <h2>Closing the gaps</h2>
          <p>
            Text copied out of a PDF, an email or a spreadsheet often arrives
            padded with empty lines. This tool removes them in one pass — every
            line that is empty or contains only whitespace is dropped, and the
            real content is pulled together with its order intact.
          </p>
          <h2>Truly empty, not just invisible</h2>
          <p>
            The catch with blank lines is that many are not actually empty: they
            hold spaces or tabs, so a plain search for empty lines misses them.
            This tool judges a line by whether it has any non-whitespace content,
            so those invisible lines go too — and the optional trim tidies the
            survivors. It all happens on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <RemoveBlankLinesTool />
    </ToolPageShell>
  );
}
