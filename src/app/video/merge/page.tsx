import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import MergeVideoTool from "./MergeVideoTool";

export const metadata: Metadata = toolMetadata({
  category: "video",
  slug: "merge",
  title: "Merge Videos — Join Video Clips Into One File, Free",
  description:
    "Combine several videos into one, in the order you choose. Handles clips from different cameras. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Why does merging re-encode instead of just joining the files?",
    answer:
      "Because joining without re-encoding only works when every clip shares a codec, resolution, frame rate and timebase — and clips from different cameras, or even the same phone in portrait and landscape, essentially never do. When they do not match, a straight join does not fail with an error: it produces a file whose second half is scrambled. Normalising every clip first is slower but it actually works.",
  },
  {
    question: "What happens to clips with different shapes?",
    answer:
      "They are scaled to fit the output frame and letterboxed with black bars where the shape differs. Nothing is stretched or cropped, so a portrait phone clip sitting between two landscape ones keeps its proportions rather than being squashed to fill the width.",
  },
  {
    question: "What if one of my clips has no audio?",
    answer:
      "Silence is inserted for its duration and the tool tells you it happened. Without that, the audio from the following clip would slide forward to fill the gap and everything after the silent clip would be out of sync.",
  },
  {
    question: "How long will this take?",
    answer:
      "Every clip is re-encoded, so roughly as long as compressing all of them individually — several minutes for a handful of phone clips. Choosing 720p instead of 1080p roughly halves it. Keep the tab visible, because browsers throttle background tabs and a hidden one can stall.",
  },
  {
    question: "Can I add transitions between clips?",
    answer:
      "No. Clips are joined end to end with a hard cut. Crossfades and wipes need a filter graph that overlaps and blends adjacent clips, which is a genuinely different operation and considerably heavier — that is video editor territory rather than a single-purpose tool.",
  },
  {
    question: "Are my videos uploaded anywhere?",
    answer:
      "No. Every clip is processed by FFmpeg running as WebAssembly inside your browser tab. Nothing crosses the network, which is why the work happens on your CPU and takes the time it does.",
  },
];

export default function MergeVideoPage() {
  return (
    <ToolPageShell
      category="video"
      slug="merge"
      title="Merge Videos"
      description="Join several clips into one file, in whatever order you arrange them."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Video", href: "/video" },
        { label: "Merge Videos" },
      ]}
      steps={[
        "Drop two or more videos into the box above — they stay on your device.",
        "Arrange them into the order you want and pick an output resolution.",
        "Merge, then download the combined file.",
      ]}
      articleContent={
        <>
          <h2>Why joining videos is harder than joining files</h2>
          <p>
            Concatenating two text files works because text has no structure the
            join can break. Video has a great deal of structure, and this is the
            operation where naive tools most often produce something broken rather
            than an error message.
          </p>
          <p>
            A video file declares a codec, a resolution, a frame rate, a pixel
            aspect ratio, an audio sample rate, a channel layout and a timebase.
            Joining two files byte-wise assumes all of these match. When they do
            not, players read the second clip using the first clip&apos;s
            declarations and the result is scrambled colour, wrong speed, or no
            picture at all — from a file that looked fine until someone scrubbed
            past the join.
          </p>
          <p>
            Clips almost never match. Two phones differ. One phone in portrait and
            landscape differs. A screen recording and a camera clip differ in every
            respect at once.
          </p>

          <h2>How this tool handles it</h2>
          <p>
            Every clip is <strong>normalised</strong> first: re-encoded to a common
            resolution, frame rate, pixel format, audio sample rate and channel
            count. Only then are the results joined, and because they now agree
            about everything, the join itself is a fast byte-level copy.
          </p>
          <p>
            The cost is that each clip is re-encoded once, which is what makes this
            the slowest tool here. There is no way to be both fast and correct with
            mismatched inputs, and correctness is the one that matters when the
            failure mode is a silently corrupted file.
          </p>
          <p>
            Clips whose shape differs from the output frame are scaled to fit and
            letterboxed rather than stretched. A portrait clip in a landscape
            timeline gets black bars at the sides and keeps its proportions, which
            is what every video editor does and what looks least wrong.
          </p>

          <h2>Silent clips</h2>
          <p>
            A clip with no audio track is a real problem for concatenation: the
            audio timeline simply has a hole in it, and everything after that hole
            slides forward relative to the picture.
          </p>
          <p>
            The tool detects clips without audio and inserts matching silence, then
            tells you it did. That keeps the picture and sound locked together for
            the whole output, and it means you find out about the silent clip now
            rather than after uploading the result somewhere.
          </p>

          <h2>Choosing a resolution</h2>
          <p>
            The output resolution is the frame every clip is fitted into. Picking
            one much higher than your source footage does not add detail — it
            scales a small picture up and makes a larger file for no benefit. Match
            your best source, or drop a step below it if speed matters more than
            resolution.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Joining clips from a phone that split a long recording into parts</li>
            <li>Assembling footage from several cameras into one sequence</li>
            <li>Combining screen recordings made in separate sessions</li>
            <li>Putting an intro and outro around a main clip</li>
            <li>Building a simple compilation without opening an editor</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <MergeVideoTool />
    </ToolPageShell>
  );
}
