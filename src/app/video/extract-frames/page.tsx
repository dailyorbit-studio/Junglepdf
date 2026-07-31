import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ExtractFramesTool from "./ExtractFramesTool";

export const metadata: Metadata = toolMetadata({
  category: "video",
  slug: "extract-frames",
  title: "Extract Frames from Video — Save Video Frames as Images",
  description:
    "Pull stills out of a video as PNG or JPG and download them as a ZIP. Choose how often to grab a frame. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Can I extract every single frame?",
    answer:
      "Only for short clips. Extraction is capped at 300 frames per run, which at 30fps is ten seconds of footage. The limit is not the decoding — it is holding 300 full-resolution images in the tab at once while the ZIP is built. Beyond that the tab runs out of memory instead of producing a download.",
  },
  {
    question: "What resolution are the extracted frames?",
    answer:
      "Exactly the video's own resolution. A 1080p clip gives 1920×1080 images. Frames are taken straight from the decoder, so nothing is scaled up or down and no detail is invented or lost through resizing.",
  },
  {
    question: "Should I choose PNG or JPG?",
    answer:
      "JPG for almost everything — the frames came from a lossily-compressed video, so their fine detail has already been through worse than JPG will do to it, and the files are a fraction of the size. Choose PNG if the frames are going into further editing where you want no additional generational loss, or if the footage is a screen recording with sharp text, where JPG artefacts around edges are visible.",
  },
  {
    question: "Why are my extracted frames blurry?",
    answer:
      "Because that is what the video contains. A frame captured during fast motion carries motion blur baked in by the camera's shutter, and video compression allocates very little data to frames that differ heavily from their neighbours. Extraction reproduces the frame faithfully — it cannot recover detail that was never recorded.",
  },
  {
    question: "How do I get one specific moment?",
    answer:
      "Trim the video to a second or two around the moment with the Video Trimmer first, then extract at 15 frames per second. That gives you every frame of the part you care about without spending the frame budget on footage you do not need.",
  },
  {
    question: "Is my video uploaded anywhere?",
    answer:
      "No. FFmpeg decodes the video as WebAssembly inside your browser, and the ZIP is assembled in the same tab. Nothing crosses the network.",
  },
];

export default function ExtractFramesPage() {
  return (
    <ToolPageShell
      category="video"
      slug="extract-frames"
      title="Extract Frames from Video"
      description="Save stills from a video as PNG or JPG images, bundled into a single ZIP."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Video", href: "/video" },
        { label: "Extract Frames" },
      ]}
      steps={[
        "Drop a video into the box above — it stays on your device.",
        "Choose how often to grab a frame, and PNG or JPG.",
        "Extract, then download the ZIP of images.",
      ]}
      articleContent={
        <>
          <h2>Getting stills out of moving footage</h2>
          <p>
            Video is a sequence of complete images, so pulling one out is a matter
            of decoding to the right moment and saving what is there. No
            reconstruction is involved and nothing is approximated — an extracted
            frame is exactly the picture the video would have displayed at that
            instant, at the video&apos;s own resolution.
          </p>
          <p>
            The interval control decides how many you get. One frame per second
            turns a two-minute clip into a 120-image contact sheet. Fifteen per
            second gets you close to every frame, which is what you want when the
            moment you are after lasts a fraction of a second.
          </p>

          <h2>Why there is a frame limit</h2>
          <p>
            Extraction stops at 300 images per run. The constraint is not decoding
            speed — FFmpeg will happily decode thousands — it is memory.
          </p>
          <p>
            Every extracted frame has to be held in the browser tab as a complete
            image while the ZIP is assembled. Three hundred 1080p PNGs is well over
            a gigabyte of live allocation, and browsers do not fail gracefully when
            a tab exceeds what it can hold: they discard it, taking your work with
            it. Stopping at a number that reliably completes is better than
            attempting more and losing everything.
          </p>
          <p>
            To cover a long video, use a longer interval. To capture a specific
            moment in fine detail, trim the clip first and then extract densely
            from the short result.
          </p>

          <h2>Why extracted frames sometimes look soft</h2>
          <p>
            This surprises people who expect a still from a 4K video to look like a
            4K photograph. It generally will not, for two reasons that are both
            properties of the source rather than of the extraction.
          </p>
          <p>
            First, <strong>motion blur</strong>. A video camera&apos;s shutter is
            open for a large fraction of each frame interval, so anything moving is
            smeared within the frame itself. That blur is recorded, not added
            later, and no amount of careful extraction removes it.
          </p>
          <p>
            Second, <strong>compression</strong>. Video codecs spend most of their
            data on frames that resemble their neighbours and very little on frames
            during rapid change. A still grabbed from a fast pan was encoded with a
            small fraction of the information a static shot would have received.
          </p>
          <p>
            The practical consequence: still frames from static or slow-moving
            footage look excellent, and frames from fast action look like what they
            are.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Grabbing a thumbnail or cover image from a video</li>
            <li>Finding the exact frame where something happened</li>
            <li>Building a contact sheet to see a long recording at a glance</li>
            <li>Pulling reference stills for illustration or analysis</li>
            <li>Extracting frames from a screen recording for documentation</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ExtractFramesTool />
    </ToolPageShell>
  );
}
