import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ReverseAudioTool from "./ReverseAudioTool";

export const metadata: Metadata = toolMetadata({
  category: "audio",
  slug: "reverse",
  title: "Reverse Audio — Play Any Song or Sound Backwards, Free",
  description:
    "Reverse an MP3, WAV, OGG, or M4A file and download the result. Runs entirely in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Why is the output a WAV and not an MP3?",
    answer:
      "Because reversing works on decoded samples, and re-encoding them to MP3 would add a second round of lossy compression on top of whatever the source already had. WAV keeps exactly what came out of the reverse. If you need a smaller file, run the result through the Audio Converter afterwards — that way you choose when the quality loss happens.",
  },
  {
    question: "The output file is much bigger than my MP3. Is that normal?",
    answer:
      "Yes. WAV stores every sample uncompressed, so a three-minute stereo track is around 30MB regardless of how small the MP3 was. MP3 achieves its size by throwing information away permanently. The size difference is the compression, not a fault.",
  },
  {
    question: "What is the sample rate warning about?",
    answer:
      "Browsers decode audio at the output device's rate, usually 48,000 Hz, so a 44,100 Hz source is resampled on the way in. The reverse itself is exact — every sample is flipped — but the samples being flipped may have been resampled first. The Web Audio API provides no way to decode at the source's native rate, which is why the tool reports the rate it actually got.",
  },
  {
    question: "Is there a length limit?",
    answer:
      "The output is capped at 500MB, which works out to roughly 45 minutes of stereo audio. Beyond that the browser tab usually runs out of memory before the encoder finishes, so the tool stops with a clear message rather than crashing halfway through.",
  },
  {
    question: "Is my audio uploaded anywhere?",
    answer:
      "No. The file is decoded by the Web Audio API inside your browser, the samples are reversed in memory, and a WAV is written back out as a download. Nothing crosses the network.",
  },
];

export default function ReverseAudioPage() {
  return (
    <ToolPageShell
      category="audio"
      slug="reverse"
      title="Reverse Audio"
      description="Play any audio file backwards and download the result as a lossless WAV."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Audio", href: "/audio" },
        { label: "Reverse Audio" },
      ]}
      steps={[
        "Drop an audio file into the box above — it stays on your device.",
        "Reverse it, then play the result to check.",
        "Download the reversed WAV.",
      ]}
      articleContent={
        <>
          <h2>What reversing audio actually involves</h2>
          <p>
            Digital audio is a long list of numbers — amplitude measurements taken
            tens of thousands of times a second. Reversing a track means reading
            that list back to front, which is conceptually the simplest operation
            in this entire toolkit and, done on decoded samples, completely
            lossless.
          </p>
          <p>
            The file is decoded into raw sample data, each channel is flipped
            independently so stereo imaging survives intact, and the result is
            written out as a WAV. Nothing is approximated, and reversing a track
            twice returns you to something bit-identical to the decode you started
            from.
          </p>

          <h2>Why the output is a WAV</h2>
          <p>
            This is a deliberate choice rather than a limitation. MP3, AAC and OGG
            are lossy: they achieve their size by discarding audio information
            permanently, and every re-encode discards more. Handing back an MP3
            here would mean your reversed track had been through two rounds of that
            rather than one.
          </p>
          <p>
            WAV stores the samples exactly as they came out of the reverse. The
            cost is size — roughly 10MB per minute of stereo audio, so expect a
            three-minute song to land near 30MB. If you want a compressed file, run
            the WAV through the Audio Converter afterwards, which puts the decision
            about when to lose quality in your hands rather than making it silently.
          </p>

          <h2>The resampling caveat</h2>
          <p>
            The Web Audio API decodes at the audio context&apos;s sample rate, which
            follows your output device and is usually 48,000 Hz. A 44,100 Hz source —
            which is to say, essentially every CD-derived track and most MP3s — is
            therefore resampled during decoding, before the reverse ever sees it.
          </p>
          <p>
            There is no way around this in the browser: the API offers no option to
            decode at the file&apos;s native rate. In practice a single high-quality
            resample is inaudible, but it is a real transformation and the tool
            reports the rate it actually got rather than pretending otherwise.
          </p>
          <p>
            The FFmpeg-based Audio Converter does not have this limitation, because
            it decodes and encodes without ever handing samples to an audio context.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Checking a track for backmasking — hidden audio meant to be heard in reverse</li>
            <li>Building reversed cymbals and risers for music production</li>
            <li>Making a reverse-reverb swell by reversing, adding reverb, and reversing back</li>
            <li>Creating sound effects for video and games</li>
            <li>Puzzle and escape-room audio clues</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ReverseAudioTool />
    </ToolPageShell>
  );
}
