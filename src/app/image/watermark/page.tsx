import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ImageWatermarkTool from "./ImageWatermarkTool";

export const metadata: Metadata = toolMetadata({
  category: "image",
  slug: "watermark",
  title: "Add Watermark to Image — Free Online Photo Watermarking",
  description:
    "Stamp text across a photo with control over position, size, angle and opacity. Runs entirely in your browser — your image is never uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Can a watermark be removed from my photo?",
    answer:
      "Yes, with enough effort — this is worth being realistic about. A small corner mark can be cropped off in seconds. A semi-transparent overlay can be substantially reduced by software that has seen other images with the same mark. A watermark raises the cost of casual reuse and makes provenance obvious; it is not copy protection and nothing applied to a published image can be.",
  },
  {
    question: "Corner or tiled?",
    answer:
      "A corner mark is unobtrusive and suits work you are happy to have shared with attribution. Tiling is much harder to remove because it crosses the subject rather than sitting in dead space — the trade is that it is visible over your actual content. Tile for proofs and previews; use a corner for finished work.",
  },
  {
    question: "Why is the size a percentage instead of a font size?",
    answer:
      "Because a fixed point size means something completely different on a 600-pixel thumbnail than on a 6000-pixel camera original — the same 24px caption is prominent on one and unreadable on the other. Sizing as a fraction of the image means the mark looks the same on both, and you can watermark a batch of mixed sizes without adjusting anything.",
  },
  {
    question: "Will my photo lose quality?",
    answer:
      "The image is redrawn at its original resolution, so no detail is lost to scaling. If you save as JPEG there is one generation of re-compression, which is normally invisible. Choose PNG to avoid it entirely, at the cost of a considerably larger file.",
  },
  {
    question: "Why is there a faint outline around the text?",
    answer:
      "It is deliberate. A white mark disappears over a bright sky and a black one disappears into shadow, and no single colour contrasts with every region of a photograph. A subtle dark stroke around the glyphs keeps the text legible over both without you having to find a colour that works everywhere.",
  },
  {
    question: "Is my photo uploaded anywhere?",
    answer:
      "No. The image is drawn to a canvas in your browser, the text is composited on top, and the result is encoded locally. Nothing crosses the network.",
  },
];

export default function ImageWatermarkPage() {
  return (
    <ToolPageShell
      category="image"
      slug="watermark"
      title="Add a Watermark to an Image"
      description="Stamp text across a photo, with control over position, size, angle and transparency."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image", href: "/image" },
        { label: "Watermark Image" },
      ]}
      steps={[
        "Drop an image into the box above — it stays on your device.",
        "Type your text and set the position, size, angle and opacity.",
        "Apply the watermark and download the result.",
      ]}
      articleContent={
        <>
          <h2>What a watermark is actually for</h2>
          <p>
            It helps to be clear about this, because the common expectation and the
            reality are some distance apart. A watermark does not prevent your work
            being copied. Anything visible on a screen can be captured, and marks
            can be cropped, cloned out, or reduced by software specifically built
            for the purpose.
          </p>
          <p>
            What a watermark does well is make <strong>provenance obvious</strong>{" "}
            and <strong>casual reuse inconvenient</strong>. Someone who would have
            saved your image and reposted it without a thought now has to
            deliberately remove your name first — which turns an absent-minded
            act into a conscious one, and leaves them without a defence if it
            comes up later. For proofs sent to clients, it also makes it obvious
            which version is the unpaid one.
          </p>

          <h2>Corner marks and tiling</h2>
          <p>
            A <strong>corner mark</strong> sits in the margin of the frame, small
            and semi-transparent. It stays out of the way of the picture, which
            makes it the right choice for finished work you are happy to see shared
            as long as your name goes with it. Its weakness is equally obvious: a
            single crop removes it.
          </p>
          <p>
            <strong>Tiling</strong> repeats the mark across the entire image at an
            angle. Because it crosses the subject rather than sitting in empty
            space, there is no crop that removes it and no clean background to
            reconstruct. It is genuinely harder to defeat — and it is visibly in
            the way, which is why it belongs on proofs and previews rather than on
            work you are presenting.
          </p>

          <h2>Sizing that works on every image</h2>
          <p>
            The size control is a percentage of the image&apos;s shorter side rather
            than a font size in pixels, and that choice matters more than it might
            appear.
          </p>
          <p>
            A 24-pixel caption is a prominent band across a 600-pixel thumbnail and
            an illegible speck on a 6000-pixel camera original. Since you are
            picking the setting by eye on a scaled-down view either way, a fixed
            pixel size would mean a mark that looked right in the tool and wrong in
            the export. Sizing relatively means what you set is what you get,
            whatever the source resolution — and the same settings work across a
            batch of mixed sizes.
          </p>

          <h2>Keeping the text readable</h2>
          <p>
            Watermarks have to sit on top of photographs, and photographs contain
            every brightness at once. White text vanishes against a sky; black text
            vanishes in shadow. There is no colour that contrasts with the whole
            frame.
          </p>
          <p>
            The mark is drawn with a subtle dark stroke around the glyphs as well as
            a fill. On a bright area the fill carries it; on a dark area the stroke
            gives the letters an edge. The result stays readable across the whole
            image without you having to hunt for a colour that happens to work.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Adding a copyright line to photographs before publishing them</li>
            <li>Marking client proofs so the unpaid version is unmistakable</li>
            <li>Branding product images for a shop or marketplace listing</li>
            <li>Stamping &ldquo;DRAFT&rdquo; or &ldquo;SAMPLE&rdquo; across a preview</li>
            <li>Attributing images shared on social media</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ImageWatermarkTool />
    </ToolPageShell>
  );
}
