import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import MergeAudioTool from "./MergeAudioTool";

export const metadata: Metadata = toolMetadata({
  category: "audio",
  slug: "merge",
  title: "Merge Audio Files — Join MP3 and WAV Online Free",
  description:
    "Join several audio files end to end into one track, with an optional gap between them. Runs entirely in your browser — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Can I mix formats — an MP3 and a WAV together?",
    answer:
      "Yes. Each file is decoded to raw samples before anything is joined, so the input formats do not need to match. What they end up sharing is the decoder's output rate, which is your device's audio rate rather than any of the sources'.",
  },
  {
    question: "Why is the output a WAV rather than an MP3?",
    answer:
      "Because re-encoding to MP3 would mean a fresh round of lossy compression on top of whatever your sources already carried. WAV holds exactly the samples that came out of the join. If you want an MP3, run the result through the Audio Converter — that way the encode happens once, deliberately, at a bitrate you chose.",
  },
  {
    question: "What sample rate does the merged file use?",
    answer:
      "Whatever your browser's AudioContext runs at, which is almost always 48kHz because that is what most audio hardware uses. The Web Audio API resamples during decoding and offers no way to opt out. If your sources were 44.1kHz, they are resampled on the way in. The result banner shows the actual rate.",
  },
  {
    question: "What happens if my files have different channel counts?",
    answer:
      "The output uses the highest channel count among the inputs, and a mono file placed among stereo ones has its single channel copied to both sides. Without that, the mono sections would play only from the left speaker — which is what naively reading a channel that does not exist would produce.",
  },
  {
    question: "How large can the result be?",
    answer:
      "Up to 500MB, which at 48kHz stereo is a little over 45 minutes. WAV is uncompressed, so the size grows quickly and predictably: roughly 10MB per minute of stereo audio. The tool checks the projected size before allocating anything, so an oversized batch is rejected rather than crashing the tab.",
  },
  {
    question: "Are my files uploaded anywhere?",
    answer:
      "No. Decoding and joining both happen through the Web Audio API in your browser. Nothing is transmitted.",
  },
];

export default function MergeAudioPage() {
  return (
    <ToolPageShell
      category="audio"
      slug="merge"
      title="Merge Audio"
      description="Join several tracks end to end into one file, in the order you arrange them. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Audio", href: "/audio" },
        { label: "Merge Audio" },
      ]}
      articleContent={
        <>
          <h2>Joining audio in the browser</h2>
          <p>
            Each file you add is decoded into raw floating-point samples using
            the Web Audio API — the same machinery a browser uses to play audio
            in a game or a music app. Once every input is raw samples, joining
            them is simply a matter of writing them one after another into a
            single buffer.
          </p>
          <p>
            That is why mixed input formats work. An MP3, a WAV and an M4A all
            arrive at the same representation before anything is concatenated,
            so there is no format negotiation to get wrong.
          </p>
          <h2>Why the output is uncompressed</h2>
          <p>
            The merged buffer is written out as a 16-bit PCM WAV. It would be
            easy to encode an MP3 instead, and tempting, because the file would
            be a tenth of the size — but it would also mean silently putting
            your audio through a lossy encoder you did not ask for.
          </p>
          <p>
            Sources that were already MP3 have lost detail once. Re-encoding
            them costs a second generation, and the artifacts of the two
            encoders compound rather than cancel. Handing back WAV keeps the
            join lossless with respect to what came out of the decoder, and
            leaves the choice of delivery format to you.
          </p>
          <p>
            When you do want a compressed result, the Audio Converter takes
            this WAV and encodes it once, at a bitrate and format you pick.
          </p>
          <h2>The resampling caveat</h2>
          <p>
            <code>decodeAudioData</code> always resamples to the
            AudioContext&apos;s rate, which is dictated by your audio hardware
            and is usually 48kHz. A 44.1kHz source is therefore resampled
            before this tool ever sees the samples, and there is no Web Audio
            API through which to prevent it.
          </p>
          <p>
            For speech, podcasts and general listening this is inaudible.
            For archival work where the original rate matters, it is a real
            limitation, and the result banner reports the actual output rate so
            it is never a surprise.
          </p>
          <h2>Gaps between tracks</h2>
          <p>
            The gap option inserts true digital silence between each pair of
            tracks. None is right for continuous material — a DJ mix, or a
            recording split across several files mid-sentence. A short gap of
            half a second to a second suits separate items in a sequence, such
            as chapters or individual takes, where an abrupt jump would be
            jarring.
          </p>
          <h2>Common uses</h2>
          <ul>
            <li>Reassembling a recording that was split across several files</li>
            <li>Combining voice memos into a single interview file</li>
            <li>Stitching podcast segments into one episode before final encoding</li>
            <li>Building a continuous track from separate takes</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <MergeAudioTool />
    </ToolPageShell>
  );
}
