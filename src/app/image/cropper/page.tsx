import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ImageCropperTool from "./ImageCropperTool";

export const metadata: Metadata = toolMetadata({
  category: "image",
  slug: "cropper",
  title: "Crop Image Online — Free Browser Image Cropper",
  description:
    "Crop any image by dragging a selection, with optional fixed aspect ratios like 1:1 and 16:9. Runs entirely in your browser — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "How do I select the area to keep?",
    answer:
      "Drag anywhere on the image to draw a new selection box, or drag inside an existing box to move it without resizing. The label above the box shows the exact pixel dimensions of what you will get, updating as you drag.",
  },
  {
    question: "What do the aspect ratio buttons do?",
    answer:
      "Picking a ratio locks the selection to that shape. 1:1 gives a square for profile pictures, 16:9 matches most video and presentation slides, and 9:16 matches phone screens and stories. Switching to a ratio re-fits your current selection around its centre rather than resetting it. Choose Free to drag any shape.",
  },
  {
    question: "Does cropping reduce image quality?",
    answer:
      "Cropping itself removes pixels rather than altering the ones you keep, so there is no resampling loss. However, the result still has to be re-encoded. If you export as PNG the kept pixels are bit-for-bit identical. If you export as JPG or WebP they pass through a lossy encoder again, so use a high quality setting when the source was already a JPG.",
  },
  {
    question: "Can I crop to an exact pixel size?",
    answer:
      "Not directly — the selection is driven by dragging. Crop to roughly the region you want here, then run the result through the Image Resizer to land on exact dimensions. Doing it in that order keeps the framing you chose instead of stretching it.",
  },
  {
    question: "Is my image uploaded to a server?",
    answer:
      "No. The image is decoded in your browser, and the crop is a single canvas draw that copies the selected region into a new canvas. Everything happens in the tab. Nothing is transmitted.",
  },
];

export default function ImageCropperPage() {
  return (
    <ToolPageShell
      category="image"
      slug="cropper"
      title="Image Cropper"
      description="Drag to select the part of the image you want to keep. Lock it to a fixed ratio if you need one. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image", href: "/image" },
        { label: "Image Cropper" },
      ]}
      articleContent={
        <>
          <h2>Cropping without an upload</h2>
          <p>
            This cropper decodes your image in the browser and draws the region
            you select into a fresh canvas, which is then encoded as the format
            you pick. The selection you drag is stored in the image&apos;s own
            pixel coordinates rather than screen coordinates, so resizing the
            window or rotating a phone does not shift what gets cut.
          </p>
          <p>
            Because there is no upload step, cropping a 40-megapixel photo is
            as fast as cropping a thumbnail, and the original never leaves your
            device. That matters for screenshots containing personal data,
            document photos, and anything else you would not hand to a stranger.
          </p>
          <h2>Choosing an aspect ratio</h2>
          <p>
            A free crop is right when you are framing for its own sake. Fixed
            ratios matter when the destination has a fixed shape and will crop
            for you if you do not.
          </p>
          <ul>
            <li><strong>1:1</strong> — profile photos on most social platforms, album art, app icons</li>
            <li><strong>4:3</strong> — the classic photo shape, and most tablet screens</li>
            <li><strong>3:2</strong> — the native ratio of most DSLR and mirrorless sensors, and 6×4 prints</li>
            <li><strong>16:9</strong> — video thumbnails, presentation slides, desktop wallpaper</li>
            <li><strong>9:16</strong> — phone wallpaper and vertical short-form video</li>
          </ul>
          <h2>Crop first, then resize</h2>
          <p>
            When you need both a specific framing and a specific pixel size,
            crop here first and resize afterwards. Doing it the other way round
            means the resize decides the aspect ratio and the crop is left
            fighting it, which usually ends in a stretched or unexpectedly
            tight result.
          </p>
          <p>
            Cropping does not resample the pixels it keeps, so it costs nothing
            in sharpness. Resizing does resample, which is why it belongs last
            in the chain — a single resample of an already-framed image is
            better than resampling twice.
          </p>
          <h2>Format and quality</h2>
          <p>
            PNG keeps the cropped pixels exactly as they were and preserves
            transparency, at the cost of a larger file. JPG and WebP re-compress
            them; at 90% quality the difference is invisible for most
            photographs and the file is a fraction of the size. When the source
            was a PNG with transparent areas and you export JPG, those areas
            are filled with white, because JPG has no alpha channel.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ImageCropperTool />
    </ToolPageShell>
  );
}
