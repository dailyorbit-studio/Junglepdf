import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import SqlFormatterTool from "./SqlFormatterTool";

export const metadata: Metadata = toolMetadata({
  category: "dev",
  slug: "sql-formatter",
  title: "SQL Formatter — Beautify & Indent SQL Queries",
  description:
    "Format a cramped SQL query into readable, indented lines with keywords aligned, or minify it back to one line. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Does this run my query or connect to a database?",
    answer:
      "No. It only rearranges the text of the query for readability. It never connects to anything, runs nothing, and sends nothing anywhere — the query stays in your browser.",
  },
  {
    question: "Which SQL dialects does it handle?",
    answer:
      "It formats the common clauses shared across MySQL, PostgreSQL, SQL Server, SQLite and others — SELECT/FROM/WHERE/JOIN/GROUP BY and so on. It is a text formatter rather than a dialect-aware parser, so it will happily format any of them, but it does not validate dialect-specific syntax.",
  },
  {
    question: "Will it change what my query does?",
    answer:
      "No. It only adds line breaks, indentation and consistent keyword casing. The tokens and their order are untouched, so the formatted query is equivalent to the one you pasted.",
  },
  {
    question: "Can it collapse a query back to one line?",
    answer:
      "Yes — switch to Minify to fold a multi-line query back into a single line, which is handy for pasting into a string literal or a log line.",
  },
];

export default function SqlFormatterPage() {
  return (
    <ToolPageShell
      category="dev"
      slug="sql-formatter"
      title="SQL Formatter"
      description="Format a cramped SQL query into readable, indented lines, or minify it back down. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Developer", href: "/dev" },
        { label: "SQL Formatter" },
      ]}
      steps={[
        "Paste your SQL query into the input.",
        "Choose Format to indent it, or Minify to collapse it.",
        "Copy the result.",
      ]}
      articleContent={
        <>
          <h2>Readable queries, faster review</h2>
          <p>
            A query written on one line is fine for the machine and hard for a
            person. Formatting breaks the major clauses onto their own lines and
            indents the join and filter conditions beneath them, so the shape of
            the query — what it selects, from where, under which conditions — is
            legible at a glance. That is where most SQL bugs are caught.
          </p>
          <h2>A formatter, not a parser</h2>
          <p>
            This tool reflows and re-cases keywords rather than fully parsing the
            SQL, which is what lets it stay dialect-agnostic and instant. It will
            not tell you whether the query is valid or optimise it — it makes the
            query you already have easier to read, entirely on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <SqlFormatterTool />
    </ToolPageShell>
  );
}
