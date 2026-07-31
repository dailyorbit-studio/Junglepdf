import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ImageCompressorTool from "./ImageCompressorTool";

export const metadata: Metadata = toolMetadata({
  category: "image",
  slug: "compressor",
  title: "Image Compressor — Shrink to Target KB",
  description:
    "Compress images to an exact file size in KB. Set your target and the tool automatically adjusts quality. 100% browser-based, no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "How accurate is the target file size?",
    answer:
      "The compression engine binary-searches the JPEG quality setting for the sharpest image that still fits under your target, typically landing within 2KB of it. If even the lowest quality can't reach your target, the tool says so rather than handing back an oversized file.",
  },
  {
    question: "Does this work with PNG and WebP files?",
    answer:
      "You can upload PNG, WebP, and JPEG files. The output is always JPEG, since JPEG compression offers the most control over file size. Transparent areas in a PNG become white, because JPEG has no transparency. If you need to keep transparency, use the Image Resizer with PNG output instead.",
  },
  {
    question: "What if my target size is too small?",
    answer:
      "The tool compresses as aggressively as it can. If the lowest quality setting still exceeds your target, you'll see a notice explaining that — usually the fix is to reduce the pixel dimensions first with the Image Resizer, since quality alone can't shrink a very large photo indefinitely.",
  },
  {
    question: "Is there a maximum image resolution?",
    answer:
      "Files can be up to 50MB. Resolution is limited by your browser's canvas ceiling, which on mobile Safari is around 16.7 megapixels. Images beyond that are rejected with a clear message rather than silently producing a blank result.",
  },
  {
    question: "Can I compress multiple images at once?",
    answer:
      "Currently the tool processes one image at a time. Batch compression is on our roadmap. For now, you can compress one image and immediately start the next.",
  },
];

export default function ImageCompressorPage() {
  return (
    <ToolPageShell
      category="image"
      slug="compressor"
      title="Image Compressor"
      description="Set a target file size in KB, and the tool adjusts JPEG quality until your image fits. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image", href: "/image" },
        { label: "Image Compressor" },
      ]}
      articleContent={
        <>
          <h2>How the target-size compression works</h2>
          <p>
            Most image compressors give you a quality slider and let you
            guess what file size you&apos;ll end up with. This tool works
            the other way around: you tell it the file size you need, and
            it figures out the right quality setting automatically.
          </p>
          <p>
            Under the hood, the tool draws your image onto a canvas, then
            exports it as a JPEG at different quality levels. It first checks
            both extremes — if full quality already fits your target there is
            nothing to trade away, and if the lowest quality still overshoots,
            the target is unreachable at this resolution. Between those bounds
            it binary-searches for the highest quality that still fits, usually
            converging in eight to twelve attempts.
          </p>
          <h2>When you&apos;d use this</h2>
          <ul>
            <li>Government or university forms that require photos under a specific KB limit</li>
            <li>Email attachments where the mail server rejects files over a certain size</li>
            <li>Web uploads with strict file size constraints (profile photos, document scans)</li>
            <li>Optimizing images for web pages where every kilobyte matters for load time</li>
          </ul>
          <h2>Transparency and JPEG</h2>
          <p>
            JPEG has no alpha channel, so transparent pixels have to become
            something. This tool composites them onto white before encoding.
            Without that step transparent areas would come out black, which is
            what a bare canvas produces by default. If you need transparency
            preserved, the Image Resizer can output PNG or WebP instead.
          </p>
          <h2>Technical details</h2>
          <p>
            Quality values range from 0.01 (heavy compression, visible
            artifacts) to 1.0 (minimal compression, near-original quality).
            The search converges quickly because JPEG file size scales roughly
            monotonically with the quality parameter.
          </p>
          <p>
            All processing happens in your browser. The image data never
            leaves your device. Once the compressed image is generated, you
            can download it directly — there&apos;s no server round-trip
            involved at any stage.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ImageCompressorTool />
    </ToolPageShell>
  );
}
