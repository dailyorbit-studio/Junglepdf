import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import RotateVideoTool from "./RotateVideoTool";

export const metadata: Metadata = toolMetadata({
  category: "video",
  slug: "rotate",
  title: "Rotate Video — Fix Sideways or Upside-Down Footage",
  description:
    "Rotate a video 90, 180 or 270 degrees, or mirror it horizontally or vertically. The rotation is baked in, so it looks right in every player. No uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Why does my video look correct on my phone but sideways on my computer?",
    answer:
      "Because your phone is applying the container's rotation flag and the other program is not. The frames themselves are sideways in both cases. Rotating here bakes the correct orientation into the frames, which fixes it everywhere at once.",
  },
  {
    question: "Does rotating lose quality?",
    answer:
      "There is one re-encode, at CRF 23, which is visually near-transparent on typical footage. Unlike a JPEG, rotating by 90 degrees cannot be done losslessly in a video codec, so a small quality cost is unavoidable.",
  },
  {
    question: "What is the difference between 90 right and 90 left?",
    answer:
      "The direction of the turn. If the top of your picture currently points to the right of the screen, you want 90 left; if it points to the left, you want 90 right. If you are unsure, try one — it takes one run to see.",
  },
  {
    question: "When would I mirror rather than rotate?",
    answer:
      "Selfie and webcam footage is commonly recorded mirrored, so any writing in the shot appears backwards. Flipping horizontally corrects it. Vertical flips are rarer, mostly for footage shot through a mirror rig or an inverted mount.",
  },
  {
    question: "Is my video uploaded to a server?",
    answer:
      "No. The rotation happens in a WebAssembly build of FFmpeg running inside your browser tab. Nothing leaves your device at any point.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="video"
      slug="rotate"
      title="Rotate Video"
      description="Turn a sideways clip upright, or mirror it — permanently, not with a metadata flag players ignore."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Video", href: "/video" },
        { label: "Rotate Video" },
      ]}
      steps={[
        "Drop in your video file",
        "Pick a rotation or a mirror",
        "Rotate, then download the result",
      ]}
      articleContent={
        <>
          <h2>The rotation flag problem</h2>
          <p>
            Phones do not usually rotate video when you hold them sideways. They record
            the frames the way the sensor saw them and write a small rotation value into
            the container, which players are supposed to apply when showing it.
          </p>
          <p>
            That flag is a suggestion, and support for it is inconsistent. Your phone
            honours it, a browser usually honours it, and then you upload the file
            somewhere or open it in an editor that does not — and it is sideways again.
            It is the single most common reason a video “keeps rotating back”.
          </p>
          <h2>What this does instead</h2>
          <p>
            This tool rotates the actual pixels and then clears the container’s rotation
            flag, so there is nothing left to disagree about. Every player, editor and
            upload pipeline sees a file whose frames are already the right way up.
          </p>
          <p>
            The cost is a re-encode: turning the picture means decoding every frame,
            transposing it, and encoding it again. That takes real time in a browser, and
            it is why this is not instant like rotating a PDF page is.
          </p>
          <h2>Rotating and mirroring are different operations</h2>
          <p>
            Rotation turns the frame around its centre and swaps width and height for the
            90 and 270 degree cases. Mirroring flips it across an axis and keeps the
            dimensions — useful for footage from a front-facing camera, which is often
            recorded reversed so that text in the shot reads backwards.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <RotateVideoTool />
    </ToolPageShell>
  );
}
