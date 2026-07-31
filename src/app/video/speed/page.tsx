import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import VideoSpeedTool from "./VideoSpeedTool";

export const metadata: Metadata = toolMetadata({
  category: "video",
  slug: "speed",
  title: "Change Video Speed — Slow Motion & Timelapse Online, Free",
  description:
    "Speed a video up or slow it down with the audio kept in sync. Make a timelapse or slow motion clip in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Does the audio stay in sync?",
    answer:
      "Yes. Video timestamps and audio tempo are adjusted together in the same pass. Doing only the first is the classic mistake — you get a 2× video with audio still running at 1×, drifting further out of sync every second until it is unusable.",
  },
  {
    question: "Will slow motion look smooth?",
    answer:
      "Only as smooth as the source allows. Slowing footage down does not create new frames — a 30fps clip at 0.5× becomes 30fps of content stretched over twice the time, so each frame is held twice as long and fast motion looks steppy. Genuinely smooth slow motion needs footage shot at a high frame rate to begin with, typically 120 or 240fps.",
  },
  {
    question: "What happens to the audio in slow motion?",
    answer:
      "It is time-stretched with pitch preserved, so speech stays intelligible instead of dropping into a growl. At extreme settings the stretching can add a faint warble on sustained sounds. For a silent timelapse you may prefer to strip the audio entirely with the Mute Video tool first.",
  },
  {
    question: "Does a timelapse make the file smaller?",
    answer:
      "Usually yes, and often dramatically — the clip is shorter, so there is less to store. But each remaining frame differs more from the last, which makes compression less efficient per frame. A 4× timelapse typically lands well under a quarter of the original rather than exactly a quarter.",
  },
  {
    question: "Why is my file MP4 now?",
    answer:
      "Retiming requires a full re-encode, so the output goes to H.264 in MP4 — the combination that plays on essentially every device and platform. Since re-encoding is unavoidable here, landing in the most compatible format costs nothing.",
  },
  {
    question: "Is my video uploaded anywhere?",
    answer:
      "No. FFmpeg runs as WebAssembly inside your browser tab. That is why it is slower than a cloud service, and why your footage never leaves your machine.",
  },
];

export default function VideoSpeedPage() {
  return (
    <ToolPageShell
      category="video"
      slug="speed"
      title="Change Video Speed"
      description="Make a timelapse or a slow motion clip, with the audio retimed to stay in sync."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Video", href: "/video" },
        { label: "Video Speed" },
      ]}
      steps={[
        "Drop a video into the box above — it stays on your device.",
        "Pick a speed. Below 1× is slow motion, above is a timelapse.",
        "Retime, then download. Keep the tab visible while it works.",
      ]}
      articleContent={
        <>
          <h2>Retiming video is two operations, not one</h2>
          <p>
            A video file carries a picture track and a sound track, each with its
            own timestamps. Changing speed means adjusting both — and adjusting
            them in different ways, because the two media do not respond to
            retiming alike.
          </p>
          <p>
            The video side is straightforward: presentation timestamps are
            rewritten so frames are shown closer together or further apart. Nothing
            is added or removed; the same frames simply arrive at a different rate.
          </p>
          <p>
            The audio side cannot work that way. Playing samples faster raises
            pitch, which turns a 2× clip into chipmunk speech. So the audio is{" "}
            <strong>time-stretched</strong> instead — cut into overlapping windows
            that are spaced out or packed together, leaving the frequencies inside
            each window untouched. Voices stay recognisable at speed.
          </p>

          <h2>What slow motion can and cannot do</h2>
          <p>
            This is the expectation worth setting properly. Slowing a clip down
            does not invent new frames. A 30fps video at 0.5× has the same 30
            frames per second of <em>content</em> spread over twice the duration,
            so each frame is displayed twice as long.
          </p>
          <p>
            For a slow pan or a talking head, that looks fine. For anything moving
            quickly it looks stepped, because your eye can now see the gaps between
            positions that were previously blurred together by motion.
          </p>
          <p>
            Smooth slow motion has to be shot for it — at 120fps or 240fps, so that
            slowing to a quarter speed still leaves 30 or 60 frames every second.
            Software that appears to do better is generating intermediate frames
            with motion interpolation, which is a substantially heavier operation
            and produces its own distinctive artefacts around edges.
          </p>

          <h2>Timelapse from ordinary footage</h2>
          <p>
            Speeding up is the easier direction, because there is more information
            than needed rather than less. Frames are dropped and the rest are shown
            faster, which is exactly what a timelapse is.
          </p>
          <p>
            The main thing to watch is camera shake. Handheld wobble that reads as
            natural at normal speed becomes violent at 4×, because the same
            movement now happens four times as fast. Footage shot on a tripod
            speeds up far better than footage shot by hand.
          </p>
          <p>
            Audio is retimed too, but sped-up speech stops being useful well before
            4×. For a pure timelapse, consider stripping the sound with the Mute
            Video tool first.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Turning a long recording into a short timelapse</li>
            <li>Slowing a clip down to see exactly what happened</li>
            <li>Compressing a screen recording or tutorial into less time</li>
            <li>Making a video fit an exact runtime for a platform limit</li>
            <li>Reviewing sports or technique footage frame by frame</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <VideoSpeedTool />
    </ToolPageShell>
  );
}
