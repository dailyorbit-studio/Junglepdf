import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import VideoConverterTool from "./VideoConverterTool";

export const metadata: Metadata = toolMetadata({
  category: "video",
  slug: "converter",
  title: "Video Converter — MP4, WebM and MKV in Your Browser",
  description:
    "Convert video between MP4, WebM and MKV with a quality setting you choose. Runs entirely in your browser using FFmpeg — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Why does this take so long?",
    answer:
      "Because it is a genuine re-encode. Every frame has to be decoded, then compressed again by the target codec — and FFmpeg compiled to WebAssembly runs roughly an order of magnitude slower than the native build. A few minutes of footage can take several minutes to convert. That is the real cost of not sending your file to a server, and the tool states it up front rather than after you have committed.",
  },
  {
    question: "Do I need to convert at all?",
    answer:
      "Often not. If you want a shorter clip, the Video Trimmer copies the stream without re-encoding and finishes in seconds. If you want the audio gone, the Video Muter does the same. Converting is only necessary when the container or codec itself has to change — because a player or upload target refuses the current one.",
  },
  {
    question: "What does the quality setting actually control?",
    answer:
      "It sets the encoder's Constant Rate Factor. Rather than targeting a fixed bitrate, CRF targets a consistent visual quality and lets the bitrate move — spending more data on complex scenes and less on simple ones. Lower numbers mean higher quality and larger files. High is near-transparent, Balanced is the usual choice, and Small trades visible softening on detailed footage for a much smaller result.",
  },
  {
    question: "Which format should I choose?",
    answer:
      "MP4 unless you have a specific reason otherwise — H.264 in an MP4 container plays on effectively everything made this century, and it is what upload forms expect. WebM is open and royalty-free and suits self-hosted web video, but encodes noticeably slower here. MKV is a flexible container that handles almost any combination of streams, and is rejected by most web players and upload forms.",
  },
  {
    question: "Will converting make my file smaller?",
    answer:
      "Usually, if you pick a lower quality setting than the original was encoded at. But it is not guaranteed — re-encoding an already heavily-compressed file at a high quality setting can produce something larger, because the encoder faithfully preserves compression artifacts it mistakes for detail. If size is the goal, start with the Small preset.",
  },
  {
    question: "Is my video uploaded anywhere?",
    answer:
      "No. FFmpeg runs as WebAssembly inside your browser tab, and the engine is served from this site rather than a CDN. Your video is written to a virtual filesystem in memory, encoded, and read back. Nothing is transmitted.",
  },
];

export default function VideoConverterPage() {
  return (
    <ToolPageShell
      category="video"
      slug="converter"
      title="Video Converter"
      description="Convert between MP4, WebM and MKV with the quality under your control. This one genuinely re-encodes, so it takes minutes rather than seconds. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Video", href: "/video" },
        { label: "Video Converter" },
      ]}
      articleContent={
        <>
          <h2>The slow tool, and why</h2>
          <p>
            Every other video tool here is a stream copy: packets move from one
            container to another without ever being decoded. That is why
            trimming and muting finish in seconds regardless of file size.
          </p>
          <p>
            Converting cannot work that way. Changing the codec means decoding
            every frame back to pixels and compressing them again with a
            different algorithm. Video encoding is one of the most
            computationally demanding things a consumer device does, and
            running it as WebAssembly in a browser tab costs roughly ten times
            what the native binary would.
          </p>
          <p>
            The honest summary: this works, it produces a correct file, and it
            is slow. Before starting one, it is worth checking whether the
            Trimmer or the Muter already does what you need.
          </p>
          <h2>Containers and codecs</h2>
          <p>
            These are two different things, and confusing them is the source of
            most format frustration. A <strong>codec</strong> — H.264, VP8, AV1
            — is the compression algorithm applied to the picture. A{" "}
            <strong>container</strong> — MP4, WebM, MKV — is the file format
            that wraps the compressed streams together with timing information.
          </p>
          <p>
            The same H.264 video can sit inside an MP4 or an MKV. A player that
            refuses your file may be rejecting the container, the codec, or
            both, which is why &quot;convert to MP4&quot; sometimes fixes a
            problem and sometimes does not.
          </p>
          <ul>
            <li><strong>MP4</strong> — H.264 video, AAC audio. The universal default.</li>
            <li><strong>WebM</strong> — VP8 video, Vorbis audio. Open, royalty-free, slower to encode.</li>
            <li><strong>MKV</strong> — H.264 in Matroska. Extremely flexible, poorly supported on the web.</li>
          </ul>
          <h2>How CRF works</h2>
          <p>
            Constant Rate Factor asks the encoder for consistent perceived
            quality rather than a fixed data rate. A static shot of a wall gets
            very few bits because it needs very few; a fast pan through foliage
            gets many more. The result is that quality stays even across the
            video instead of collapsing whenever the scene gets complicated —
            which is exactly what a fixed bitrate does.
          </p>
          <p>
            The scale runs roughly 0 to 51, where lower is better. Around 20 is
            visually indistinguishable from the source for most material.
            Around 26 is a sensible default. Past about 32 the softening
            becomes obvious on anything detailed.
          </p>
          <h2>Generation loss</h2>
          <p>
            Every re-encode discards information permanently. Converting an
            already-compressed video means the new encoder is working from
            footage that has already had detail removed — and it cannot tell
            the difference between real detail and the artifacts of the
            previous encode, so it faithfully preserves both.
          </p>
          <p>
            Convert once, from the best source you have. Chaining conversions
            compounds the damage in a way that is very visible after two or
            three passes.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <VideoConverterTool />
    </ToolPageShell>
  );
}
