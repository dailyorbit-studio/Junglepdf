import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import BoxShadowTool from "./BoxShadowTool";

export const metadata: Metadata = toolMetadata({
  category: "css",
  slug: "box-shadow",
  title: "Box Shadow Generator — CSS Shadow Maker",
  description:
    "Build a CSS box-shadow with live control over offset, blur, spread, colour and inset, then copy it. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What does each value control?",
    answer:
      "In order: horizontal offset, vertical offset, blur radius, spread radius, then the colour. A positive Y pushes the shadow down; blur softens the edge; spread grows or shrinks the shadow before blurring.",
  },
  {
    question: "What is an inset shadow?",
    answer:
      "An inset shadow is drawn inside the element instead of behind it, giving a pressed-in or recessed look. Toggle it on to switch the preview and the generated CSS to inset.",
  },
  {
    question: "Is the CSS free to use?",
    answer:
      "Yes. Copy it into any project without attribution. It is generated in your browser and nothing is uploaded.",
  },
];

export default function BoxShadowPage() {
  return (
    <ToolPageShell
      category="css"
      slug="box-shadow"
      title="Box Shadow Generator"
      description="Build a box-shadow with offset, blur, spread and colour, and copy the CSS. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "CSS", href: "/css" },
        { label: "Box Shadow Generator" },
      ]}
      steps={[
        "Adjust the offset, blur, spread and colour.",
        "Toggle inset for a recessed look if you want it.",
        "Copy the box-shadow CSS.",
      ]}
      articleContent={
        <>
          <h2>Shadows, tuned by eye</h2>
          <p>
            A good shadow is a matter of small numbers — a few pixels of offset, a
            soft blur, a low opacity. Getting them right by editing CSS and
            reloading is slow; here you drag sliders and the preview responds
            instantly, so you can find a shadow that reads as a natural elevation
            rather than a hard drop.
          </p>
          <h2>Every parameter, including inset</h2>
          <p>
            Offset, blur, spread, colour and opacity are all here, plus the inset
            toggle for recessed shadows. The output is a single, ready-to-paste
            box-shadow declaration. It all runs on your device with nothing
            uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <BoxShadowTool />
    </ToolPageShell>
  );
}
