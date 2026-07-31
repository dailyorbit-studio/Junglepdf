import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ImageResizerTool from "./ImageResizerTool";

export const metadata: Metadata = toolMetadata({
  category: "image",
  slug: "resizer",
  title: "Image Resizer — Pixel & mm Custom Dimensions",
  description:
    "Resize images to exact pixel or millimeter dimensions with DPI control. JPEG, PNG, WebP output. 100% browser-based.",
});

const FAQ_ITEMS = [
  {
    question: "What's the difference between pixels and millimeters?",
    answer:
      "Pixels are the native unit for screens. Millimeters are physical measurements used for print. When you enter dimensions in mm, the tool converts them to pixels using your chosen DPI (dots per inch) — for example, 25.4mm at 300 DPI equals 300 pixels. Switching units converts your current numbers rather than reinterpreting them.",
  },
  {
    question: "What DPI should I use for printing?",
    answer:
      "300 DPI is standard for high-quality print (photos, documents). 150 DPI works for casual prints. 72 DPI is only suitable for screen display. If you're preparing images for a passport or ID photo, most governments require 300 DPI.",
  },
  {
    question: "Can I resize without losing quality?",
    answer:
      "Shrinking is generally safe. Enlarging always loses sharpness because new pixels have to be interpolated — the tool warns you when your target exceeds the original dimensions. For best results, start with the largest version of your image and resize down.",
  },
  {
    question: "What output formats are available?",
    answer:
      "JPEG (smallest files, best for photos), PNG (lossless, keeps transparency), or WebP (modern format with good compression). JPEG and WebP have an adjustable quality slider. If your browser can't encode the format you pick — some older Safari versions can't write WebP — the tool tells you instead of silently saving a PNG with the wrong extension.",
  },
  {
    question: "What happens to transparency?",
    answer:
      "PNG and WebP preserve it. JPEG cannot store an alpha channel at all, so transparent areas are filled with white before encoding. The tool notes this under the format picker whenever JPEG is selected.",
  },
];

export default function ImageResizerPage() {
  return (
    <ToolPageShell
      category="image"
      slug="resizer"
      title="Image Resizer"
      description="Resize images to exact dimensions in pixels or millimeters. Supports aspect ratio locking and DPI-based conversion for print."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image", href: "/image" },
        { label: "Image Resizer" },
      ]}
      articleContent={
        <>
          <h2>How the image resizer works</h2>
          <p>
            This tool uses the Canvas API to redraw your image at the exact
            dimensions you specify. The browser&apos;s built-in interpolation
            handles the scaling, producing smooth results for both upscaling
            and downscaling operations.
          </p>
          <p>
            When you enter dimensions in millimeters, the tool converts them
            to pixels using the DPI (dots per inch) you select. For example,
            a 50mm × 50mm image at 300 DPI becomes 591 × 591 pixels. This is
            useful for preparing images for print, ID photos, or documents
            with specific physical size requirements. The pixel equivalent is
            shown live beneath the inputs so there&apos;s no guesswork.
          </p>
          <h2>Output format options</h2>
          <ul>
            <li><strong>JPEG</strong> — Best for photographs. Smallest file size with adjustable quality. No transparency.</li>
            <li><strong>PNG</strong> — Lossless quality, supports transparency. Larger files.</li>
            <li><strong>WebP</strong> — Modern format with excellent compression. Not supported by all older software.</li>
          </ul>
          <h2>Aspect ratio locking</h2>
          <p>
            By default, the aspect ratio is locked. When you change the width,
            the height adjusts proportionally to prevent distortion. Toggle the
            lock off if you need to set non-proportional dimensions (for
            example, cropping a landscape photo into a square).
          </p>
          <h2>Size limits</h2>
          <p>
            Browsers cap how large a canvas can be — mobile Safari is the
            tightest at roughly 16.7 megapixels. Beyond that limit a canvas
            silently produces a blank image rather than raising an error, so
            the tool checks your target dimensions up front and explains the
            problem instead of handing you an empty file.
          </p>
          <p>
            Everything runs locally in your browser. The image is drawn to a
            canvas in memory, re-encoded in your chosen format, and offered as
            a download. No data is transmitted to any server.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ImageResizerTool />
    </ToolPageShell>
  );
}
