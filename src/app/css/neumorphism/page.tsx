import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import NeumorphismTool from "./NeumorphismTool";

export const metadata: Metadata = toolMetadata({
  category: "css",
  slug: "neumorphism",
  title: "Neumorphism CSS Generator — Soft UI Shadows",
  description:
    "Create soft, extruded neumorphic shadows with live controls for distance, blur and shape, then copy the CSS. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Why does neumorphism use two shadows?",
    answer:
      "The soft-UI look comes from a dark shadow on one side and a light highlight on the opposite side, as if a single light source were hitting a shape extruded from the surface. The generator derives both colours from your background automatically.",
  },
  {
    question: "What do concave, convex and pressed do?",
    answer:
      "They change how the shape reads: convex bulges out, concave dips in, and pressed uses inset shadows so the element looks pushed into the surface — the usual style for an active button.",
  },
  {
    question: "Any accessibility caveat?",
    answer:
      "Neumorphism relies on very low contrast, which can make controls hard to see. Use it sparingly for interactive elements, and keep text and icons at a readable contrast. The CSS is generated in your browser and free to use.",
  },
];

export default function NeumorphismPage() {
  return (
    <ToolPageShell
      category="css"
      slug="neumorphism"
      title="Neumorphism Generator"
      description="Create soft, extruded neumorphic shadows and copy the CSS. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "CSS", href: "/css" },
        { label: "Neumorphism Generator" },
      ]}
      steps={[
        "Pick a background colour to match your surface.",
        "Tune the distance, blur and shape.",
        "Copy the paired-shadow CSS.",
      ]}
      articleContent={
        <>
          <h2>Soft UI, generated</h2>
          <p>
            Neumorphism makes an element look moulded from the background rather
            than placed on top of it. The trick is a matched pair of shadows —
            dark on one corner, light on the other — derived from the surface
            colour. This generator computes both from your chosen background and
            previews the result live.
          </p>
          <h2>Four surface shapes</h2>
          <p>
            Switch between flat, convex, concave and pressed to change how the
            shape sits in the surface, from gently raised to pushed in. Because
            the effect leans on subtle contrast, use it deliberately — and copy
            the CSS straight into your project. It all runs on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <NeumorphismTool />
    </ToolPageShell>
  );
}
