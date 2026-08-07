import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ContrastTool from "./ContrastTool";

export const metadata: Metadata = toolMetadata({
  category: "color",
  slug: "contrast",
  title: "Color Contrast Checker — WCAG AA & AAA",
  description:
    "Check the WCAG contrast ratio between a text and background colour, with AA and AAA pass/fail for normal and large text. Runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "What ratios do I need to pass?",
    answer:
      "WCAG AA requires 4.5:1 for normal text and 3:1 for large text (roughly 18px bold or 24px regular). AAA is stricter at 7:1 and 4.5:1. The checker shows all four verdicts at once.",
  },
  {
    question: "Why does contrast matter?",
    answer:
      "Low-contrast text is hard to read for people with low vision, in bright sunlight, or on a poor screen. Meeting the ratios is both an accessibility requirement and simply better for everyone.",
  },
  {
    question: "How is the ratio calculated?",
    answer:
      "Using the official WCAG formula based on the relative luminance of each colour. It runs entirely in your browser.",
  },
];

export default function ContrastPage() {
  return (
    <ToolPageShell
      category="color"
      slug="contrast"
      title="Contrast Checker"
      description="Check the WCAG contrast ratio between two colours and whether it passes. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Color", href: "/color" },
        { label: "Contrast Checker" },
      ]}
      steps={["Pick a text and a background colour.", "Read the contrast ratio.", "Check the AA and AAA verdicts."]}
      articleContent={
        <>
          <h2>Readable colour combinations</h2>
          <p>
            Contrast is the single biggest factor in whether text is legible. This
            checker measures the ratio between your text and background colours
            using the official WCAG formula and tells you, at a glance, whether it
            meets AA and AAA for both normal and large text — with a live preview
            so you can see the result.
          </p>
          <h2>Accessibility, checked instantly</h2>
          <p>
            Adjust either colour and every verdict updates immediately, so you can
            nudge a shade until it passes rather than guessing. It all runs on your
            device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ContrastTool />
    </ToolPageShell>
  );
}
