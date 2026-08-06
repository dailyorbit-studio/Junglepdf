import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ReverseTextTool from "./ReverseTextTool";

export const metadata: Metadata = toolMetadata({
  category: "text",
  slug: "reverse-text",
  title: "Reverse Text — Flip Characters, Words or Lines",
  description:
    "Reverse text by characters, or flip the order of words or lines. Emoji stay intact. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What gets reversed by default?",
    answer:
      "The characters — 'abc' becomes 'cba'. Switch on 'reverse word order' to keep each word intact but flip their sequence, or 'reverse line order' to flip a list top to bottom.",
  },
  {
    question: "Will emoji and accented letters break?",
    answer:
      "No. Character reversal works on Unicode code points, so emoji made of surrogate pairs are not split down the middle the way a naive reverse would split them.",
  },
  {
    question: "Can I flip a whole list upside down?",
    answer:
      "Yes. 'Reverse line order' turns the last line into the first and so on, which is the quick way to invert a chronological list without re-sorting it.",
  },
  {
    question: "Is my text uploaded?",
    answer: "No. Reversing happens in your browser as you type.",
  },
];

export default function ReverseTextPage() {
  return (
    <ToolPageShell
      category="text"
      slug="reverse-text"
      title="Reverse Text"
      description="Reverse text by characters, or flip the order of words or lines. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Text", href: "/text" },
        { label: "Reverse Text" },
      ]}
      steps={[
        "Type or paste your text.",
        "Choose characters (default), word order, or line order.",
        "Copy the reversed result.",
      ]}
      articleContent={
        <>
          <h2>Three ways to reverse</h2>
          <p>
            Reversing text can mean three different things, so this tool does all
            three. By default it flips the characters. It can instead keep every
            word whole and reverse their order, or leave lines whole and flip a
            list from bottom to top. Pick the one that matches what you actually
            need.
          </p>
          <h2>Unicode-safe and local</h2>
          <p>
            Character reversal is done over Unicode code points, so emoji and
            other multi-unit characters survive rather than being torn in half —
            a classic bug in quick-and-dirty reversers. As with every text tool
            here, it runs on your device and nothing is sent anywhere.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ReverseTextTool />
    </ToolPageShell>
  );
}
