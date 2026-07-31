import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import FaviconTool from "./FaviconTool";

export const metadata: Metadata = toolMetadata({
  category: "image",
  slug: "favicon",
  title: "Favicon Generator — Free Browser App Icon Maker",
  description:
    "Turn one image into a complete favicon and app icon set with a web manifest and ready-to-paste HTML. Runs entirely in your browser — no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "What sizes does it produce?",
    answer:
      "Six PNGs: 16 and 32 pixels for browser tabs, 48 for the Windows site icon, 180 for the iOS home screen, and 192 and 512 for Android home screens and PWA splash screens. The ZIP also contains a site.webmanifest referencing the two Android sizes, plus a README with the HTML you need.",
  },
  {
    question: "Why is there no .ico file?",
    answer:
      "Because no browser released this decade needs one. Every current browser reads PNG favicons through link rel=\"icon\" with a sizes attribute, which is exactly what the generated HTML snippet uses. Hand-assembling a multi-resolution ICO container adds a format that can silently go wrong for the sake of compatibility with browsers that no longer receive security updates.",
  },
  {
    question: "What size should my source image be?",
    answer:
      "Square, and at least 512 pixels on a side. The 512px icon is generated at 1:1, so anything smaller has to be upscaled and will look soft on Android splash screens. If your source is not square, the tool centres it inside a square canvas rather than stretching it, and tells you it did so.",
  },
  {
    question: "Should I use a transparent background or a solid colour?",
    answer:
      "Transparency is usually right and is the default. The exception is a logo made of dark shapes with no backing: on a dark browser theme or a dark Android launcher it can vanish. If that describes your mark, turn on the background fill and pick a colour that keeps it legible.",
  },
  {
    question: "Where do the files go on my site?",
    answer:
      "Everything except README.txt goes in your site's public root, so the files are served from /favicon-32x32.png and so on. Then paste the four link tags into your page's head. If you are using a framework with an app or public directory, that directory is the root the paths are relative to.",
  },
  {
    question: "Is my logo uploaded anywhere?",
    answer:
      "No. Each size is rendered onto a canvas in your browser, and the ZIP is assembled in memory by JSZip. Nothing is transmitted, which matters because a logo is often the first asset that exists for a product nobody has announced yet.",
  },
];

export default function FaviconPage() {
  return (
    <ToolPageShell
      category="image"
      slug="favicon"
      title="Favicon Generator"
      description="One image in, a complete icon set out — tab icons, home screen icons, a web manifest and the HTML to wire it up. Nothing gets uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Image", href: "/image" },
        { label: "Favicon Generator" },
      ]}
      articleContent={
        <>
          <h2>What a favicon set actually needs in 2026</h2>
          <p>
            The single favicon.ico in a site root is a relic. A site today is
            rendered as a tab in a browser, a bookmark tile, an icon on an iOS
            home screen, an Android launcher shortcut, and a splash screen for
            an installed progressive web app. Each of those surfaces wants a
            different pixel size, and several want a specific filename.
          </p>
          <p>
            This generator renders your source at each of the sizes that still
            matter, writes a web manifest pointing at the two Android sizes, and
            hands you the HTML that ties them together. The result is a
            directory you copy into your public root and four lines you paste
            into your head — no build step, no configuration.
          </p>
          <h2>Why PNG rather than ICO</h2>
          <p>
            ICO is a container format that can hold several bitmaps at
            different resolutions in one file. It made sense when browsers
            looked for exactly one path and could not be told about sizes.
            Modern browsers instead read a list of link tags, each declaring
            its own size, and pick the one closest to what they need.
          </p>
          <p>
            That means a set of plain PNGs is both simpler and more precise:
            you control exactly which bitmap is used at which size, rather than
            hoping the browser picks well from inside a container. It is also
            more robust — a malformed ICO fails silently, whereas a missing PNG
            shows up immediately as a 404 in your network panel.
          </p>
          <h2>Designing an icon that survives 16 pixels</h2>
          <p>
            A logo that reads beautifully on a landing page frequently turns to
            mush in a browser tab. At 16 pixels you have roughly the detail of
            a lowercase letter. Thin strokes disappear, gradients band, and
            anything more than about three shapes becomes noise.
          </p>
          <p>
            The preview grid shows every generated size at close to its true
            scale, with smoothing turned off for the small ones, so you can see
            the aliasing rather than a flattering blur. If the 16px version is
            unreadable, the fix is a simplified mark for the icon — not a
            better downscaler.
          </p>
          <h2>Squares, padding and safe areas</h2>
          <p>
            Every target here is square. A non-square source is centred inside
            the square rather than stretched, because a squashed logo looks
            broken in a way a letterboxed one does not.
          </p>
          <p>
            Android launchers may apply their own mask, cropping your icon to a
            circle or squircle depending on the device. If your mark runs to
            the very edge of the canvas, expect the corners to be trimmed.
            Leaving roughly ten percent of padding around the artwork in your
            source image is the usual defence.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <FaviconTool />
    </ToolPageShell>
  );
}
