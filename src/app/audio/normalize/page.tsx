import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import NormalizeAudioTool from "./NormalizeAudioTool";

export const metadata: Metadata = toolMetadata({
  category: "audio",
  slug: "normalize",
  title: "Normalize Audio — Match Loudness to a LUFS Target",
  description:
    "Even out audio loudness to a streaming, broadcast or peak target. Fixes tracks that are too quiet without squashing the dynamics. Runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "Which target should I choose?",
    answer:
      "If it is going on Spotify, YouTube or a podcast host, use -14 LUFS. If it is for television or radio, use -23. If you only want to fix a file that is quiet without thinking about standards, -14 is a good default for almost everything.",
  },
  {
    question: "Will this make my quiet recording sound good?",
    answer:
      "It will make it the right loudness, which is not the same thing. Normalising raises the noise floor along with the signal, so a hissy recording becomes a louder hissy recording. It fixes level, not quality.",
  },
  {
    question: "Does normalising cause clipping?",
    answer:
      "It should not. The loudness targets are applied with a true-peak ceiling of -1.5dB, which leaves headroom for the overshoot that lossy encoding introduces. That headroom is exactly why a file normalised to 0dB peak can still clip on playback.",
  },
  {
    question: "What is the difference between this and the Volume tool?",
    answer:
      "The Volume tool applies a gain you choose, by ear. This measures the file first and works out the gain needed to hit a specific published standard. Use Volume when you know you want it 3dB louder; use this when you want it to match everything else.",
  },
  {
    question: "Is my file uploaded?",
    answer:
      "No. The measurement and the re-encode both happen in a WebAssembly build of FFmpeg inside your browser tab. Nothing is sent anywhere.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="audio"
      slug="normalize"
      title="Normalize Audio"
      description="Bring a quiet recording up to a standard loudness — the same one Spotify, YouTube and broadcasters use."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Audio", href: "/audio" },
        { label: "Normalize Audio" },
      ]}
      steps={[
        "Drop in an MP3, WAV, OGG, M4A or FLAC file",
        "Pick the target your audio is for",
        "Normalise, then download the result",
      ]}
      articleContent={
        <>
          <h2>Loudness is not peak level</h2>
          <p>
            Two recordings can both peak at exactly 0dB and still sound wildly different
            in volume. Peak level measures the single loudest instant; loudness is about
            the average energy across the whole programme, weighted for how human hearing
            actually works.
          </p>
          <p>
            That measurement is expressed in LUFS — Loudness Units relative to Full
            Scale — and it is what every streaming platform now normalises to. Getting it
            right is the difference between your podcast sitting at the same volume as
            everyone else’s and your listener reaching for the dial.
          </p>
          <h2>The targets, and who uses them</h2>
          <p>
            <strong>-14 LUFS</strong> is the streaming standard: Spotify, YouTube and
            Apple Music all normalise playback to roughly this level, so delivering
            louder than it gains you nothing — the platform simply turns you back down.
          </p>
          <p>
            <strong>-23 LUFS</strong> is EBU R128, the European broadcast standard for
            television and radio. It is noticeably quieter because broadcast leaves much
            more headroom for dynamic range.
          </p>
          <p>
            <strong>-9 LUFS</strong> is club-loud, and worth being careful with: to get
            the average that high, the quiet passages have to come up hard.
          </p>
          <h2>Normalising is not compression</h2>
          <p>
            This applies a single gain across the whole file after measuring it. The
            relationship between your loud and quiet passages is unchanged — everything
            moves together. Compression, by contrast, reduces the difference between them
            and genuinely changes how the recording sounds.
          </p>
          <p>
            Peak-only mode is the exception on the list. It scales so the loudest sample
            approaches full scale and leaves the loudness alone, with a limiter to stop
            true-peak overshoot clipping on playback after lossy encoding.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <NormalizeAudioTool />
    </ToolPageShell>
  );
}
