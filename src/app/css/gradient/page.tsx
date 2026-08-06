import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import GradientTool from "./GradientTool";

export const metadata: Metadata = toolMetadata({
  category: "css",
  slug: "gradient",
  title: "CSS Gradient Generator — Linear & Radial",
  description:
    "Design a linear or radial CSS gradient with live colour and angle controls, then copy the background. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What does the angle control?",
    answer:
      "The direction of a linear gradient: 0° runs bottom to top, 90° left to right, 135° is the popular top-left to bottom-right diagonal. Radial gradients spread from the centre outward, so the angle does not apply.",
  },
  {
    question: "Can I use the gradient as a background?",
    answer:
      "Yes — the output is a background declaration you can drop onto any element. Gradients are painted, not images, so they scale to any size with no loss of quality.",
  },
  {
    question: "Is the CSS free to use?",
    answer: "Yes, with no attribution. It is generated in your browser and nothing is uploaded.",
  },
];

export default function GradientPage() {
  return (
    <ToolPageShell
      category="css"
      slug="gradient"
      title="Gradient Generator"
      description="Design a linear or radial CSS gradient and copy the background. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "CSS", href: "/css" },
        { label: "Gradient Generator" },
      ]}
      steps={[
        "Choose linear or radial.",
        "Pick two colours and set the angle.",
        "Copy the background CSS.",
      ]}
      articleContent={
        <>
          <h2>Colour transitions, made visually</h2>
          <p>
            A CSS gradient blends one colour into another with no image file
            involved, so it stays crisp at any size and adds no download. This
            generator lets you pick the two colours and, for linear gradients, the
            angle, and shows the blend full-size as you adjust it.
          </p>
          <h2>Linear or radial, copy-ready</h2>
          <p>
            Switch between a linear sweep and a radial spread from the centre, and
            copy the resulting background declaration straight into your
            stylesheet. Everything is generated on your device, so there is
            nothing to upload and nothing to wait for.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <GradientTool />
    </ToolPageShell>
  );
}
