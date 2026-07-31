import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import MuteVideoTool from "./MuteVideoTool";

export const metadata: Metadata = toolMetadata({
  category: "video",
  slug: "mute",
  title: "Remove Audio From Video — Free Online Video Muter",
  description:
    "Strip the audio track out of a video and keep the picture untouched. Lossless and near-instant. Runs in your browser — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Does this reduce video quality?",
    answer:
      "No. The video stream is copied packet for packet into a new container with the audio stream simply not included. The picture data is byte-for-byte identical to the source — there is no decode and no re-encode anywhere in the process.",
  },
  {
    question: "How much smaller will the file be?",
    answer:
      "Roughly the size of the audio track, which for most video is a small fraction of the total. A 128 kbps audio track over ten minutes is about 9MB, so muting a 500MB ten-minute video saves around 2 percent. Muting is for removing the sound, not for shrinking the file — use the Video Converter if size is the goal.",
  },
  {
    question: "Can I remove just one audio track from a file with several?",
    answer:
      "Not with this tool — it drops every audio stream. Files with multiple audio tracks, such as a movie with several language options, come out with none of them. Selecting individual streams is a more specialised job than this tool is trying to do.",
  },
  {
    question: "Can I add different audio afterwards?",
    answer:
      "Not here. A muted video is a normal video file, so any video editor will let you lay a new track over it. Muting first is often the right first step, because it guarantees the original audio is genuinely gone rather than merely turned down in an editor's timeline.",
  },
  {
    question: "Why would I mute a video rather than just turning the volume down?",
    answer:
      "Because a viewer can turn the volume back up. If the audio contains a conversation in the background, identifying information, or copyrighted music that would trigger an automated claim, the only reliable fix is for the track not to exist in the file at all.",
  },
  {
    question: "Is my video uploaded anywhere?",
    answer:
      "No. FFmpeg runs as WebAssembly inside your browser tab. Your video is written to a virtual filesystem in memory, rewritten without its audio, and read back. Nothing is transmitted.",
  },
];

export default function MuteVideoPage() {
  return (
    <ToolPageShell
      category="video"
      slug="mute"
      title="Mute Video"
      description="Drop the audio track and keep the picture exactly as it was. Lossless, and nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Video", href: "/video" },
        { label: "Mute Video" },
      ]}
      articleContent={
        <>
          <h2>Removing audio without touching the picture</h2>
          <p>
            A video file is a container holding separate streams — typically
            one video stream and one audio stream, interleaved so a player can
            read both as it goes. Removing the sound does not require
            understanding the picture at all: the container is rewritten with
            the video packets copied straight across and the audio packets left
            out.
          </p>
          <p>
            That is why this finishes in seconds even on a large file, and why
            the result is pixel-identical to the source. No frame is ever
            decoded, so no frame can be degraded.
          </p>
          <h2>Muted is not the same as quiet</h2>
          <p>
            Turning the volume to zero in a player, or laying a silent track
            over the original in an editor, leaves the audio data in the file.
            Anyone who opens it in another program can hear it.
          </p>
          <p>
            That distinction matters more often than it sounds. Screen
            recordings pick up whatever was said in the room. Phone videos
            capture background conversation that was never meant to be shared.
            Footage recorded near a speaker picks up music that will trigger an
            automated copyright claim the moment it is uploaded. In every one of
            those cases the requirement is that the audio no longer exists, not
            that it plays back silently.
          </p>
          <h2>What this does not do</h2>
          <p>
            It removes every audio stream, not a chosen one. A file carrying
            several language tracks comes out with none. It also does not
            replace the audio with anything — the output simply has no audio
            stream, which every player handles correctly.
          </p>
          <p>
            The file will not get meaningfully smaller. Audio is usually a
            small percentage of a video&apos;s total size, so expect a saving
            of a few percent at most. If the goal is a smaller file, the Video
            Converter re-encodes and can make a real difference.
          </p>
          <h2>Common uses</h2>
          <ul>
            <li>Stripping background conversation from a screen recording before sharing it</li>
            <li>Removing music that would trigger an automated copyright claim</li>
            <li>Preparing footage that will have a voiceover or new soundtrack added</li>
            <li>Making a video safe to autoplay on a web page</li>
            <li>Removing identifying speech from footage before it goes public</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <MuteVideoTool />
    </ToolPageShell>
  );
}
