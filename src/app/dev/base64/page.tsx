import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import Base64Tool from "./Base64Tool";

export const metadata: Metadata = toolMetadata({
  category: "dev",
  slug: "base64",
  title: "Base64 Encode & Decode — Free Online Tool",
  description:
    "Convert text to Base64 and back, with full Unicode support. Emoji and accents survive the round trip. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Does it handle emoji and accented characters?",
    answer:
      "Yes. Text is encoded through UTF-8 first, so characters outside plain ASCII — emoji, accents, non-Latin scripts — round-trip correctly. A naive btoa() would throw on those; this tool does not.",
  },
  {
    question: "Is Base64 encryption?",
    answer:
      "No. Base64 is an encoding, not encryption. Anyone can decode it — it exists to carry binary data safely through text-only channels, not to hide it. Never use it to protect secrets.",
  },
  {
    question: "Is my text uploaded?",
    answer:
      "No. Encoding and decoding both happen in your browser. Nothing is sent to a server, so it is safe for private data.",
  },
  {
    question: "Why does decoding sometimes fail?",
    answer:
      "Valid Base64 uses a specific alphabet and length. If the input has stray characters, is truncated, or is missing its padding, it cannot be decoded and the tool says so rather than returning garbage.",
  },
];

export default function Base64Page() {
  return (
    <ToolPageShell
      category="dev"
      slug="base64"
      title="Base64 Encode & Decode"
      description="Convert text to Base64 and back, with Unicode handled correctly. Everything runs in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Developer", href: "/dev" },
        { label: "Base64 Encode/Decode" },
      ]}
      steps={[
        "Choose Encode or Decode.",
        "Type or paste your input on the left.",
        "Copy the converted result on the right.",
      ]}
      articleContent={
        <>
          <h2>What Base64 is for</h2>
          <p>
            Base64 represents arbitrary bytes using only 64 printable
            characters, so binary data can pass through systems built for text —
            embedding an image in a CSS file as a data URI, putting a small
            payload in JSON, or carrying bytes in an email. It makes data
            <em> transportable</em>, and that is all it does.
          </p>
          <h2>Encoding is not hiding</h2>
          <p>
            Because the transform is public and reversible, Base64 offers no
            secrecy — decoding it back is exactly what this page does. Treat
            anything you Base64-encode as fully readable. This tool runs the
            conversion in your browser, so the values themselves are never sent
            anywhere.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <Base64Tool />
    </ToolPageShell>
  );
}
