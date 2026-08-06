import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import JsonValidatorTool from "./JsonValidatorTool";

export const metadata: Metadata = toolMetadata({
  category: "dev",
  slug: "json-validator",
  title: "JSON Validator — Check JSON Syntax Online",
  description:
    "Check whether JSON is valid and get the exact line and column of the first error, with a plain-English reason. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What counts as valid JSON?",
    answer:
      "Strict JSON: double-quoted keys and strings, no trailing commas, no comments, and no single quotes. This validator holds to that standard, which is what servers and libraries actually enforce — a relaxed check would pass things your code later rejects.",
  },
  {
    question: "Where does the error location come from?",
    answer:
      "When the parse fails, the tool recovers the character offset from the failure and converts it to a line and column so you can jump straight to the problem, rather than re-reading the whole document.",
  },
  {
    question: "Is the JSON uploaded?",
    answer:
      "No. Validation runs in your browser with the native JSON parser. Nothing is sent anywhere, so validating a real payload with sensitive fields is safe.",
  },
  {
    question: "What's the difference between this and the JSON Formatter?",
    answer:
      "The validator just answers yes or no and points at the first error. The formatter does the same check but also pretty-prints or minifies valid JSON. If you want to reformat as well as validate, use the JSON Formatter.",
  },
];

export default function JsonValidatorPage() {
  return (
    <ToolPageShell
      category="dev"
      slug="json-validator"
      title="JSON Validator"
      description="Check whether a block of JSON is valid and get the exact position of the first error. Runs in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Developer", href: "/dev" },
        { label: "JSON Validator" },
      ]}
      steps={[
        "Paste the JSON you want to check.",
        "Read the verdict — valid, or the exact error location.",
        "Fix the reported line and column, then re-check.",
      ]}
      articleContent={
        <>
          <h2>A yes-or-no answer, with the spot</h2>
          <p>
            Validation is the first thing to rule out when JSON &quot;isn&apos;t
            working&quot;. This tool runs a strict parse and either confirms the
            document is well-formed or points at the first character it cannot
            accept — with the line, the column, and the parser&apos;s own reason.
          </p>
          <h2>The usual culprits</h2>
          <p>
            Most invalid JSON fails for a handful of reasons: a trailing comma
            after the last item, single quotes where double quotes are required,
            keys left unquoted, or a bracket that was never closed. Because the
            error carries a position, you rarely have to hunt — go to the line it
            names and the mistake is almost always right there.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <JsonValidatorTool />
    </ToolPageShell>
  );
}
