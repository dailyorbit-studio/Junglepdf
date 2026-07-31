import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import WatermarkVideoTool from "./WatermarkVideoTool";

export const metadata: Metadata = toolMetadata({
  category: "video",
  slug: "watermark",
  title: "Add Watermark to Video — Stamp a Logo on Every Frame",
  description:
    "Overlay a logo or image onto a video, with the position, size and opacity you choose. Transparent PNGs stay transparent. Runs entirely in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "What image format should I use for the logo?",
    answer:
      "A PNG with a transparent background gives by far the cleanest result — only your mark appears over the video. JPEG and WebP work too, but a JPEG has no transparency, so it will always show as a solid rectangle.",
  },
  {
    question: "Can I put the watermark somewhere other than the five positions offered?",
    answer:
      "Not directly. The four corners plus centre cover almost every real use, and an arbitrary position would mean a preview and drag interface for something most people set once. The margin slider moves a corner watermark inward as far as you like.",
  },
  {
    question: "Does the watermark appear on every frame?",
    answer:
      "Yes. It is composited into the video stream itself, so it is present for the entire duration and survives any later re-encoding, trimming or upload.",
  },
  {
    question: "Why is this slower than muting or trimming a video?",
    answer:
      "Because the picture changes. Muting only drops the audio stream and trimming copies compressed data, so neither needs to touch the frames. Overlaying an image means decoding, compositing and re-encoding every frame in the file.",
  },
  {
    question: "Is my video or logo uploaded anywhere?",
    answer:
      "No. Both files are read into your browser's memory and processed there by a WebAssembly build of FFmpeg. Neither is transmitted to any server.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="video"
      slug="watermark"
      title="Watermark Video"
      description="Stamp a logo onto every frame — corner or centre, at whatever size and opacity you want."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Video", href: "/video" },
        { label: "Watermark Video" },
      ]}
      steps={[
        "Drop in your video",
        "Add the logo — a transparent PNG works best",
        "Set the position, size and opacity, then apply",
      ]}
      articleContent={
        <>
          <h2>Sizing relative to the video, not in pixels</h2>
          <p>
            The logo size here is a percentage of the video’s width rather than a fixed
            pixel value. A 200px logo is prominent on a 720p clip and nearly invisible on
            a 4K one, so a pixel size would need re-tuning for every source.
          </p>
          <p>
            At 20% — the default — the watermark occupies a fifth of the frame width on
            any input, which reads the same on a phone and on a television. The same is
            true of nothing else in the chain: the margin is in real pixels, because a
            proportional margin looks wrong on very wide footage.
          </p>
          <h2>Why transparency survives</h2>
          <p>
            Opacity here is applied to the logo’s own alpha channel rather than as a
            blanket transparency on the whole overlay. The difference matters: a global
            opacity would make the transparent area of a PNG semi-opaque, so the logo
            would arrive sitting on a faint grey rectangle.
          </p>
          <p>
            Multiplying the existing alpha instead means transparent stays fully
            transparent at any opacity setting, and only the visible part of the logo
            fades. A JPEG logo has no transparency to preserve, so it will always appear
            as a rectangle — use a PNG if that matters.
          </p>
          <h2>What a visible watermark is and is not</h2>
          <p>
            A stamped logo deters casual reuse and identifies the source when a clip is
            reposted. It is not protection: anyone determined can crop it out, blur it,
            or simply re-record the screen. Treat it as attribution rather than as
            security, and place it where cropping it would also crop the content.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <WatermarkVideoTool />
    </ToolPageShell>
  );
}
