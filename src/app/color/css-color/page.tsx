import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import CssColorTool from "./CssColorTool";

export const metadata: Metadata = toolMetadata({
  category: "color",
  slug: "css-color",
  title: "CSS Color Generator — Copy Color CSS Snippets",
  description:
    "Pick a colour and copy it as ready-to-paste CSS — colour, background, border and a custom property. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What snippets does it give me?",
    answer:
      "The common ones: color, background-color and border declarations, a CSS custom property (variable), and the rgb() and hsl() forms of the same colour. Each has its own copy button.",
  },
  {
    question: "Why a CSS variable?",
    answer:
      "Defining a colour once as a custom property like --brand and reusing it keeps a design consistent and makes theme changes a one-line edit. The generator gives you that line ready to paste.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. Everything is generated in your browser.",
  },
];

export default function CssColorPage() {
  return (
    <ToolPageShell
      category="color"
      slug="css-color"
      title="CSS Color Generator"
      description="Pick a colour and copy it as CSS — colour, background, border and variables. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Color", href: "/color" },
        { label: "CSS Color Generator" },
      ]}
      steps={["Pick a colour.", "Choose the snippet you need.", "Copy it into your stylesheet."]}
      articleContent={
        <>
          <h2>From a colour to usable CSS</h2>
          <p>
            Once you have a colour, you still have to write it into CSS in the
            right property. This tool takes a colour and hands you each common form
            — as text colour, background, border, and a reusable custom property —
            plus its rgb() and hsl() equivalents, all ready to paste.
          </p>
          <h2>Generated locally</h2>
          <p>
            The snippets are produced in your browser with nothing uploaded, so it
            is a fast, private way to grab exactly the CSS you need for a colour.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <CssColorTool />
    </ToolPageShell>
  );
}
