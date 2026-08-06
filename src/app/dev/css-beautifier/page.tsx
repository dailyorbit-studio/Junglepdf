import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import CssBeautifierTool from "./CssBeautifierTool";

export const metadata: Metadata = toolMetadata({
  category: "dev",
  slug: "css-beautifier",
  title: "CSS Beautifier — Format & Minify CSS Online",
  description:
    "Format minified or messy CSS into clean, indented rules, or compress it back for shipping. Runs in your browser — your stylesheet is never uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Can it un-minify CSS?",
    answer:
      "Yes. Paste a minified stylesheet and Beautify expands it back into indented rules with one declaration per line, which is exactly what you need to read or edit compressed CSS.",
  },
  {
    question: "Does it handle @media and other at-rules?",
    answer:
      "Yes. It indents by brace depth, so nested at-rules like @media and @supports come out correctly, with their inner rules indented one level further.",
  },
  {
    question: "Will pseudo-classes like a:hover survive?",
    answer:
      "Yes. The beautifier does not treat colons as declaration separators, so selectors such as a:hover or ::before are left intact rather than being broken apart.",
  },
  {
    question: "Is anything uploaded?",
    answer:
      "No. Formatting and minifying both run in your browser. Nothing about your stylesheet is transmitted or stored anywhere.",
  },
];

export default function CssBeautifierPage() {
  return (
    <ToolPageShell
      category="dev"
      slug="css-beautifier"
      title="CSS Beautifier"
      description="Format messy or minified CSS into clean, indented rules — or minify it for shipping. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Developer", href: "/dev" },
        { label: "CSS Beautifier" },
      ]}
      steps={[
        "Paste your CSS into the input box.",
        "Choose Beautify to expand it, or Minify to compress it.",
        "Copy the result.",
      ]}
      articleContent={
        <>
          <h2>From one line back to something editable</h2>
          <p>
            Shipped CSS is minified — every space and newline stripped to save
            bytes. That is great for the browser and unreadable for a human.
            Beautifying splits the rules and declarations back onto their own
            lines with consistent indentation, so you can read a compiled
            stylesheet or hand-edit a vendor file.
          </p>
          <h2>And back down again</h2>
          <p>
            Minify does the reverse: it strips comments and collapses whitespace
            to produce the smallest equivalent stylesheet, tightening the spacing
            around braces, colons and semicolons. Both directions run on your
            device, so nothing you paste is uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <CssBeautifierTool />
    </ToolPageShell>
  );
}
