import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import TextStatsTool from "@/components/TextStatsTool";

export const metadata: Metadata = toolMetadata({
  category: "text",
  slug: "word-counter",
  title: "Word Counter — Count Words & Characters Online",
  description:
    "Count words, characters, sentences, paragraphs and reading time live as you type. Runs entirely in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How is reading time estimated?",
    answer:
      "From the word count at roughly 200 words per minute, a common average for silent adult reading. It is a rough guide for pacing a talk or gauging an article, not an exact figure.",
  },
  {
    question: "How does it count sentences?",
    answer:
      "By counting runs of text that end in a full stop, question mark or exclamation mark. Abbreviations and decimals can nudge the number slightly, as they can in any automatic counter, but it is accurate for ordinary prose.",
  },
  {
    question: "Is my text uploaded?",
    answer:
      "No. Counting happens in your browser as you type, so you can paste an essay, a draft or confidential text without any of it leaving your device.",
  },
  {
    question: "Does it update as I type?",
    answer:
      "Yes. Every figure recalculates on each keystroke, so you can watch a piece grow toward a target word count in real time.",
  },
];

export default function WordCounterPage() {
  return (
    <ToolPageShell
      category="text"
      slug="word-counter"
      title="Word Counter"
      description="Count words, characters, sentences, paragraphs and reading time as you type. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Text", href: "/text" },
        { label: "Word Counter" },
      ]}
      steps={[
        "Type or paste your text into the box.",
        "Watch the counts update live.",
        "Write to your target word or reading-time figure.",
      ]}
      articleContent={
        <>
          <h2>Every count that matters, live</h2>
          <p>
            Whether you are held to an essay limit, a word budget for a brief, or
            just want to know how long a piece takes to read, this counter shows
            words, characters, sentences, paragraphs and an estimated reading
            time — all updating as you type. There is no button to press and no
            wait.
          </p>
          <h2>Written to stay private</h2>
          <p>
            Counting runs entirely in your browser, so the text never leaves your
            device. That makes it safe for a confidential draft or an unpublished
            manuscript in a way an upload-based counter is not. Close the tab and
            nothing remains anywhere.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <TextStatsTool variant="words" />
    </ToolPageShell>
  );
}
