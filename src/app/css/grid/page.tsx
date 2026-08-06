import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import GridTool from "./GridTool";

export const metadata: Metadata = toolMetadata({
  category: "css",
  slug: "grid",
  title: "CSS Grid Generator — Columns, Rows & Gap",
  description:
    "Set up CSS grid columns, rows and gaps visually and copy the grid CSS. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What does repeat(3, 1fr) mean?",
    answer:
      "Three columns, each one fraction (1fr) of the available space — so they share the width equally and adapt to the container. It is the concise way to write evenly-sized tracks, and the generator uses it for both columns and rows.",
  },
  {
    question: "What is the gap property?",
    answer:
      "The space between grid tracks — the gutter between columns and rows. It replaces the old trick of adding margins to items, and applies only between cells, not around the outside edge.",
  },
  {
    question: "Is the CSS free to use?",
    answer: "Yes, with no attribution. It is generated in your browser and nothing is uploaded.",
  },
];

export default function GridPage() {
  return (
    <ToolPageShell
      category="css"
      slug="grid"
      title="CSS Grid Generator"
      description="Set up columns, rows and gaps visually and copy the grid CSS. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "CSS", href: "/css" },
        { label: "CSS Grid Generator" },
      ]}
      steps={[
        "Set the number of columns and rows.",
        "Adjust the gap between cells.",
        "Copy the grid CSS.",
      ]}
      articleContent={
        <>
          <h2>Grid layout without the guesswork</h2>
          <p>
            CSS Grid is the cleanest way to lay elements out in two dimensions, but
            the syntax takes a moment to picture. This generator lets you set the
            columns, rows and gap with sliders and shows the tracks filling in
            live, so the relationship between the numbers and the layout is
            obvious.
          </p>
          <h2>Copy the container rule</h2>
          <p>
            The output is the CSS for the grid container — display, the column and
            row templates using repeat() and 1fr, and the gap. Paste it onto a
            wrapper and its children flow into the cells. It all runs on your
            device with nothing uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <GridTool />
    </ToolPageShell>
  );
}
