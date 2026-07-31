import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import VideoToGifTool from "./VideoToGifTool";

export const metadata: Metadata = toolMetadata({
  category: "video",
  slug: "to-gif",
  title: "Video to GIF — Convert MP4 to Animated GIF Free",
  description:
    "Turn a section of video into an animated GIF with a custom size and frame rate. Uses a generated palette for clean colour. No uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Why are GIF files so large?",
    answer:
      "Because GIF has no motion compression. Video codecs store most frames as differences from the previous one, which is why a minute of 1080p video can fit in a few megabytes. GIF stores every frame as an independent image compressed with LZW, a general-purpose algorithm from 1984. A five-second clip that occupies 2MB as MP4 can easily be 8MB as GIF.",
  },
  {
    question: "What does the palette pass do?",
    answer:
      "GIF can only hold 256 colours per frame. Left to itself, an encoder picks those from a fixed generic palette, which is what produces the muddy, heavily banded look of a bad conversion. This tool runs a first pass over your actual footage to build a palette from the colours that are really there, then a second pass that encodes using it. It is why the conversion takes two passes and why the result looks considerably better.",
  },
  {
    question: "What frame rate and width should I pick?",
    answer:
      "12 fps is the sweet spot for most content — motion reads as smooth enough and the file stays manageable. Drop to 8 for slow or mostly-static footage. Go to 20 or 25 only when the motion is genuinely fast and the jerkiness would be distracting; the file size scales almost linearly with frame rate. For width, 480px suits most web and chat use, 320px keeps files small for messaging, and 640px is worth it only when fine detail matters.",
  },
  {
    question: "Why is there a 30 second limit?",
    answer:
      "Because size and encode time both grow linearly with duration and a longer GIF is almost never the right format. A 30 second GIF at moderate settings is already tens of megabytes and takes a long while to build in WebAssembly. If you need to share something longer, an MP4 is smaller, higher quality, and supported everywhere a GIF is.",
  },
  {
    question: "Does the GIF keep the audio?",
    answer:
      "No — GIF has no concept of audio. It is an image format that happens to support animation. If the sound matters, use the Video Trimmer to cut the clip and share it as a video instead.",
  },
  {
    question: "Is my video uploaded anywhere?",
    answer:
      "No. Both encoding passes run through FFmpeg compiled to WebAssembly inside your browser tab. Nothing is transmitted.",
  },
];

export default function VideoToGifPage() {
  return (
    <ToolPageShell
      category="video"
      slug="to-gif"
      title="Video to GIF"
      description="Turn a slice of video into an animated GIF, with a palette built from your own footage so the colours hold up. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Video", href: "/video" },
        { label: "Video to GIF" },
      ]}
      articleContent={
        <>
          <h2>Two passes, and why it matters</h2>
          <p>
            GIF allows at most 256 colours in a frame. Video routinely contains
            hundreds of thousands. Something has to decide which 256 survive,
            and that decision is the entire difference between a GIF that looks
            like the source and one that looks like a fax of it.
          </p>
          <p>
            The naive approach uses a fixed, generic palette — an even spread
            across the colour cube that matches nothing in particular. Skin
            tones go blotchy, gradients band into visible stripes, and anything
            with a dominant hue turns muddy.
          </p>
          <p>
            This tool instead runs <code>palettegen</code> across the frames you
            selected, producing a palette optimised for the colours actually
            present, then encodes with <code>paletteuse</code> against it. If
            your clip is mostly a blue sky and a green field, nearly all 256
            slots go to blues and greens. The cost is a second pass over the
            footage; the benefit is obvious the moment you compare the two.
          </p>
          <h2>Why GIF files are so large</h2>
          <p>
            Modern video compression is built on the observation that
            consecutive frames are nearly identical. Store one complete frame,
            then describe the next twenty as small differences from it, and you
            get the enormous compression ratios that make streaming possible.
          </p>
          <p>
            GIF does none of this. Each frame is compressed on its own with
            LZW, a general-purpose algorithm designed in 1984 for images with
            large flat areas. It has no motion model at all. The practical
            result is that a clip which is 2MB as MP4 can be 8MB or more as
            GIF — the same pictures, four times the bytes.
          </p>
          <p>
            Duration, frame rate and width all multiply into the total, which
            is why the estimate updates as you change them and why the duration
            is capped.
          </p>
          <h2>Choosing settings</h2>
          <ul>
            <li><strong>8 fps</strong> — slow or largely static footage; smallest files</li>
            <li><strong>12 fps</strong> — the usual default; smooth enough for most motion</li>
            <li><strong>15 fps</strong> — noticeably smoother, roughly 25% larger</li>
            <li><strong>20–25 fps</strong> — only worth it for genuinely fast motion</li>
          </ul>
          <p>
            Width behaves the same way but more steeply, because the pixel
            count grows with the square. Going from 320px to 640px roughly
            quadruples the data per frame. Pick the smallest width at which the
            content is still readable.
          </p>
          <h2>When not to use a GIF</h2>
          <p>
            If the destination accepts video, use video. An MP4 of the same
            clip will be smaller, sharper, support audio, and play everywhere a
            GIF does. GIF earns its place in the specific cases where a still
            image is expected but motion is wanted — inline in documentation,
            in a README, in an email, or on a platform that treats video
            differently from images.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <VideoToGifTool />
    </ToolPageShell>
  );
}
