import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import MorseCodeTool from "./MorseCodeTool";

export const metadata: Metadata = toolMetadata({
  category: "text",
  slug: "morse-code",
  title: "Morse Code Translator — Text to Morse & Back",
  description:
    "Translate text to Morse code and Morse code back to text, including numbers and punctuation. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How are letters and words separated?",
    answer:
      "Letters within a word are separated by a single space, and words are separated by a slash ( / ). That is the standard written convention, and the decoder accepts it when translating back.",
  },
  {
    question: "Does it support numbers and punctuation?",
    answer:
      "Yes. It uses the international (ITU) Morse alphabet, which covers A–Z, the digits 0–9, and common punctuation such as full stops, commas, question marks and the @ sign.",
  },
  {
    question: "Can I decode Morse back to text?",
    answer:
      "Yes. Switch to Decode and paste dots and dashes with spaces between letters and slashes between words, and it reconstructs the original message.",
  },
  {
    question: "Is my message uploaded?",
    answer: "No. Translation happens entirely in your browser.",
  },
];

export default function MorseCodePage() {
  return (
    <ToolPageShell
      category="text"
      slug="morse-code"
      title="Morse Code Converter"
      description="Translate text to Morse code and back, including numbers and punctuation. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Text", href: "/text" },
        { label: "Morse Code Converter" },
      ]}
      steps={[
        "Choose Encode (text to Morse) or Decode.",
        "Type your message or paste the dots and dashes.",
        "Copy the translation.",
      ]}
      articleContent={
        <>
          <h2>Text to dots and dashes</h2>
          <p>
            Morse code represents each letter and number as a pattern of short
            and long signals — dots and dashes. This translator converts ordinary
            text into that pattern and back again, using the international Morse
            alphabet so numbers and punctuation come across too, not just
            letters.
          </p>
          <h2>A readable convention</h2>
          <p>
            On screen, letters are spaced apart and words are divided by a slash,
            which keeps a message legible and lets the decoder rebuild it exactly.
            Whether you are learning Morse, solving a puzzle, or spelling out an
            SOS, it all runs on your device with nothing sent anywhere.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <MorseCodeTool />
    </ToolPageShell>
  );
}
