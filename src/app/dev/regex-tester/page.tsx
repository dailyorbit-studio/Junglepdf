import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import RegexTesterTool from "./RegexTesterTool";

export const metadata: Metadata = toolMetadata({
  category: "dev",
  slug: "regex-tester",
  title: "Regex Tester — Test Regular Expressions Online",
  description:
    "Test a JavaScript regular expression against your text and see every match and capture group highlighted live. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Which regex flavour is this?",
    answer:
      "JavaScript (ECMAScript) regular expressions, the same engine your browser and Node.js use. Syntax is close to other flavours but not identical — lookbehind and named groups are supported in modern browsers, for example.",
  },
  {
    question: "What do the flag buttons do?",
    answer:
      "They toggle the standard flags: g (find all matches), i (ignore case), m (^ and $ match line ends), s (dot matches newlines), u (full Unicode), and y (sticky). The tool always searches globally so you can see every match, and appends your chosen flags.",
  },
  {
    question: "Is my text sent anywhere?",
    answer:
      "No. The pattern runs against your text entirely in the browser. Nothing is uploaded, so testing against real data — logs, records, anything — is safe.",
  },
  {
    question: "Why are capture groups shown separately?",
    answer:
      "Each row lists the full match, its position, and the contents of every parenthesised capture group. Seeing the groups is usually the fastest way to tell whether a pattern is grabbing the exact parts you intended.",
  },
];

export default function RegexTesterPage() {
  return (
    <ToolPageShell
      category="dev"
      slug="regex-tester"
      title="Regex Tester"
      description="Test a regular expression against your text and see every match highlighted as you type. Runs in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Developer", href: "/dev" },
        { label: "Regex Tester" },
      ]}
      steps={[
        "Type your pattern and toggle the flags you need.",
        "Paste the text to search against.",
        "Watch matches highlight live and read the capture groups.",
      ]}
      articleContent={
        <>
          <h2>Build the pattern by watching it work</h2>
          <p>
            The fastest way to get a regular expression right is to see it run.
            As you edit the pattern or the flags, every match is re-highlighted
            in the test text and listed with its position and capture groups — so
            you can tighten the expression until it grabs exactly what you mean
            and nothing else.
          </p>
          <h2>Real data stays private</h2>
          <p>
            Because the matching happens in your browser, you can test against
            actual log lines, exports or records without any of it leaving your
            machine. An invalid pattern is reported with the engine&apos;s own
            error message rather than silently doing nothing, so a stray bracket
            never leaves you guessing.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <RegexTesterTool />
    </ToolPageShell>
  );
}
