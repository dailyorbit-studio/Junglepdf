import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ColorGradientTool from "./ColorGradientTool";

export const metadata: Metadata = toolMetadata({
  category: "color",
  slug: "gradient",
  title: "Gradient Generator — Multi-Stop CSS Gradients",
  description:
    "Build a three-colour linear or radial CSS gradient and copy the background. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How many colours can I use?",
    answer:
      "Three colour stops, spread evenly across the gradient, which is enough for rich blends without becoming muddy. Pick each stop and the preview updates live.",
  },
  {
    question: "Linear or radial?",
    answer:
      "Both. A linear gradient runs in a straight line at the angle you set; a radial gradient spreads outward from the centre. Switch between them to see which suits your design.",
  },
  {
    question: "Is the CSS free to use?",
    answer: "Yes, with no attribution. It is generated in your browser and nothing is uploaded.",
  },
];

export default function ColorGradientPage() {
  return (
    <ToolPageShell
      category="color"
      slug="gradient"
      title="Gradient Generator"
      description="Build a multi-stop CSS gradient with colour stops you choose. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Color", href: "/color" },
        { label: "Gradient Generator" },
      ]}
      steps={["Choose linear or radial.", "Pick three colour stops.", "Copy the background CSS."]}
      articleContent={
        <>
          <h2>Three-colour blends</h2>
          <p>
            A two-colour gradient is fine, but a third stop in the middle opens up
            far richer transitions. This generator gives you three colour stops
            across a linear or radial gradient, previewed full-size, and outputs a
            single background declaration to paste in.
          </p>
          <h2>Painted, not an image</h2>
          <p>
            CSS gradients are drawn by the browser, so they stay crisp at any size
            and add no download weight. Everything is generated on your device
            with nothing uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ColorGradientTool />
    </ToolPageShell>
  );
}
