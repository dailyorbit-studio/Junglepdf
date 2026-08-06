import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import JsonFormatterTool from "./JsonFormatterTool";

export const metadata: Metadata = toolMetadata({
  category: "dev",
  slug: "json-formatter",
  title: "JSON Formatter — Pretty-Print & Minify JSON Online",
  description:
    "Beautify messy JSON with clean indentation, or minify it to one line. Points at the exact line and column of any syntax error. Runs entirely in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "Is my JSON sent to a server?",
    answer:
      "No. It is parsed and re-serialized by JavaScript in your browser. Nothing is uploaded, so you can safely format JSON that contains API responses, config or other private data.",
  },
  {
    question: "What does minify do?",
    answer:
      "It removes every optional space and line break, producing the smallest valid JSON that means exactly the same thing. That is the form you want when embedding JSON in a URL, a data attribute, or anywhere byte count matters.",
  },
  {
    question: "It says my JSON is invalid — why?",
    answer:
      "The formatter runs a strict parse and reports the first character it cannot accept, with the line and column. Common causes are trailing commas, single quotes instead of double quotes, unquoted keys, or a missing closing bracket.",
  },
  {
    question: "Does formatting change my data?",
    answer:
      "No. Only whitespace changes. Keys, values, order within arrays, and types are all preserved exactly — the output parses back to the identical structure.",
  },
];

export default function JsonFormatterPage() {
  return (
    <ToolPageShell
      category="dev"
      slug="json-formatter"
      title="JSON Formatter"
      description="Pretty-print or minify JSON, with the exact location of any syntax error. Everything runs in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Developer", href: "/dev" },
        { label: "JSON Formatter" },
      ]}
      steps={[
        "Paste your JSON into the left box.",
        "Pick an indent width, or choose Minify.",
        "Copy the formatted result from the right.",
      ]}
      articleContent={
        <>
          <h2>Readable JSON, and the opposite</h2>
          <p>
            Machine-generated JSON usually arrives as one unbroken line.
            Pretty-printing re-indents it so the structure is visible at a
            glance — nested objects step inward, arrays line up — which is what
            you want when debugging an API response. Minifying does the reverse,
            stripping every non-essential byte for when the JSON has to travel
            somewhere small.
          </p>
          <h2>Errors with a location</h2>
          <p>
            A browser&apos;s built-in parser will tell you something is wrong but
            rarely where. This tool recovers the character offset from the parse
            failure and converts it to a line and column, so instead of
            &quot;unexpected token&quot; you get the precise spot to look —
            almost always a stray comma or a mismatched quote.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <JsonFormatterTool />
    </ToolPageShell>
  );
}
