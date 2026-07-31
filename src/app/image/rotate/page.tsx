import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ImageRotateTool from "./ImageRotateTool";

export const metadata: Metadata = toolMetadata({
  category: "image",
  slug: "rotate",
  title: "Rotate & Flip Image Online — Free Browser Tool",
  description:
    "Rotate images 90, 180 or 270 degrees and flip them horizontally or vertically, with a live preview. Runs entirely in your browser — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Can I rotate by an arbitrary angle, like 5 degrees?",
    answer:
      "No — rotation is limited to 90 degree steps. An arbitrary angle leaves triangular gaps at the corners that have to be either filled with a colour or cropped away, which turns a simple rotation into a compositing decision. Straightening a crooked horizon is a different job than turning a sideways photo upright, and this tool does the second one.",
  },
  {
    question: "Why did my photo come out sideways in the first place?",
    answer:
      "Cameras and phones usually record the image in the sensor's native orientation and store a separate EXIF tag saying which way up it should be displayed. Some software honours that tag and some ignores it, which is why the same file can look correct in one app and rotated in another. Applying a real rotation here bakes the correct orientation into the pixels so every viewer agrees.",
  },
  {
    question: "Does rotating lose quality?",
    answer:
      "The rotation itself does not. Quarter turns just remap pixels to new positions with no interpolation, so every pixel survives intact. What can cost quality is the re-encode afterwards: exporting as JPG or WebP runs the image through a lossy encoder again. Export as PNG if you need the pixels to be bit-for-bit identical to the source.",
  },
  {
    question: "What is the difference between rotating 180 degrees and flipping both ways?",
    answer:
      "They look similar but are not the same. A 180 degree rotation turns the image upside down; flipping horizontally and vertically mirrors it on both axes. For a symmetrical subject the result can be identical, but for anything containing text the rotation stays readable upside down while the double flip produces mirror writing.",
  },
  {
    question: "Are my images uploaded anywhere?",
    answer:
      "No. The transform is a canvas operation performed by your browser. The preview you see before committing is pure CSS, and the export is a single draw into an off-screen canvas. Nothing is sent over the network.",
  },
];

export default function ImageRotatePage() {
  return (
    <ToolPageShell
      category="image"
      slug="rotate"
      title="Rotate & Flip"
      description="Turn an image in 90° steps and mirror it on either axis. The preview updates as you go, so you commit only once. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image", href: "/image" },
        { label: "Rotate & Flip" },
      ]}
      articleContent={
        <>
          <h2>Rotation and flipping, done in the browser</h2>
          <p>
            The preview here is a CSS transform, which costs nothing and
            updates instantly as you click. Only when you press Apply does the
            image get decoded and redrawn into a real canvas at full
            resolution, then encoded once. That keeps the interaction snappy
            on large photos while making sure the file you download reflects
            exactly what you saw.
          </p>
          <p>
            Rotation and flipping compose in a fixed order internally — the
            canvas origin moves to the centre of the output, the rotation is
            applied, then the mirroring — so the result is the same regardless
            of which buttons you pressed first. That predictability is the
            whole reason the tool has a preview rather than a set of
            fire-and-forget buttons.
          </p>
          <h2>EXIF orientation and why photos arrive sideways</h2>
          <p>
            Digital cameras record images in whatever orientation the sensor
            sits, then write an EXIF orientation tag describing how a viewer
            should present it. Honouring that tag is optional, and plenty of
            software skips it. The practical result is a photo that looks
            upright in your phone&apos;s gallery and lands on its side once
            uploaded to a website or opened in an older editor.
          </p>
          <p>
            Rotating here writes the correct orientation into the pixel data
            itself. Every viewer agrees on the result afterwards, because
            there is no longer a tag for anyone to disagree about.
          </p>
          <h2>Quarter turns are lossless in principle</h2>
          <p>
            A 90, 180 or 270 degree rotation is a pure remapping: each source
            pixel lands exactly on a destination pixel with no interpolation
            and no blending. Nothing is invented and nothing is averaged away.
          </p>
          <p>
            The one place quality can slip is the export. Writing the result as
            JPG or WebP runs it through a lossy encoder, and each such pass
            compounds with any that came before. If the source was already a
            JPG, keep the quality slider high. If you need a guarantee, export
            as PNG — the transform plus a PNG export together are genuinely
            lossless.
          </p>
          <h2>Common uses</h2>
          <ul>
            <li>Turning a sideways phone photo upright before printing or sharing</li>
            <li>Correcting a scan that came out of the scanner rotated</li>
            <li>Mirroring a selfie so text in the background reads correctly</li>
            <li>Flipping a diagram or logo to face the other direction in a layout</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ImageRotateTool />
    </ToolPageShell>
  );
}
