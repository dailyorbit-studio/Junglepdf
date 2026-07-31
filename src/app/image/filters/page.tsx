import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ImageFiltersTool from "./ImageFiltersTool";

export const metadata: Metadata = toolMetadata({
  category: "image",
  slug: "filters",
  title: "Photo Filters — Brightness, Contrast & Saturation Editor",
  description:
    "Adjust brightness, contrast, saturation, blur and more with a live preview, then export. Runs in your browser — your photo is never uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Does the preview match the exported file exactly?",
    answer:
      "Yes. The preview and the export run the identical filter string against the identical source image, differing only in canvas size. Many editors approximate the preview for speed and produce something subtly different on export; here the same pipeline does both, so there is nothing to diverge.",
  },
  {
    question: "Why are the adjustments instant even on a huge photo?",
    answer:
      "Because they run in the compositor rather than in JavaScript. The canvas filter property hands the work to the same optimised graphics path the browser uses for CSS effects, so a 24-megapixel image adjusts in milliseconds. Looping over the pixels manually would take seconds and freeze the page while it did.",
  },
  {
    question: "Does the order of the adjustments matter?",
    answer:
      "Yes, and it is fixed deliberately. Filters compose in sequence, so blurring before a contrast boost gives a different result from doing it the other way around. The order here matches what image editors use: colour adjustments first, then tone, then the optical effect last.",
  },
  {
    question: "Will editing reduce quality?",
    answer:
      "The image is redrawn at its full original resolution, so no detail is lost to scaling. Exporting as JPEG adds one generation of lossy compression, which is normally invisible — choose PNG to avoid it entirely at the cost of a larger file.",
  },
  {
    question: "Can I undo after exporting?",
    answer:
      "Not from the exported file — the adjustments are baked into the pixels. Keep your original. Within the tool, Reset returns every slider to neutral, so you can start again without reloading the image.",
  },
  {
    question: "Is my photo uploaded anywhere?",
    answer:
      "No. Both the preview and the export happen on a canvas inside your browser. Nothing crosses the network.",
  },
];

export default function ImageFiltersPage() {
  return (
    <ToolPageShell
      category="image"
      slug="filters"
      title="Photo Filters"
      description="Adjust brightness, contrast, saturation and more, with a preview that matches the export exactly."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image", href: "/image" },
        { label: "Photo Filters" },
      ]}
      steps={[
        "Drop an image into the box above — it stays on your device.",
        "Pick a preset or move the sliders. The preview updates instantly.",
        "Apply and download the edited image.",
      ]}
      articleContent={
        <>
          <h2>Adjustments that respond immediately</h2>
          <p>
            Every control here updates the preview as you drag it, at any image
            size. That is not an optimisation detail so much as the difference
            between an editor you can actually judge by eye and one where you set a
            number, wait, and guess again.
          </p>
          <p>
            It works because the adjustments run through the browser&apos;s canvas
            filter pipeline — the same optimised graphics path that powers CSS
            effects, executing in the compositor rather than in JavaScript. A
            24-megapixel photo re-filters in milliseconds. Doing the same
            arithmetic in a loop over the pixel array would take seconds per
            adjustment and lock up the page while it ran.
          </p>

          <h2>What the preview guarantees</h2>
          <p>
            The preview and the exported file run the <em>same filter string</em>{" "}
            against the <em>same source image</em>. The only difference between
            them is the size of the canvas being drawn onto.
          </p>
          <p>
            This matters because it is a common place for editors to disappoint.
            Many preview a downscaled proxy through an approximation of the real
            pipeline, which is fast but means the export can come back slightly
            different — usually in exactly the way you were trying to control.
            Here there is one pipeline, so there is nothing to diverge.
          </p>

          <h2>What each control does</h2>
          <ul>
            <li>
              <strong>Brightness</strong> — scales every channel. Above 100% lifts
              the whole image, which can clip highlights to pure white
              irrecoverably.
            </li>
            <li>
              <strong>Contrast</strong> — pushes values away from mid-grey. Adds
              punch, at the cost of shadow and highlight detail.
            </li>
            <li>
              <strong>Saturation</strong> — intensity of colour. Zero gives you
              greyscale by a different route than the grayscale slider, weighting
              channels for perceived brightness.
            </li>
            <li>
              <strong>Hue</strong> — rotates every colour around the wheel. Small
              amounts correct a colour cast; large amounts are an effect.
            </li>
            <li>
              <strong>Sepia</strong> — maps toward warm brown. The classic aged
              look, best at 30–50% rather than full strength.
            </li>
            <li>
              <strong>Grayscale</strong> — removes colour using perceptual
              weighting, so a red and a blue of equal brightness stay
              distinguishable.
            </li>
            <li>
              <strong>Invert</strong> — flips every value. Full strength gives a
              photographic negative.
            </li>
            <li>
              <strong>Blur</strong> — a Gaussian blur in pixels. Applied last, so it
              softens the adjusted image rather than being adjusted itself.
            </li>
          </ul>

          <h2>Why order is fixed</h2>
          <p>
            Filters compose left to right, and the sequence genuinely changes the
            result: blurring a high-contrast image is not the same as boosting the
            contrast of a blurred one, because the blur averages values the
            contrast curve has already pushed apart.
          </p>
          <p>
            The order used here — colour, then tone, then optical effect — is what
            image editors converged on, because it matches the order the equivalent
            operations happen in a real camera and lens.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Rescuing an underexposed photo with brightness and contrast</li>
            <li>Converting to black and white for a portrait or document</li>
            <li>Applying a consistent look across a set of product images</li>
            <li>Toning down an over-saturated phone photo</li>
            <li>Blurring an image for use as a background</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ImageFiltersTool />
    </ToolPageShell>
  );
}
