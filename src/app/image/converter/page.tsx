import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ImageConverterTool from "./ImageConverterTool";

export const metadata: Metadata = toolMetadata({
  category: "image",
  slug: "converter",
  title: "Image Converter — JPG, PNG, WebP and AVIF",
  description:
    "Convert images between JPG, PNG, WebP and AVIF without changing their dimensions. Runs entirely in your browser — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Does converting change the image dimensions?",
    answer:
      "No. The converter re-encodes at the source's exact pixel dimensions. Only the container format changes. If you also need to change the size, use the Image Resizer instead — it does both in one pass, which avoids the extra generation loss of encoding twice.",
  },
  {
    question: "Which format should I pick?",
    answer:
      "WebP is the safe default for the web: it is smaller than JPG at the same visible quality and is supported everywhere that matters. AVIF is smaller still but encodes slowly and not every browser can create it. PNG is lossless, so use it for screenshots, logos, and anything with sharp edges or transparency. JPG is the right answer when you need maximum compatibility with older software.",
  },
  {
    question: "Why did my file get bigger after converting?",
    answer:
      "Two common reasons. Converting a lossy source such as JPG into a lossless format such as PNG means the encoder now has to store the compression artifacts as if they were real detail, which costs more space than the original. And re-encoding an already well-compressed image at a high quality setting can easily exceed the original. The tool tells you when the output grew rather than letting you find out after downloading.",
  },
  {
    question: "What happens to transparency?",
    answer:
      "PNG, WebP and AVIF all keep the alpha channel. JPG cannot store transparency at all, so when JPG is the target the tool paints a white background behind the image first. Without that step every transparent pixel would encode as black.",
  },
  {
    question: "Is my image uploaded anywhere?",
    answer:
      "No. Conversion happens on an HTML5 canvas inside your browser tab. The file is read into memory, drawn, and re-encoded by your browser's own image encoder. Nothing is sent over the network.",
  },
];

export default function ImageConverterPage() {
  return (
    <ToolPageShell
      category="image"
      slug="converter"
      title="Image Converter"
      description="Convert between JPG, PNG, WebP and AVIF at the original resolution. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image", href: "/image" },
        { label: "Image Converter" },
      ]}
      articleContent={
        <>
          <h2>Converting image formats in the browser</h2>
          <p>
            Every modern browser ships encoders for JPEG, PNG and WebP, and
            most now ship AVIF as well. This tool decodes your file, draws it
            onto a canvas at its native resolution, and asks the browser to
            re-encode that canvas in the format you picked. No external
            library and no server is involved — the same code path your
            browser uses to save an image is what produces the output.
          </p>
          <p>
            Because the work happens locally, there is no upload wait and no
            size cap beyond what your device&apos;s memory allows. It also
            means your images never touch a third party&apos;s disk, which
            matters for anything you would not post publicly.
          </p>
          <h2>Choosing between JPG, PNG, WebP and AVIF</h2>
          <p>
            <strong>JPG</strong> is lossy and universally supported. It is
            still the right choice for photographs destined for software that
            predates the modern formats, but it cannot store transparency and
            it degrades every time it is re-saved.
          </p>
          <p>
            <strong>PNG</strong> is lossless and supports transparency. It
            excels at screenshots, diagrams, logos and pixel art — anything
            with flat color and hard edges. It is a poor fit for photographs,
            where it often produces files several times larger than JPG.
          </p>
          <p>
            <strong>WebP</strong> supports both lossy and lossless modes plus
            transparency, and typically lands 25–35% smaller than an equivalent
            JPG. It is the pragmatic default for web delivery today.
          </p>
          <p>
            <strong>AVIF</strong> compresses harder still, especially at low
            bitrates, and handles wide color gamut and HDR. The tradeoff is
            encoding speed and support: not every browser can create AVIF, only
            display it. When yours cannot, the tool refuses rather than
            silently handing you a PNG with an .avif extension.
          </p>
          <h2>Quality settings and generation loss</h2>
          <p>
            The quality slider maps to the encoder&apos;s own quality parameter
            for the lossy formats. PNG ignores it entirely, because lossless
            compression has no quality dial — only a speed/size tradeoff the
            browser handles internally.
          </p>
          <p>
            Each lossy re-encode discards a little more information, and that
            loss compounds. Converting JPG to WebP and back to JPG will look
            worse than either single conversion. Where possible, convert once
            from the highest-quality original you have rather than chaining
            conversions.
          </p>
          <h2>When to use a converter</h2>
          <ul>
            <li>Shrinking page weight by moving site images from JPG or PNG to WebP</li>
            <li>Producing a JPG for a system that rejects newer formats</li>
            <li>Turning a screenshot into PNG so text stays crisp</li>
            <li>Flattening a transparent PNG onto white for a printed document</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ImageConverterTool />
    </ToolPageShell>
  );
}
