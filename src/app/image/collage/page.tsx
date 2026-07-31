import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import CollageTool from "./CollageTool";

export const metadata: Metadata = toolMetadata({
  category: "image",
  slug: "collage",
  title: "Image Collage Maker — Combine Photos Into One Picture",
  description:
    "Combine several images into one — side by side, stacked, or in a grid — with the gap and background you choose. Runs entirely in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "Can I change the order of the images?",
    answer:
      "Yes — use the arrows next to each file to move it up or down before creating the collage. The order in the list is the order they are placed, left to right and then top to bottom.",
  },
  {
    question: "Why is there space around some of my images?",
    answer:
      "Because the cells are all the size of the largest image, and a smaller or differently-shaped picture is centred inside its cell rather than stretched to fill it. That is what keeps every photo at its true proportions.",
  },
  {
    question: "How many images can I combine?",
    answer:
      "Up to twenty. Beyond that the output canvas gets large enough to hit browser limits, and a collage of thirty photos is not really a collage any more.",
  },
  {
    question: "Which format should I export?",
    answer:
      "JPEG for collages of photographs — much smaller files, no visible difference. PNG if the images contain text, screenshots or line art, where JPEG compression would soften the edges. WebP if you want both and know your destination supports it.",
  },
  {
    question: "Are my photos uploaded?",
    answer:
      "No. Everything is drawn onto a canvas in your browser and encoded there. The images never leave your device.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="image"
      slug="collage"
      title="Image Collage"
      description="Put several pictures together into one image — in a row, a column, or a grid."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image", href: "/image" },
        { label: "Image Collage" },
      ]}
      steps={[
        "Drop in two or more images",
        "Put them in the order you want and pick a layout",
        "Create the collage, then download it",
      ]}
      articleContent={
        <>
          <h2>Cells, not stretching</h2>
          <p>
            Every image gets a cell the size of the largest picture in the set, and each
            one is centred inside its cell at its own proportions. Nothing is stretched
            to fill.
          </p>
          <p>
            The alternative — scaling everything to identical dimensions — is what makes
            collages look wrong when the sources are a mix of portrait and landscape.
            Faces get subtly wider or narrower, and it is hard to say why the result
            looks off. Letterboxing into a regular grid keeps every picture true.
          </p>
          <h2>The three layouts</h2>
          <p>
            <strong>Side by side</strong> puts everything in one row, which suits
            before-and-after pairs and short sequences. <strong>Stacked</strong> puts
            everything in one column, which suits a long screenshot broken into parts.
            <strong>Grid</strong> wraps at the number of columns you choose, which is
            what you want past about four images.
          </p>
          <h2>Gaps and background</h2>
          <p>
            The background colour fills the gaps and any letterboxed space in a cell. It
            is painted for every format, including PNG — a collage with transparent gaps
            is rarely what anyone wants, and it looks broken against a dark page.
          </p>
          <p>
            Zero gap butts the images directly together, which works well for
            continuation shots and panoramas. A gap of ten to twenty pixels reads as
            deliberate framing.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <CollageTool />
    </ToolPageShell>
  );
}
