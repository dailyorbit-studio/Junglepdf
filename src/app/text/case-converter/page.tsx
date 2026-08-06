import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import CaseConverterTool from "./CaseConverterTool";

export const metadata: Metadata = toolMetadata({
  category: "text",
  slug: "case-converter",
  title: "Case Converter — UPPERCASE, camelCase & More",
  description:
    "Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case and kebab-case. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Which cases can it produce?",
    answer:
      "Eight: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case and kebab-case — covering both everyday writing and the naming conventions used in code.",
  },
  {
    question: "What's the difference between Title and Sentence case?",
    answer:
      "Title Case capitalises the first letter of every word. Sentence case capitalises only the first word of each sentence, leaving the rest lowercase — the way ordinary prose is written.",
  },
  {
    question: "How do the programming cases handle punctuation?",
    answer:
      "camelCase, PascalCase, snake_case and kebab-case are built from the letters and numbers in your text, so punctuation and spaces become the join (or are dropped), giving you a clean identifier.",
  },
  {
    question: "Is my text uploaded?",
    answer: "No. Conversion runs in your browser instantly.",
  },
];

export default function CaseConverterPage() {
  return (
    <ToolPageShell
      category="text"
      slug="case-converter"
      title="Case Converter"
      description="Convert text between UPPERCASE, lowercase, Title Case, camelCase and more. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Text", href: "/text" },
        { label: "Case Converter" },
      ]}
      steps={[
        "Type or paste your text.",
        "Click the case you want.",
        "Copy the converted result.",
      ]}
      articleContent={
        <>
          <h2>One text, every case</h2>
          <p>
            Retyping a heading to change its capitalisation is a waste of a
            minute you will spend more than once. Paste the text and pick a case:
            all-caps for a shout, sentence case to fix a block that came in
            shouting, or Title Case for a heading. The result updates instantly.
          </p>
          <h2>Cases for writing and for code</h2>
          <p>
            Alongside the prose cases, it produces the identifier styles
            developers need — camelCase, PascalCase, snake_case and kebab-case —
            built cleanly from the words in your text. Everything runs on your
            device, so there is nothing to upload and nothing to wait for.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <CaseConverterTool />
    </ToolPageShell>
  );
}
