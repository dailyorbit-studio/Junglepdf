import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import FlexboxTool from "./FlexboxTool";

export const metadata: Metadata = toolMetadata({
  category: "css",
  slug: "flexbox",
  title: "Flexbox Generator — CSS Flex Layout Playground",
  description:
    "Experiment with flex direction, justify-content, align-items, wrap and gap on live items, then copy the flexbox CSS. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What's the difference between justify-content and align-items?",
    answer:
      "justify-content positions items along the main axis (the direction the flex container flows), while align-items positions them across the cross axis. Flip the direction from row to column and the two swap which visual axis they control — the live preview makes that clear.",
  },
  {
    question: "When should I use flexbox versus grid?",
    answer:
      "Flexbox excels at laying items out in one dimension — a row or a column — and distributing space among them. Grid is for true two-dimensional layouts. For a nav bar or a button row, flexbox is usually the simpler fit.",
  },
  {
    question: "Is the CSS free to use?",
    answer: "Yes, with no attribution. It is generated in your browser and nothing is uploaded.",
  },
];

export default function FlexboxPage() {
  return (
    <ToolPageShell
      category="css"
      slug="flexbox"
      title="Flexbox Generator"
      description="Experiment with flex alignment and copy the flexbox CSS. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "CSS", href: "/css" },
        { label: "Flexbox Generator" },
      ]}
      steps={[
        "Set the direction, then the alignment and wrap.",
        "Watch the row of items respond.",
        "Copy the flex CSS for your container.",
      ]}
      articleContent={
        <>
          <h2>See flexbox behave</h2>
          <p>
            Flexbox is the workhorse of one-dimensional layout, but its properties
            are easy to mix up — especially which axis justify-content and
            align-items act on. This playground lets you change each property and
            watch a live row of items react, which is the fastest way to build the
            right mental model.
          </p>
          <h2>Copy the container rule</h2>
          <p>
            The output is the CSS for the flex container: display, direction,
            justify-content, align-items, wrap and gap. Paste it onto a wrapper and
            its children arrange themselves accordingly. Everything runs on your
            device with nothing uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <FlexboxTool />
    </ToolPageShell>
  );
}
