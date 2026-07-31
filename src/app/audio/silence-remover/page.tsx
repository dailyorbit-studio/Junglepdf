import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import SilenceRemoverTool from "./SilenceRemoverTool";

export const metadata: Metadata = toolMetadata({
  category: "audio",
  slug: "silence-remover",
  title: "Remove Silence from Audio — Cut Gaps and Dead Air",
  description:
    "Automatically cut silent gaps out of a recording, or just trim the dead air at the start and end. Set the threshold and minimum length. No uploads.",
});

const FAQ_ITEMS = [
  {
    question: "It cut into my words. What should I change?",
    answer:
      "Lower the threshold — try -45dB or -50dB. A threshold that is too high is treating the quiet tail of your speech as silence. You can also raise the minimum length so only genuinely long gaps qualify.",
  },
  {
    question: "Nothing was removed. Why?",
    answer:
      "Almost always because the threshold is below your actual noise floor, so no part of the file ever counts as silent. Raise it towards -30dB and try again. Recordings from laptop microphones or noisy rooms need a much higher threshold than studio ones.",
  },
  {
    question: "Does this re-encode my audio?",
    answer:
      "Yes — the file has to be decoded to find the silence and re-encoded afterwards. The output keeps the format you put in, at a sensible bitrate. A WAV in gives a WAV out with no generational loss at all.",
  },
  {
    question: "Will this work on music?",
    answer:
      "For trimming the silence at each end, yes, and that is a common use. Removing silence everywhere in a music track is usually a mistake — the rests are part of the piece, and cutting them produces something that no longer keeps time.",
  },
  {
    question: "Is my audio uploaded anywhere?",
    answer:
      "No. Detection and re-encoding both happen in a WebAssembly build of FFmpeg running in your browser. The file never leaves your device.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="audio"
      slug="silence-remover"
      title="Silence Remover"
      description="Cut the dead air out of a recording — everywhere, or just at the two ends."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Audio", href: "/audio" },
        { label: "Silence Remover" },
      ]}
      steps={[
        "Drop in an MP3, WAV, OGG, M4A or FLAC file",
        "Choose whether to trim everywhere or only the ends",
        "Set the threshold and minimum gap length, then run it",
      ]}
      articleContent={
        <>
          <h2>Two numbers decide everything</h2>
          <p>
            Silence detection is not a single setting. The <strong>threshold</strong>
            decides what counts as quiet, and the <strong>minimum length</strong> decides
            how long that quiet has to last before it is worth removing. Get either wrong
            and the result is obvious.
          </p>
          <p>
            A threshold that is too high treats quiet speech as silence and clips the
            ends of words. Too low and nothing is detected at all, because the room tone
            in your recording never actually reaches it. A minimum length that is too
            short removes the natural pauses between sentences and produces the
            breathless, machine-gun delivery that makes over-edited podcasts unpleasant.
          </p>
          <h2>Sensible starting points</h2>
          <p>
            On a decent recording in a quiet room, the noise floor sits somewhere around
            -50dB, and -35dB is a safe threshold — comfortably above the room and well
            below speech. A noisy environment, a laptop microphone or an air conditioner
            pushes that floor up towards -30dB, and the threshold has to follow.
          </p>
          <p>
            Half a second is a good minimum. It removes the long thinking pauses and the
            gaps where someone was setting up the next question, while leaving the
            quarter-second beats that make speech sound like speech.
          </p>
          <h2>Trimming just the ends</h2>
          <p>
            The other mode leaves the middle of the recording completely alone and only
            removes leading and trailing silence. This is what you want for a music
            track, a voice memo, or anything where the internal pauses are the
            performance rather than an accident.
          </p>
          <p>
            It works by trimming the start, reversing the audio, trimming the new start,
            and reversing back. That reversal buffers the whole file, which is why the
            edges-only mode is the slower of the two on a long recording.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <SilenceRemoverTool />
    </ToolPageShell>
  );
}
