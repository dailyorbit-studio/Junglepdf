import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import BinaryTextTool from "./BinaryTextTool";

export const metadata: Metadata = toolMetadata({
  category: "text",
  slug: "binary-text",
  title: "Binary to Text Converter — Text ↔ Binary Online",
  description:
    "Convert text to binary and binary back to readable text, UTF-8 aware. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How is the binary formatted?",
    answer:
      "As 8-bit groups (one byte each) separated by spaces, which is the readable convention. When decoding, just paste those groups back and it reassembles the text.",
  },
  {
    question: "Does it handle emoji and non-English text?",
    answer:
      "Yes. Text is encoded through UTF-8 first, so a character outside plain ASCII becomes several bytes and round-trips correctly — emoji and accents included.",
  },
  {
    question: "What if my binary isn't a clean multiple of 8?",
    answer:
      "Each space-separated group is decoded as one byte. If a group contains anything other than up to eight 0s and 1s, the tool reports that it cannot read it rather than guessing.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. Conversion runs entirely in your browser.",
  },
];

export default function BinaryTextPage() {
  return (
    <ToolPageShell
      category="text"
      slug="binary-text"
      title="Binary ↔ Text"
      description="Convert text to binary and binary back to text, UTF-8 aware. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Text", href: "/text" },
        { label: "Binary ↔ Text" },
      ]}
      steps={[
        "Choose Encode (text to binary) or Decode.",
        "Type your text or paste the 0s and 1s.",
        "Copy the result.",
      ]}
      articleContent={
        <>
          <h2>The bytes behind the letters</h2>
          <p>
            Every character your computer stores is ultimately a number, and that
            number is a string of bits. This tool makes those bits visible: type
            a word and see the exact bytes that represent it, or paste binary and
            read the text back out. It is a neat way to see how text encoding
            actually works.
          </p>
          <h2>UTF-8, so nothing gets lost</h2>
          <p>
            Because it encodes through UTF-8, characters beyond the basic English
            set — accents, other scripts, emoji — turn into the correct
            multi-byte sequences and come back intact. The conversion happens on
            your device, so whatever you convert stays with you.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <BinaryTextTool />
    </ToolPageShell>
  );
}
