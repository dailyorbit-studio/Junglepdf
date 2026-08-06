import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import UrlEncoderTool from "./UrlEncoderTool";

export const metadata: Metadata = toolMetadata({
  category: "dev",
  slug: "url-encoder",
  title: "URL Encode & Decode — Percent-Encoding Tool",
  description:
    "Percent-encode text for safe use in URLs, or decode an encoded string back to plain text. Component and whole-URL modes. Runs entirely in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "What's the difference between the two modes?",
    answer:
      "Component mode (the default) encodes everything that is not safe inside a single query value, including :/?&= — use it for one piece of data. Whole-URL mode leaves those structural characters alone so a complete address stays usable. Pick component when you are encoding one parameter value.",
  },
  {
    question: "Why encode a URL at all?",
    answer:
      "Spaces, ampersands, question marks and non-ASCII characters have special meaning or are not allowed in a URL. Percent-encoding replaces them with %XX sequences so the value survives intact instead of breaking the link or being misread as structure.",
  },
  {
    question: "Is anything uploaded?",
    answer:
      "No. Encoding and decoding run in your browser with the standard encodeURIComponent and decodeURIComponent functions. Nothing is sent anywhere.",
  },
  {
    question: "Why did decoding fail?",
    answer:
      "A percent sign must be followed by two hex digits. If the input contains a lone % or a malformed sequence, it cannot be decoded, and the tool tells you rather than returning something wrong.",
  },
];

export default function UrlEncoderPage() {
  return (
    <ToolPageShell
      category="dev"
      slug="url-encoder"
      title="URL Encode & Decode"
      description="Percent-encode text for safe use in URLs, or decode it back. Component and whole-URL modes, all in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Developer", href: "/dev" },
        { label: "URL Encode/Decode" },
      ]}
      steps={[
        "Choose Encode or Decode.",
        "Pick component (one value) or whole-URL mode.",
        "Paste your text and copy the result.",
      ]}
      articleContent={
        <>
          <h2>Making text URL-safe</h2>
          <p>
            A URL can only contain a limited set of characters, and several of
            those carry structural meaning. Percent-encoding turns everything
            else — spaces, ampersands, non-Latin characters — into %XX escapes so
            a value can sit inside a query string without being mistaken for part
            of the URL&apos;s structure.
          </p>
          <h2>Component versus whole URL</h2>
          <p>
            The distinction matters. When you encode a single parameter value you
            want the strict, component-level encoding that also escapes :/?&amp;=.
            When you are cleaning up an entire address you want those left in
            place. This tool exposes both so you are never forced to hand-fix the
            over- or under-encoded result. Everything runs on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <UrlEncoderTool />
    </ToolPageShell>
  );
}
