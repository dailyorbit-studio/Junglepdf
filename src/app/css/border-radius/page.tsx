import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import BorderRadiusTool from "./BorderRadiusTool";

export const metadata: Metadata = toolMetadata({
  category: "css",
  slug: "border-radius",
  title: "Border Radius Generator — Round Corners CSS",
  description:
    "Round each corner independently with live sliders and copy the border-radius CSS. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What order are the corners in?",
    answer:
      "The border-radius shorthand lists corners clockwise from the top-left: top-left, top-right, bottom-right, bottom-left. The generator writes them in that order so you can paste it straight in.",
  },
  {
    question: "Can I round just one corner?",
    answer:
      "Yes. Turn off 'link all corners' and each slider controls a single corner, so you can round one side while leaving the others square.",
  },
  {
    question: "Is the CSS free to use?",
    answer:
      "Yes, with no attribution. It is generated in your browser and nothing is uploaded.",
  },
];

export default function BorderRadiusPage() {
  return (
    <ToolPageShell
      category="css"
      slug="border-radius"
      title="Border Radius Generator"
      description="Round corners individually and copy the border-radius CSS. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "CSS", href: "/css" },
        { label: "Border Radius Generator" },
      ]}
      steps={[
        "Link the corners for a uniform radius, or unlink to shape each.",
        "Drag the sliders and watch the box change.",
        "Copy the border-radius CSS.",
      ]}
      articleContent={
        <>
          <h2>Corners, exactly how you want them</h2>
          <p>
            Rounded corners are simple until you want them uneven — a card with
            two rounded top corners and square bottom ones, say. This generator
            gives each corner its own slider and shows the result live, so you can
            shape a box precisely instead of guessing at four numbers.
          </p>
          <h2>The right shorthand</h2>
          <p>
            The output uses the standard clockwise shorthand, so it drops straight
            into your stylesheet. Keep the corners linked for a uniform radius, or
            unlink them for asymmetric shapes. It all runs on your device with
            nothing to upload.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <BorderRadiusTool />
    </ToolPageShell>
  );
}
