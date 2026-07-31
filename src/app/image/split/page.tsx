import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import SplitImageTool from "./SplitImageTool";

export const metadata: Metadata = toolMetadata({
  category: "image",
  slug: "split",
  title: "Split Image Into Grid — Cut a Picture Into Tiles",
  description:
    "Cut an image into a grid of equal tiles and download them as a ZIP. Ready-made presets for the Instagram 3×3 grid. Runs entirely in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "How do I split an image for an Instagram grid?",
    answer:
      "Use the 3 × 3 preset, then post the tiles in reverse order — starting with the bottom-right — because Instagram fills the grid from the newest post backwards. The tile numbering tells you the reading order to reverse.",
  },
  {
    question: "Are all the tiles exactly the same size?",
    answer:
      "Almost. Where the image does not divide evenly, the last column and last row take the leftover pixels, so they can be a pixel or two larger. Nothing is cropped away.",
  },
  {
    question: "Why does it come as a ZIP?",
    answer:
      "Because browsers block a rapid series of downloads, so nine separate files would not reliably arrive. One archive is a single click and always complete.",
  },
  {
    question: "How many tiles can I make?",
    answer:
      "Up to 400 — a 20 × 20 grid. Past that it is more files than belongs in an archive of images, and the tool says so rather than building it.",
  },
  {
    question: "Is my image uploaded?",
    answer:
      "No. The cutting happens on a canvas in your browser and the ZIP is assembled there too. Nothing is transmitted.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="image"
      slug="split"
      title="Split Image"
      description="Cut one picture into a grid of tiles, bundled into a single ZIP."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image", href: "/image" },
        { label: "Split Image" },
      ]}
      steps={[
        "Drop in an image",
        "Choose a grid — or set the rows and columns yourself",
        "Split, then download the ZIP",
      ]}
      articleContent={
        <>
          <h2>The Instagram grid, and everything else</h2>
          <p>
            The best-known use is splitting one picture across a 3×3 block of an
            Instagram profile, where the individual posts reassemble into a single large
            image on the grid. The 3×1 preset does the same thing across one row.
          </p>
          <p>
            Beyond that, splitting is useful for cutting a large scan into printable
            sections, breaking a long screenshot into readable pieces, or preparing
            sprite sheets and map tiles.
          </p>
          <h2>Numbering that sorts correctly</h2>
          <p>
            Tiles are numbered left to right, then top to bottom, with leading zeros
            added to match the total count. A 3×3 grid produces 1 through 9; a 4×4
            produces 01 through 16.
          </p>
          <p>
            The padding matters more than it sounds. Without it, file managers sort
            alphabetically and put tile 10 immediately after tile 1, so the order you see
            in the folder is not the order the tiles go back together in.
          </p>
          <h2>Where the leftover pixels go</h2>
          <p>
            An image rarely divides exactly. A 1000-pixel width cut into three gives
            333.33 pixels per column, and something has to happen to the remainder.
          </p>
          <p>
            The last column and the last row take it — so those tiles are up to a couple
            of pixels larger than the others. The alternative is discarding a strip down
            one edge of your picture, which is worse in every case.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <SplitImageTool />
    </ToolPageShell>
  );
}
