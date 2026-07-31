import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import AudioCutterTool from "./AudioCutterTool";

export const metadata: Metadata = toolMetadata({
  category: "audio",
  slug: "audio-cutter",
  title: "Audio Cutter — Trim Audio Files Online",
  description:
    "Trim any audio file to a custom time range. Pick start and end points, then download the trimmed section. Runs 100% in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "What audio formats can I trim?",
    answer:
      "The tool accepts MP3, WAV, OGG, M4A, FLAC, and AAC files. The output is always saved as WAV to avoid a second round of lossy encoding.",
  },
  {
    question: "Why is the output a WAV file?",
    answer:
      "WAV is uncompressed, so trimming adds no further quality loss on top of whatever the source already had. The trade-off is size: WAV runs roughly 10MB per minute of stereo audio. You can convert the result to MP3 with another tool if you need something smaller.",
  },
  {
    question: "Is there a maximum audio length?",
    answer:
      "Input files can be up to 200MB. The bigger constraint is the output: because WAV is uncompressed, the tool caps a single trim at 500MB, which is roughly 50 minutes of stereo audio. The selected size is shown before you commit.",
  },
  {
    question: "Will the sample rate match my original file?",
    answer:
      "Not always. Browsers decode audio at the sample rate of your output device — usually 48kHz — so a 44.1kHz MP3 may be resampled during decoding. The tool shows the actual decoded rate, and the trimmed WAV uses that same rate.",
  },
  {
    question: "Can I preview the trimmed section before downloading?",
    answer:
      "Not yet. The tool shows the selected time range and estimated output size, but does not play a preview. Waveform visualization and in-browser playback are planned.",
  },
];

export default function AudioCutterPage() {
  return (
    <ToolPageShell
      category="audio"
      slug="audio-cutter"
      title="Audio Cutter"
      description="Trim any audio file by setting custom start and end points. The trimmed clip downloads as a WAV file."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Audio", href: "/audio" },
        { label: "Audio Cutter" },
      ]}
      articleContent={
        <>
          <h2>How the audio cutter works</h2>
          <p>
            This tool uses the Web Audio API built into your browser to decode
            audio files into raw sample data. Once decoded, you can select a
            precise time range using the start and end controls. The tool then
            slices the raw audio buffer at the sample level and encodes the
            result as a WAV file.
          </p>
          <p>
            Working at the sample level means the cut itself is frame-accurate
            — the boundary lands exactly where you put it, not on the nearest
            frame or block boundary.
          </p>
          <h2>A note on sample rates</h2>
          <p>
            Browsers decode audio through an AudioContext, which runs at your
            output device&apos;s sample rate — commonly 48kHz. If your source
            file uses a different rate, such as a 44.1kHz MP3, it is resampled
            during decoding, before the tool ever sees it. This is a
            limitation of the Web Audio API rather than a choice we make.
          </p>
          <p>
            In practice the difference is inaudible, but it does mean the
            output isn&apos;t a bit-exact copy of the source samples. The tool
            displays the decoded sample rate alongside the file details, and
            the WAV it produces uses that same rate.
          </p>
          <h2>Supported formats</h2>
          <p>
            The Web Audio API can decode most common audio formats including
            MP3, WAV, OGG, FLAC, AAC, and M4A. The exact format support
            depends on your browser — Chrome and Firefox handle the widest
            range, while Safari may have limited OGG support.
          </p>
          <h2>Why the output is WAV</h2>
          <p>
            Re-encoding to MP3 would mean a second generation of lossy
            compression on audio that has already been compressed once. WAV
            avoids that. The cost is file size: uncompressed stereo audio runs
            about 10MB per minute, so the tool shows the estimated output size
            before you trim and caps a single operation at 500MB.
          </p>
          <p>
            Everything runs in your browser. Your audio file is decoded in
            memory, processed, and the result is generated locally. No data is
            sent to any server at any point.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <AudioCutterTool />
    </ToolPageShell>
  );
}
