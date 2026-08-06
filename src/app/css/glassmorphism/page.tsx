import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import GlassmorphismTool from "./GlassmorphismTool";

export const metadata: Metadata = toolMetadata({
  category: "css",
  slug: "glassmorphism",
  title: "Glassmorphism CSS Generator — Frosted Glass Effect",
  description:
    "Design a frosted-glass card with live blur, transparency and tint controls, then copy the backdrop-filter CSS. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What makes the glass effect work?",
    answer:
      "The backdrop-filter property, which blurs whatever sits behind the element, combined with a semi-transparent background so that blur shows through. The generator writes both, plus the -webkit- prefix for Safari.",
  },
  {
    question: "Does it work in every browser?",
    answer:
      "backdrop-filter is supported in current versions of all major browsers. Older browsers ignore it and simply show the flat semi-transparent background, so it degrades gracefully.",
  },
  {
    question: "Is the generated CSS free to use?",
    answer:
      "Yes. Copy it into any project with no attribution. Everything is generated in your browser — nothing is uploaded.",
  },
];

export default function GlassmorphismPage() {
  return (
    <ToolPageShell
      category="css"
      slug="glassmorphism"
      title="Glassmorphism Generator"
      description="Design a frosted-glass card and copy the CSS, backdrop-blur and all. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "CSS", href: "/css" },
        { label: "Glassmorphism Generator" },
      ]}
      steps={[
        "Adjust the blur, transparency and tint.",
        "Watch the frosted card update over the backdrop.",
        "Copy the CSS into your project.",
      ]}
      articleContent={
        <>
          <h2>Frosted glass, dialled in</h2>
          <p>
            Glassmorphism is the frosted-panel look — a translucent card that
            blurs whatever it sits over. It depends on two things working
            together: a semi-transparent background and a backdrop blur. This
            generator lets you balance them by eye against a colourful backdrop,
            so you can see exactly how the effect reads before you ship it.
          </p>
          <h2>Copy-ready and prefixed</h2>
          <p>
            The output includes the -webkit-backdrop-filter prefix Safari needs
            and a subtle border and shadow that sell the effect. Paste it onto any
            element that has something visually busy behind it — that contrast is
            what makes the glass visible. It all runs on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <GlassmorphismTool />
    </ToolPageShell>
  );
}
