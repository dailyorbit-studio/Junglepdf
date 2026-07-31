import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import AudioConverterTool from "./AudioConverterTool";

export const metadata: Metadata = toolMetadata({
  category: "audio",
  slug: "converter",
  title: "Audio Converter — MP3, WAV, OGG, M4A and FLAC",
  description:
    "Convert audio between MP3, WAV, OGG, M4A and FLAC with a bitrate you choose. Runs entirely in your browser using FFmpeg — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Which format should I choose?",
    answer:
      "MP3 if you do not control where the file is going — nothing refuses it. M4A (AAC) if the destination is an Apple device or a modern player; it sounds better than MP3 at the same bitrate. OGG for the same reason on non-Apple platforms. FLAC when you want an exact copy of the audio at roughly half the size of WAV. WAV when something downstream demands uncompressed PCM.",
  },
  {
    question: "What bitrate do I need?",
    answer:
      "192 kbps is transparent enough for most listeners on most material and is a reasonable default. 128 kbps is fine for speech and podcasts, where the extra data buys almost nothing. 320 kbps is the practical ceiling for MP3 — beyond it the format itself is the limit, not the bitrate. Bitrate does not apply to WAV or FLAC, which store the audio exactly.",
  },
  {
    question: "Does converting between lossy formats lose quality?",
    answer:
      "Yes, and it compounds. MP3 to M4A means decoding audio that has already had detail removed and then removing more, guided by a different psychoacoustic model that does not know what the first encoder discarded. Convert from the highest quality source you have rather than chaining conversions, and if you are keeping an archive, keep it lossless.",
  },
  {
    question: "Why is this different from the Audio Cutter's WAV output?",
    answer:
      "The cutter decodes through the Web Audio API, which resamples everything to your audio device's rate — usually 48kHz — before the tool ever sees it. This converter hands the original bytes to FFmpeg, which has no such constraint, so a 44.1kHz source stays 44.1kHz. If you want to trim without resampling, trim elsewhere and convert here.",
  },
  {
    question: "Why does the first conversion take longer?",
    answer:
      "The first run downloads a 32MB WebAssembly build of FFmpeg. That happens once per visit and is then cached by your browser, so subsequent conversions start immediately. It is the price of doing real audio encoding without a server.",
  },
  {
    question: "Is my audio uploaded anywhere?",
    answer:
      "No. FFmpeg runs as WebAssembly inside your browser tab, and the engine itself is served from this site rather than a third-party CDN. Your file is written to a virtual filesystem in memory, converted, and read back out. Nothing is transmitted.",
  },
];

export default function AudioConverterPage() {
  return (
    <ToolPageShell
      category="audio"
      slug="converter"
      title="Audio Converter"
      description="Convert between MP3, WAV, OGG, M4A and FLAC, with the bitrate under your control. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Audio", href: "/audio" },
        { label: "Audio Converter" },
      ]}
      articleContent={
        <>
          <h2>Audio conversion without a server</h2>
          <p>
            This tool runs FFmpeg — the same engine behind most professional
            media software — compiled to WebAssembly and executed inside your
            browser tab. Your file is written into a virtual filesystem in
            memory, decoded, re-encoded, and read back out. At no point does it
            travel over the network.
          </p>
          <p>
            That is a meaningful difference for audio in particular. Voice
            recordings, interview tapes, and unreleased music are exactly the
            kind of material people are least comfortable handing to an unknown
            server, and exactly the kind that most online converters require
            you to upload.
          </p>
          <h2>Lossy and lossless, and why it matters</h2>
          <p>
            MP3, AAC (M4A) and Vorbis (OGG) are <strong>lossy</strong>. They
            achieve their size by discarding audio a psychoacoustic model
            predicts you will not notice. The discarded information is gone
            permanently — decoding an MP3 does not recover it.
          </p>
          <p>
            WAV and FLAC are <strong>lossless</strong>. WAV stores raw PCM
            samples with no compression at all; FLAC compresses those same
            samples the way a ZIP file compresses text, typically to around
            half the size, and decodes back to bit-identical audio.
          </p>
          <p>
            The practical rule: keep your archive lossless and convert to lossy
            for delivery. Going the other way — converting an MP3 to FLAC —
            produces a large file containing exactly the same degraded audio,
            because a lossless format cannot restore what a lossy one removed.
          </p>
          <h2>Generation loss</h2>
          <p>
            Every lossy re-encode is a fresh round of discarding. Worse, each
            encoder uses a different model, so the second one does not know
            what the first threw away and cannot avoid compounding the damage.
            The audible result is a hollowness in cymbals and sibilance that
            gets worse with each pass.
          </p>
          <p>
            If a file has to end up in a specific lossy format, convert to it
            once, directly from the best source available.
          </p>
          <h2>Choosing a bitrate</h2>
          <ul>
            <li><strong>96 kbps</strong> — acceptable for speech only; music audibly suffers</li>
            <li><strong>128 kbps</strong> — the long-standing default for podcasts and spoken word</li>
            <li><strong>192 kbps</strong> — transparent for most listeners on most music</li>
            <li><strong>256 kbps</strong> — comfortable headroom for detailed or dynamic material</li>
            <li><strong>320 kbps</strong> — the ceiling for MP3; beyond this the format limits you, not the bitrate</li>
          </ul>
          <p>
            AAC and Vorbis both perform better than MP3 at any given bitrate,
            so a 128 kbps M4A generally beats a 128 kbps MP3. If the
            destination supports them, you can drop a step and keep the same
            perceived quality.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <AudioConverterTool />
    </ToolPageShell>
  );
}
