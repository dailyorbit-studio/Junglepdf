import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import VideoToMp3Tool from "./VideoToMp3Tool";

export const metadata: Metadata = toolMetadata({
  category: "audio",
  slug: "video-to-mp3",
  title: "Video to MP3 Converter — Extract Audio from Video",
  description:
    "Pull the audio track out of MP4, MKV, MOV, AVI or WebM video and save it as a 192kbps MP3. Runs entirely in your browser — no upload, no sign-up, no file limit.",
});

const FAQ_ITEMS = [
  {
    question: "What video formats can I convert to MP3?",
    answer:
      "This tool supports MP4, MKV, AVI, WebM, MOV, WMV, and FLV containers. As long as the video file contains an audio track, the tool can extract it.",
  },
  {
    question: "Where does the conversion happen?",
    answer:
      "Everything runs in your browser using a WebAssembly build of FFmpeg. Your video file is never uploaded to any server. The entire extraction process uses your device's memory and processor.",
  },
  {
    question: "Why does the first conversion take longer?",
    answer:
      "On the first use, the tool downloads a ~32MB WebAssembly engine that handles the actual audio extraction. It's served from this site and cached by your browser, so subsequent conversions start almost instantly.",
  },
  {
    question: "What audio quality does the output use?",
    answer:
      "The extracted MP3 is encoded at 192kbps with a 44.1kHz sample rate, which matches CD-quality audio and is suitable for most listening purposes.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "The tool accepts video files up to 500MB. Since processing happens in your browser's memory, very large files may be slower on devices with limited RAM.",
  },
];

export default function VideoToMp3Page() {
  return (
    <ToolPageShell
      category="audio"
      slug="video-to-mp3"
      title="Video to MP3"
      description="Extract the audio track from any video file and save it as an MP3. Runs locally in your browser — nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Audio", href: "/audio" },
        { label: "Video to MP3" },
      ]}
      articleContent={
        <>
          <h2>How the video-to-MP3 extraction works</h2>
          <p>
            When you drop a video file into the tool, it loads a WebAssembly
            build of FFmpeg directly in your browser tab. FFmpeg is the same
            open-source engine used by professional video editors, media
            players, and streaming platforms to handle media conversion.
          </p>
          <p>
            The tool reads the video container format (MP4, MKV, AVI, etc.),
            locates the audio stream inside it, and re-encodes that stream as
            a standalone MP3 file at 192kbps with a 44.1kHz sample rate. The
            video frames are discarded entirely — only the sound track is
            preserved.
          </p>
          <h2>Common use cases</h2>
          <ul>
            <li>Saving the audio from a screen recording or lecture video</li>
            <li>Extracting background music from a personal video clip</li>
            <li>Creating podcast episodes from recorded video interviews</li>
            <li>Pulling voiceovers from presentation recordings</li>
          </ul>
          <h2>Privacy and performance</h2>
          <p>
            Because the conversion happens entirely within your browser&apos;s
            memory, your video file is never transmitted over the internet.
            Processing speed depends on your device — a typical 100MB video
            file converts in under 30 seconds on a modern laptop.
          </p>
          <p>
            The one thing that does travel over the network is the FFmpeg
            engine itself, a ~32MB WebAssembly binary served from this site on
            your first conversion. Your browser caches it, so later conversions
            need no network access at all. Your media never leaves your device
            at any point.
          </p>
          <p>
            There are no accounts to create, no file limits beyond the
            500MB per-file maximum, and no watermarks on your output.
            The tool works on any modern browser including Chrome, Firefox,
            Edge, and Safari.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <VideoToMp3Tool />
    </ToolPageShell>
  );
}
