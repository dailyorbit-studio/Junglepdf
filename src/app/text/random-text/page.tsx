import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import RandomTextTool from "./RandomTextTool";

export const metadata: Metadata = toolMetadata({
  category: "text",
  slug: "random-text",
  title: "Lorem Ipsum Generator — Random Placeholder Text",
  description:
    "Generate lorem ipsum or random placeholder text by words, sentences or paragraphs. Runs in your browser — perfect for mockups and layout tests.",
});

const FAQ_ITEMS = [
  {
    question: "What is lorem ipsum?",
    answer:
      "Scrambled Latin-looking placeholder text used to fill a design before the real copy exists. Because it is not readable English, it lets you judge layout, spacing and typography without being distracted by the words.",
  },
  {
    question: "Can I choose the amount?",
    answer:
      "Yes. Generate by paragraphs, sentences or individual words, and set exactly how many you need — from a single line to a full page of filler.",
  },
  {
    question: "Do I have to start with 'Lorem ipsum'?",
    answer:
      "No. That classic opening is on by default because it is expected, but you can switch it off to get purely random filler that does not begin with the familiar phrase.",
  },
  {
    question: "Is anything uploaded?",
    answer:
      "No. The text is assembled in your browser from a built-in word list. Nothing is fetched and nothing is sent.",
  },
];

export default function RandomTextPage() {
  return (
    <ToolPageShell
      category="text"
      slug="random-text"
      title="Random Text Generator"
      description="Generate lorem ipsum or random placeholder text by words, sentences or paragraphs. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Text", href: "/text" },
        { label: "Random Text Generator" },
      ]}
      steps={[
        "Choose an amount and a unit — paragraphs, sentences or words.",
        "Click Generate.",
        "Copy the placeholder text into your design.",
      ]}
      articleContent={
        <>
          <h2>Filler that stays out of the way</h2>
          <p>
            When you are laying out a page before the copy is written, you need
            text that has the right shape but no meaning to argue with. Lorem
            ipsum does exactly that — it reads as text to the eye without pulling
            attention to the words, so you can judge line length, rhythm and
            spacing honestly.
          </p>
          <h2>Generated to fit</h2>
          <p>
            Pick paragraphs, sentences or words and the exact count, and the
            generator builds filler to match — a headline&apos;s worth or a whole
            article&apos;s. It assembles everything in your browser from a
            built-in word bank, so there is no request to wait on and nothing
            leaves your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <RandomTextTool />
    </ToolPageShell>
  );
}
