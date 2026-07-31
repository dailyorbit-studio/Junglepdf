import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ColorPickerTool from "./ColorPickerTool";

export const metadata: Metadata = toolMetadata({
  category: "image",
  slug: "color-picker",
  title: "Image Color Picker — Get HEX, RGB and HSL From Any Photo",
  description:
    "Pick colours from an image and extract its dominant palette as HEX, RGB and HSL. Runs entirely in your browser — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "How do I pick a specific colour?",
    answer:
      "Click anywhere on the image, or press and drag to sweep across it while the readout updates. The large swatch shows what you picked, with HEX, RGB and HSL underneath — click any of those to copy it.",
  },
  {
    question: "How are the dominant colours chosen?",
    answer:
      "By median cut. The image's pixels are treated as points in RGB space and repeatedly split along whichever colour channel currently spans the widest range, until there are six groups. Each group's average becomes a swatch, and the percentage tells you how much of the image it covers. Median cut is deterministic, so the same image always yields the same palette — which matters when you are copying values into a stylesheet and expect them not to drift.",
  },
  {
    question: "Why does the picked colour not exactly match what I see?",
    answer:
      "The image is downscaled to at most 640 pixels before sampling, so each sample is effectively a small local average rather than one raw pixel. That is usually what you want: photographs are noisy, and a single pixel from a JPEG often sits several percent away from the colour your eye reads. It does mean that on a hard edge between two colours you will read a blend of both, so click into the middle of an area rather than its boundary.",
  },
  {
    question: "What do HEX, RGB and HSL each mean?",
    answer:
      "They describe the same colour three ways. HEX is the six-digit form used throughout CSS and design tools. RGB gives the same three channel values in decimal, which is what you want when a colour needs to be computed rather than pasted. HSL splits it into hue, saturation and lightness, which is far easier to adjust by hand — nudging lightness in HSL produces a sensible lighter shade, while doing the same in HEX rarely does.",
  },
  {
    question: "What happens to transparent areas?",
    answer:
      "They are ignored. Fully transparent pixels are skipped when picking, and pixels below half opacity are excluded from the palette entirely. Otherwise a logo on a transparent background would return a palette dominated by whatever arbitrary RGB the encoder happened to leave beneath the alpha channel.",
  },
  {
    question: "Is my image uploaded anywhere?",
    answer:
      "No. The image is decoded and read into a pixel buffer inside your browser tab. Nothing is transmitted, so this is safe for screenshots, unreleased design work, and client material under NDA.",
  },
];

export default function ColorPickerPage() {
  return (
    <ToolPageShell
      category="image"
      slug="color-picker"
      title="Image Color Picker"
      description="Read the exact colour under your cursor, or pull out the palette that defines the whole image. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image", href: "/image" },
        { label: "Color Picker" },
      ]}
      articleContent={
        <>
          <h2>Reading colour out of an image</h2>
          <p>
            Your browser can decode an image into a raw array of red, green,
            blue and alpha values, one set per pixel. This tool does exactly
            that, then answers two questions against the result: what colour
            is at this point, and what handful of colours best summarises the
            whole thing.
          </p>
          <p>
            The buffer is built from a downscaled copy — at most 640 pixels on
            the long edge. Reading a 40-megapixel photograph at full resolution
            would allocate around 160MB for no benefit, since a summary does
            not get more accurate with more samples and a cursor cannot be
            positioned to sub-pixel precision anyway.
          </p>
          <h2>How the palette is built</h2>
          <p>
            The dominant colours come from median cut, the same family of
            algorithm that GIF encoders use to reduce an image to 256 colours.
            Every qualifying pixel becomes a point in three-dimensional colour
            space. The algorithm finds the group spanning the widest range in
            any one channel, sorts it along that channel, and splits it at the
            median. Repeat until you have as many groups as you want swatches,
            then average each group.
          </p>
          <p>
            Splitting the widest group rather than the largest one is the
            important detail. It stops a big flat sky from consuming every
            slot and leaves room for the smaller but more distinct colours that
            actually characterise the image.
          </p>
          <p>
            Because there is no randomness anywhere in that process, the same
            image always produces the same six swatches. That is a deliberate
            choice over k-means, which is often slightly better at clustering
            but seeds randomly and can hand you different hex codes on a second
            run — an unpleasant surprise when you have already pasted the first
            set into a stylesheet.
          </p>
          <h2>HEX, RGB and HSL</h2>
          <p>
            HEX is the compact form CSS and every design tool understands. RGB
            is the same information in decimal, useful when a value has to be
            calculated or passed to code. HSL restates it as hue, saturation
            and lightness.
          </p>
          <p>
            HSL is worth reaching for when you need to derive colours rather
            than just record them. Producing a hover state, a disabled variant,
            or a matching darker border is a small adjustment to the lightness
            value in HSL, and almost impossible to do by inspection in HEX.
          </p>
          <h2>Practical uses</h2>
          <ul>
            <li>Matching a site&apos;s accent colour to a logo or product photo</li>
            <li>Sampling a colour from a screenshot when you have no access to the original file</li>
            <li>Building a palette from a reference photograph for an illustration or deck</li>
            <li>Checking whether a brand colour actually appears in the imagery that surrounds it</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ColorPickerTool />
    </ToolPageShell>
  );
}
