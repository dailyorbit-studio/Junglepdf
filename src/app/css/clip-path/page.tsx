import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ClipPathTool from "./ClipPathTool";

export const metadata: Metadata = toolMetadata({
  category: "css",
  slug: "clip-path",
  title: "Clip Path Generator — CSS Shapes & Polygons",
  description:
    "Choose a shape — triangle, hexagon, star, arrow and more — and copy the CSS clip-path that cuts a box to it. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What does clip-path do?",
    answer:
      "It clips an element to a shape, hiding everything outside it. A rectangular image or box can be shown as a hexagon, a circle or an arrow without editing the image itself — the clipping is done by the browser.",
  },
  {
    question: "Does the element keep its layout box?",
    answer:
      "Yes. clip-path changes only what is painted, not the space the element occupies, so surrounding layout is unaffected. Clicks also register only on the visible shape.",
  },
  {
    question: "Is the CSS free to use?",
    answer: "Yes, with no attribution. It is generated in your browser and nothing is uploaded.",
  },
];

export default function ClipPathPage() {
  return (
    <ToolPageShell
      category="css"
      slug="clip-path"
      title="Clip Path Generator"
      description="Choose a shape and copy the CSS clip-path that cuts a box to it. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "CSS", href: "/css" },
        { label: "Clip Path Generator" },
      ]}
      steps={[
        "Pick a shape from the list.",
        "See it clip the preview box.",
        "Copy the clip-path CSS.",
      ]}
      articleContent={
        <>
          <h2>Cut any box into a shape</h2>
          <p>
            The CSS clip-path property lets you show an element as a polygon or a
            circle instead of a rectangle, without touching the underlying image
            or markup. This generator offers a set of ready-made shapes —
            triangles, hexagons, stars, arrows — and previews each one on a live
            box.
          </p>
          <h2>Just the shape you need</h2>
          <p>
            Pick a shape and copy its clip-path value straight into your CSS.
            Because clipping only affects painting, the element keeps its normal
            layout and only the visible area responds to clicks. It all runs on
            your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ClipPathTool />
    </ToolPageShell>
  );
}
