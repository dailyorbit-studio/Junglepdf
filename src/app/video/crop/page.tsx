import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import CropVideoTool from "./CropVideoTool";

export const metadata: Metadata = toolMetadata({
  category: "video",
  slug: "crop",
  title: "Crop Video — Cut the Frame to Any Size or Ratio",
  description:
    "Crop a video to remove black bars or reframe it for social media. Pick a ratio or set the rectangle yourself. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Does cropping reduce the quality of my video?",
    answer:
      "Slightly, because the picture has to be re-encoded. The tool uses CRF 23, which is visually near-transparent for most footage — you would struggle to see the difference side by side. Cropping twice in a row will show, though, so crop once from the original rather than repeatedly refining an already-cropped file.",
  },
  {
    question: "Why is the output always an MP4?",
    answer:
      "Because H.264 in an MP4 container is the one combination that plays everywhere — phones, browsers, editors and social platforms all accept it. Since the video is being re-encoded anyway, there is nothing to preserve by keeping an unusual source container.",
  },
  {
    question: "Can I remove the black bars from a letterboxed video?",
    answer:
      "Yes, that is one of the main uses. Set Top to where the picture actually starts and reduce the height by the same amount at the bottom. If the bars are exactly equal, cropping to 16:9 on a 4:3 file often lands on them directly.",
  },
  {
    question: "Why does it say my crop area is out of bounds?",
    answer:
      "Because the rectangle you asked for runs off the edge of the frame. FFmpeg rejects that rather than clamping it, so the tool checks first — Left plus Width has to stay within the source width, and Top plus Height within the source height.",
  },
  {
    question: "Is my video uploaded anywhere?",
    answer:
      "No. The crop runs through a WebAssembly build of FFmpeg inside your browser tab. The file is read into memory, processed on your own machine, and handed back as a download. Nothing is transmitted.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="video"
      slug="crop"
      title="Crop Video"
      description="Cut a rectangle out of the frame — remove letterboxing, or reframe for a square or vertical post."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Video", href: "/video" },
        { label: "Crop Video" },
      ]}
      steps={[
        "Drop in an MP4, MKV, AVI, WebM or MOV file",
        "Choose an aspect ratio, or type the exact rectangle you want",
        "Crop, then download the result",
      ]}
      articleContent={
        <>
          <h2>Cropping re-encodes; trimming does not</h2>
          <p>
            The Video Trimmer can cut a clip out of a file without touching a single
            frame, because it just copies the existing compressed data between two
            keyframes. Cropping cannot work that way. Changing the size of the picture
            means every frame has to be decoded, cut down, and encoded again.
          </p>
          <p>
            In practice that means cropping takes roughly as long as a conversion rather
            than the second or two a trim takes, and the output is an MP4 regardless of
            what went in. The audio track is copied straight through untouched, so at
            least half the file costs nothing.
          </p>
          <h2>Why the dimensions get rounded to even numbers</h2>
          <p>
            H.264 stores colour at half resolution in both directions — one chroma sample
            for every 2×2 block of brightness samples. That means the frame has to divide
            evenly by two, and an encoder handed an odd width fails outright with
            <strong>width not divisible by 2</strong> rather than rounding for you.
          </p>
          <p>
            So a crop rectangle is quietly rounded down to the nearest even number on
            both axes. At most you lose one row and one column of pixels, which is not
            visible, and the alternative is a job that dies at the last step.
          </p>
          <h2>Reframing for social platforms</h2>
          <p>
            The ratio presets pick the largest rectangle of that shape that fits inside
            your source and centre it. 1:1 is the classic square post, 4:5 is the tallest
            Instagram allows in-feed, and 9:16 is the full-height vertical format used by
            Reels, Shorts and TikTok.
          </p>
          <p>
            Centring is a starting point, not an answer — if the subject sits off to one
            side, adjust the Left and Top values afterwards. The numbers are in source
            pixels with the origin at the top-left corner.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <CropVideoTool />
    </ToolPageShell>
  );
}
