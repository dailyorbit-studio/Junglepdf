import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import VideoTrimmerTool from "./VideoTrimmerTool";

export const metadata: Metadata = toolMetadata({
  category: "video",
  slug: "trimmer",
  title: "Trim Video Online — Cut a Clip Without Re-encoding",
  description:
    "Cut a section out of a video by start and end time. Copies the stream instead of re-encoding, so it is fast and lossless. No uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Why is trimming so much faster than converting?",
    answer:
      "Because nothing is decoded. Trimming copies the already-compressed video packets from one container into another, dropping the ones outside your range. Converting has to decode every frame and encode it again, which in WebAssembly is roughly an order of magnitude slower than native. A trim that takes three seconds could take three minutes as a re-encode.",
  },
  {
    question: "Why does my clip start slightly earlier than where I set the handle?",
    answer:
      "Video compression stores most frames as differences from a previous frame. Only keyframes are complete pictures, and they appear every few seconds. A stream copy can only begin at a keyframe, because starting anywhere else would leave the decoder without a reference for the first frames. The tool seeks to the nearest keyframe at or before your start point, so the clip may include up to a second or two of extra footage at the front. Getting a frame-exact cut requires re-encoding.",
  },
  {
    question: "Does trimming reduce quality?",
    answer:
      "No. The video and audio data inside the clip are byte-for-byte the same as in the source. There is no decode and no re-encode, so there is no generation loss of any kind.",
  },
  {
    question: "What formats can I trim?",
    answer:
      "MP4, MKV, WebM, MOV, AVI and others. The output keeps the input's container and codecs. A small number of exotic combinations cannot be copied into their own container without re-encoding — when that happens the tool says so and suggests converting to MP4 first.",
  },
  {
    question: "How large a file can I trim?",
    answer:
      "Up to 2GB. That said, the file has to fit in your browser tab's memory alongside the WebAssembly heap, so very large files on a device with limited RAM may fail. Desktop browsers handle multi-gigabyte files far better than phones do.",
  },
  {
    question: "Is my video uploaded anywhere?",
    answer:
      "No. FFmpeg runs as WebAssembly inside your browser tab, and the engine is served from this site rather than a CDN. Your video is written to a virtual filesystem in memory, trimmed, and read back. Nothing is transmitted — which for video, where files are large and often personal, is the difference between a few seconds and a long upload to someone else's server.",
  },
];

export default function VideoTrimmerPage() {
  return (
    <ToolPageShell
      category="video"
      slug="trimmer"
      title="Video Trimmer"
      description="Cut a clip out of a video by dragging the start and end handles. No re-encoding, so it is fast and lossless. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Video", href: "/video" },
        { label: "Video Trimmer" },
      ]}
      articleContent={
        <>
          <h2>Trimming by stream copy</h2>
          <p>
            There are two ways to shorten a video. You can decode every frame,
            throw away the ones outside your range, and encode what is left —
            slow, and lossy. Or you can copy the compressed packets straight
            across and simply not copy the ones you do not want.
          </p>
          <p>
            This tool does the second. Nothing is decoded, nothing is
            re-encoded, and the bytes inside your clip are identical to the
            bytes in the source. On a large file that is the difference between
            waiting seconds and waiting many minutes.
          </p>
          <h2>Keyframes, and why the cut is approximate</h2>
          <p>
            Video codecs do not store every frame in full. A keyframe is a
            complete picture; the frames after it are stored as differences
            from what came before, which is what makes video compression work
            at all. Keyframes typically appear every two to ten seconds.
          </p>
          <p>
            A stream copy has to begin at a keyframe. Starting mid-sequence
            would hand the decoder a set of differences with nothing to apply
            them to, producing a burst of visual garbage until the next
            keyframe arrived. So the cut point moves back to the nearest
            keyframe at or before where you put the handle.
          </p>
          <p>
            In practice this means your clip may include a little extra footage
            at the start. If you need the cut on an exact frame, the only route
            is a re-encode — which costs both time and a generation of quality,
            and is why this tool does not do it by default.
          </p>
          <h2>Choosing your range</h2>
          <p>
            The preview seeks as you drag either handle, so you can see the
            frame you are cutting at rather than reasoning about timestamps.
            Because the start may drift back to a keyframe, it is worth
            leaving a little slack rather than trying to land precisely on the
            first frame you want.
          </p>
          <h2>Common uses</h2>
          <ul>
            <li>Pulling a short clip out of a long recording to share</li>
            <li>Cutting dead air off the start and end of a screen recording</li>
            <li>Extracting one moment from a phone video without an editing app</li>
            <li>Shortening a file to get it under a messaging or upload size limit</li>
          </ul>
          <h2>Why doing this locally matters</h2>
          <p>
            Video files are large and frequently personal. Uploading a 500MB
            recording to an online trimmer means a long wait, a copy of your
            footage on infrastructure you do not control, and a service that
            has every incentive to keep it. Doing the work in the browser
            removes all three problems at once.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <VideoTrimmerTool />
    </ToolPageShell>
  );
}
