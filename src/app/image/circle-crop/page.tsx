import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import CircleCropTool from "./CircleCropTool";

export const metadata: Metadata = toolMetadata({
  category: "image",
  slug: "circle-crop",
  title: "Circle Crop — Round Profile Picture Maker",
  description:
    "Crop a photo into a circle for an avatar or profile picture, with an optional ring. Transparent PNG output. Runs entirely in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "Which format should I choose for a profile picture?",
    answer:
      "PNG, in almost every case. It keeps the corners transparent, so the circle sits cleanly on whatever background the site uses. Only pick JPEG if the destination refuses PNG, and then set the corner colour to match its background.",
  },
  {
    question: "Why is part of my photo cut off?",
    answer:
      "Because a circle needs a square, and the square is taken from the centre of the picture. Crop to the square you want with the Image Cropper first if the centre is not where your subject is.",
  },
  {
    question: "Will the circle still be round on every site?",
    answer:
      "The image is round; whether it looks round depends on the site not stretching it. Since the output is exactly square, any site that respects the aspect ratio will show a circle.",
  },
  {
    question: "Can I make an oval instead?",
    answer:
      "No — the crop is always a true circle from a square canvas. That is what profile pictures use, and an oval would need a second axis control for something almost nobody asks for.",
  },
  {
    question: "Is my photo uploaded?",
    answer:
      "No. The mask is drawn on a canvas in your browser and the image is encoded there. Your photo never leaves your device.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="image"
      slug="circle-crop"
      title="Circle Crop"
      description="Crop a photo to a circle — for an avatar, a profile picture, or a logo."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image", href: "/image" },
        { label: "Circle Crop" },
      ]}
      steps={[
        "Drop in a photo",
        "Choose the format and whether you want a ring",
        "Crop, then download",
      ]}
      articleContent={
        <>
          <h2>Square first, then a circle</h2>
          <p>
            A circle has to come from a square, so the output is the shorter edge of your
            picture and is taken from the centre. On a 4:3 photograph that means the left
            and right edges are trimmed; on a portrait shot, the top and bottom.
          </p>
          <p>
            Centring is what every avatar cropper does, because a face is usually near
            the middle. If your subject is off to one side, use the Image Cropper first
            to pick the square you want, then bring the result here.
          </p>
          <h2>Transparency, and why the format matters</h2>
          <p>
            PNG and WebP can store an alpha channel, so the corners outside the circle
            come out genuinely transparent. Dropped onto any background — dark, light or
            patterned — only the circle shows.
          </p>
          <p>
            JPEG cannot store transparency at all. Rather than producing black corners,
            which is what a naive tool does, the corners are filled with a colour you
            choose. If you know the background it will sit on, matching it here gives the
            same result as real transparency.
          </p>
          <h2>The ring</h2>
          <p>
            An optional ring is drawn just inside the edge, so it is never half clipped
            by the canvas boundary. A few pixels of white or a brand colour separates a
            profile picture from the background behind it, which is the difference
            between a photo that reads as an avatar and one that reads as a mistake.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <CircleCropTool />
    </ToolPageShell>
  );
}
