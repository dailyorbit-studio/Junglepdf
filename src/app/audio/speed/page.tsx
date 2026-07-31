import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import AudioSpeedTool from "./AudioSpeedTool";

export const metadata: Metadata = toolMetadata({
  category: "audio",
  slug: "speed",
  title: "Change Audio Speed — Speed Up or Slow Down MP3 Online",
  description:
    "Speed audio up or slow it down, keeping the pitch natural or shifting it. Works on MP3, WAV, OGG, M4A and FLAC. Runs in your browser — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "What's the difference between the two pitch modes?",
    answer:
      "\"Keep pitch\" stretches time while holding frequencies where they are, so a lecture at 1.5× sounds like the speaker is talking faster rather than inhaling helium. \"Change pitch\" replays the whole waveform at a different rate, so pitch rises with speed exactly as it does when you spin a record too fast. The first is what you want for spoken word, the second for effects.",
  },
  {
    question: "Does speeding up reduce the quality?",
    answer:
      "Slightly, in pitch-preserving mode. Holding pitch while changing tempo requires the audio to be cut into small windows and overlapped, and at extreme settings — beyond about 2× or below 0.5× — that can add a faint warbling or echo on sustained notes. Speech tolerates it well; solo piano is where you notice it first. Pitch-changing mode has no such artefact because it does no time-stretching at all.",
  },
  {
    question: "Why does the file come back in the same format?",
    answer:
      "Because re-encoding to something else would be a second decision you did not ask for. MP3 in gives MP3 out at 192kbps, WAV gives WAV, FLAC gives FLAC. If your format isn't one this tool can mux, the output falls back to MP3.",
  },
  {
    question: "Can I go faster than 4× or slower than 0.25×?",
    answer:
      "Not here. Beyond those bounds pitch-preserving time-stretching stops sounding like audio and starts sounding like artefacts, and there is no useful result to hand back. Running the tool twice compounds the effect if you genuinely need more.",
  },
  {
    question: "Does this keep video in sync?",
    answer:
      "This tool is audio-only — video tracks are dropped. To retime a video with its audio, use the Video Speed tool, which adjusts presentation timestamps and audio tempo together so the two stay locked.",
  },
  {
    question: "Is my audio uploaded anywhere?",
    answer:
      "No. A WebAssembly build of FFmpeg runs inside your browser tab and does the whole job locally. Nothing is transmitted.",
  },
];

export default function AudioSpeedPage() {
  return (
    <ToolPageShell
      category="audio"
      slug="speed"
      title="Change Audio Speed"
      description="Speed audio up or slow it down — keeping voices natural, or letting the pitch shift with it."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Audio", href: "/audio" },
        { label: "Audio Speed" },
      ]}
      steps={[
        "Drop an audio file into the box above — it stays on your device.",
        "Pick a speed and choose whether pitch should follow it.",
        "Retime, listen to the result, and download.",
      ]}
      articleContent={
        <>
          <h2>Two different things people mean by &ldquo;faster&rdquo;</h2>
          <p>
            Changing playback speed sounds like one operation but is really two,
            and picking the wrong one gives you a result you did not want.
          </p>
          <p>
            <strong>Keeping the pitch</strong> means the track finishes sooner
            while every voice and instrument stays at the frequency it was. This is
            what podcast apps do at 1.5×, and it is the only sensible option for
            speech — a lecture sped up the other way is unlistenable within about
            ten seconds.
          </p>
          <p>
            <strong>Changing the pitch</strong> replays the entire waveform at a
            different rate. Everything rises together, exactly as it does when a
            record player runs fast or a tape is wound on. This is the chipmunk
            effect, the nightcore effect, and the honest way to emulate analogue
            equipment.
          </p>

          <h2>How pitch-preserving time-stretching works</h2>
          <p>
            Holding pitch constant while changing duration is a genuinely hard
            problem, because in a raw waveform the two are the same thing. The
            standard approach — and the one FFmpeg&apos;s <strong>atempo</strong>{" "}
            filter uses — is to cut the audio into short overlapping windows and
            then space those windows further apart or closer together, crossfading
            between them.
          </p>
          <p>
            The frequencies inside each window are untouched, so pitch survives,
            but the seams are where the artefacts live. At moderate settings they
            are inaudible. Pushed hard, sustained tones can pick up a faint
            warbling or a doubling that sounds like a very short echo. Speech
            tolerates this unusually well because it is full of natural
            discontinuities; a solo instrument is where you hear it first.
          </p>
          <p>
            One implementation detail worth knowing: a single atempo pass only
            accepts factors between 0.5 and 2. Anything outside that is applied as
            a chain of passes, so 4× is two 2× stages. That is why the extremes
            accumulate slightly more character than the middle of the range.
          </p>

          <h2>Choosing a speed</h2>
          <ul>
            <li><strong>1.25× – 1.5×</strong> — the sweet spot for lectures and podcasts. Almost no artefacts and a real time saving.</li>
            <li><strong>1.75× – 2×</strong> — workable for familiar speakers and clear recordings. Harder with accents or poor audio.</li>
            <li><strong>0.75×</strong> — transcription, language learning, and working out a fast musical passage.</li>
            <li><strong>0.5× and below</strong> — detailed analysis, where artefacts matter less than hearing every detail.</li>
          </ul>

          <h2>Common uses</h2>
          <ul>
            <li>Getting through a recorded lecture or meeting in less time</li>
            <li>Slowing a song down to learn a part by ear</li>
            <li>Making a track fit an exact runtime for video</li>
            <li>Producing nightcore or vaporwave edits</li>
            <li>Slowing speech for transcription or language practice</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <AudioSpeedTool />
    </ToolPageShell>
  );
}
