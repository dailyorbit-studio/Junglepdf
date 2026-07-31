import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import PngToIcoTool from "./PngToIcoTool";

export const metadata: Metadata = toolMetadata({
  category: "image",
  slug: "png-to-ico",
  title: "PNG to ICO — Make a Multi-Size Favicon File",
  description:
    "Convert a PNG or JPEG into a real .ico favicon holding several sizes in one file. Runs entirely in your browser — no uploads, no sign-up.",
});

const FAQ_ITEMS = [
  {
    question: "Which sizes should I include?",
    answer:
      "16, 32 and 48 covers everything most sites need — tab, taskbar and shortcut. Add 256 if the icon will appear in Windows file browser tile views. Each extra size adds a few kilobytes at most.",
  },
  {
    question: "Do I still need an .ico if I have PNG favicons?",
    answer:
      "Strictly no, if you declare PNG icons in link tags. In practice a file at /favicon.ico is still requested by clients that ignore or never see those tags, so having one prevents a steady trickle of 404s.",
  },
  {
    question: "What size should my source image be?",
    answer:
      "At least as large as the biggest size you want — ideally 512 × 512 or larger, and square. A small source scaled up will look soft, and the tool warns you when that is what is happening.",
  },
  {
    question: "My logo is not square. What happens?",
    answer:
      "The centre square is used, and you are told that it was. Icons are always displayed square, so cropping is unavoidable — crop it yourself first if the centre is not the part you want.",
  },
  {
    question: "What is the difference between this and the Favicon Generator?",
    answer:
      "The Favicon Generator produces a set of separate PNG files plus the HTML to reference them, which is the modern approach. This produces the single legacy .ico file. Most sites want both, which is why they are two tools.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="image"
      slug="png-to-ico"
      title="PNG to ICO"
      description="Turn an image into a proper .ico — several sizes packed into one file."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image", href: "/image" },
        { label: "PNG to ICO" },
      ]}
      steps={[
        "Drop in a PNG or JPEG — square works best",
        "Pick the sizes to include",
        "Create the icon, then download it",
      ]}
      articleContent={
        <>
          <h2>Why .ico still exists</h2>
          <p>
            Modern sites reference PNG favicons and SVG icons through link tags, and that
            is the better approach. But a bare request to <strong>/favicon.ico</strong>
            is still made by browsers when no tag is present, by feed readers, by some
            crawlers, and by older software generally.
          </p>
          <p>
            Having a real .ico at the root costs a couple of kilobytes and removes a
            404 that would otherwise appear in your logs on every visit.
          </p>
          <h2>One file, several sizes</h2>
          <p>
            The format’s useful property is that a single file holds multiple
            resolutions, and whatever is displaying it picks the closest. 16 pixels is
            the browser tab, 32 is a taskbar or a bookmark bar, 48 is a desktop shortcut,
            and the larger sizes are used by file browsers and tile views.
          </p>
          <p>
            Rendering each size from your source separately is much better than letting
            something scale one image down on the fly — small sizes benefit from being
            drawn at that size rather than resampled from a large one.
          </p>
          <h2>How the file is built</h2>
          <p>
            An ICO is a six-byte header, a sixteen-byte directory entry per image, and
            then the image data. Since Windows Vista that data may be a whole PNG rather
            than the older bitmap format, which is what makes this practical to build in
            a browser: each size is rendered to a PNG and packed straight in.
          </p>
          <p>
            Non-square sources are centre-cropped rather than squashed, because an icon
            is displayed square in every context it appears in.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <PngToIcoTool />
    </ToolPageShell>
  );
}
