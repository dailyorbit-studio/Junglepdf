import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import CompressVideoTool from "./CompressVideoTool";

export const metadata: Metadata = toolMetadata({
  category: "video",
  slug: "compress",
  title: "Compress Video — Reduce Video File Size Online, Free",
  description:
    "Shrink MP4, MOV, MKV and WebM videos with a quality setting you control. Runs entirely in your browser — your video is never uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How much smaller will my video get?",
    answer:
      "It depends almost entirely on what the source was. A phone recording or a screen capture typically drops by 60–80% at the Balanced setting, because those are encoded generously to keep the recorder fast. A video already compressed for the web may barely shrink, and can even grow — it has already had this done to it once.",
  },
  {
    question: "Why is it so slow?",
    answer:
      "Because it is a full re-encode, and WebAssembly runs roughly ten times slower than native FFmpeg. There is no shortcut: making a video smaller means decoding every frame and encoding it again, and the browser sandbox cannot reach the hardware encoder your operating system would use. A one-minute clip usually takes a couple of minutes.",
  },
  {
    question: "What is CRF, and why not just set a target size?",
    answer:
      "CRF — Constant Rate Factor — holds picture quality steady and lets the bitrate rise and fall with how hard each scene is to encode. That is why a static screen recording collapses to almost nothing while handheld footage barely moves. A target-size mode would have to guess a bitrate and then either waste it on the easy video or starve the hard one, so quality is the better knob to give you.",
  },
  {
    question: "Why did my file come back as MP4 when I gave it a MOV?",
    answer:
      "MP4 with H.264 video and AAC audio is the one combination that plays essentially everywhere — every phone, every browser, every messaging app, every editor. Since the video is being re-encoded anyway, ending up in the most compatible container costs nothing and avoids handing you a file some destination will refuse.",
  },
  {
    question: "Will the video lose quality?",
    answer:
      "Yes — that is the mechanism, not a side effect. Compression works by discarding detail the eye is least likely to miss, and it cannot be undone. Keep your original: re-compressing an already-compressed file each time you share it produces visible degradation surprisingly quickly.",
  },
  {
    question: "Is my video uploaded to a server?",
    answer:
      "No. A WebAssembly build of FFmpeg runs inside your browser tab, which is exactly why this is slower than a cloud service — you get your own CPU rather than a datacentre's, and in exchange the file never leaves your machine.",
  },
];

export default function CompressVideoPage() {
  return (
    <ToolPageShell
      category="video"
      slug="compress"
      title="Compress Video"
      description="Make a video smaller with a quality setting you control, without uploading it anywhere."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Video", href: "/video" },
        { label: "Compress Video" },
      ]}
      steps={[
        "Drop a video into the box above — it stays on your device.",
        "Pick a quality level. Balanced suits most footage.",
        "Compress, then download. Keep the tab visible while it works.",
      ]}
      articleContent={
        <>
          <h2>Why videos are so large, and what compression does</h2>
          <p>
            A minute of 1080p footage from a phone is commonly 100MB or more.
            Cameras encode generously on purpose — the recorder has to keep up in
            real time on a battery, so it spends bitrate rather than CPU cycles.
            Re-encoding afterwards, with no real-time constraint, is where the
            savings are.
          </p>
          <p>
            Compression works by discarding information: fine detail in areas the
            eye tends not to scrutinise, and differences between frames that are
            nearly identical. Done well it is close to invisible. Done hard it
            shows up as blockiness in shadows and smearing on fast motion.
          </p>

          <h2>Why the setting is quality, not size</h2>
          <p>
            The control here is <strong>CRF</strong>, the same knob professional
            encoders expose. It holds picture quality constant and lets the bitrate
            vary with how demanding each scene is.
          </p>
          <p>
            This matters because footage varies enormously. A screen recording of a
            mostly-static document has almost nothing changing between frames and
            compresses to a fraction of its size. Handheld footage of moving leaves
            has detail changing in every pixel of every frame and compresses barely
            at all. A target-size mode would have to pick one bitrate and apply it
            to both, wasting it on the first and starving the second.
          </p>
          <ul>
            <li><strong>High</strong> — near-transparent quality. Modest savings, safe for footage you will edit later.</li>
            <li><strong>Balanced</strong> — the usual choice. Large savings, differences you have to look for.</li>
            <li><strong>Small</strong> — visible softening on detailed footage. For when a hard size limit has to be met.</li>
          </ul>

          <h2>Being honest about the speed</h2>
          <p>
            This is genuinely slow, and it is worth saying why rather than hiding
            it. Compressing means decoding every frame and encoding it again.
            Native FFmpeg does that fast partly by using your CPU&apos;s vector
            instructions and often a dedicated hardware encoder. A WebAssembly
            build inside a browser tab can reach neither, and runs roughly an order
            of magnitude slower as a result.
          </p>
          <p>
            The trade is straightforward: a cloud service is much faster because it
            is a rack of servers, and the price is that your video is on those
            servers. Here you pay in time and keep the file.
          </p>
          <p>
            One practical note: keep the tab visible. Browsers throttle background
            tabs aggressively, and a hidden tab can slow to a crawl or stall.
          </p>

          <h2>When compression will not help</h2>
          <p>
            If a video has already been through this — downloaded from a streaming
            site, exported for the web, received through a messaging app — most of
            the redundancy is already gone. Re-encoding then costs quality without
            buying much size, and can even produce a larger file if the quality
            setting targets a higher bitrate than the source used.
          </p>
          <p>
            The tool detects that case and tells you when the output came out
            bigger, rather than handing you a worse file and calling it a success.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Getting a clip under an email or messaging attachment limit</li>
            <li>Shrinking phone footage before uploading it over a slow connection</li>
            <li>Reducing a screen recording for a bug report or a support ticket</li>
            <li>Freeing space without deleting recordings outright</li>
            <li>Preparing video for a platform with a strict file size cap</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <CompressVideoTool />
    </ToolPageShell>
  );
}
