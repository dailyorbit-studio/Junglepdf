import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ScannerTool from "./ScannerTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "scanner",
  title: "PDF Scanner — Scan Documents to PDF With Your Camera",
  description:
    "Use your phone or webcam to scan pages into a PDF. Photos are cleaned up for legibility and never leave your device. Free, no app to install.",
});

const FAQ_ITEMS = [
  {
    question: "Do my photos get uploaded?",
    answer:
      "No — and this is the whole reason to use a browser scanner rather than an app. The camera frames are captured to a canvas, processed and assembled into a PDF entirely on your device. Nothing is transmitted, and there is no account, no cloud folder and no sync. Scanner apps routinely upload pages for OCR or storage; documents worth scanning are usually documents worth not uploading.",
  },
  {
    question: "The camera will not start.",
    answer:
      "Three usual causes. Permission was denied — reset it from the icon in your browser's address bar. The page is not on a secure connection — camera access requires https:// or localhost, so a phone opening the site over plain http on a local network gets nothing. Or another app is holding the camera; close it and try again. The tool tells you which of these happened rather than showing a generic failure.",
  },
  {
    question: "What do the capture modes do?",
    answer:
      "Document mode converts to luminance and applies a contrast curve that pushes the paper towards white and the ink towards black — a phone photo of white paper is never actually white, and untreated it prints as a grubby grey rectangle. Greyscale is neutral, which suits pencil and mixed pages. Colour photo does no processing at all, for when the colour matters.",
  },
  {
    question: "Why not use a pure black-and-white threshold?",
    answer:
      "Because it destroys anything faint. A threshold looks crisp on clean laser print and erases pencil, a light stamp, a pen signature that did not press hard, or the fine print on a receipt — exactly the things people cannot afford to lose. The contrast curve keeps the midtones while still cleaning up the page.",
  },
  {
    question: "Does it detect the page edges and straighten it?",
    answer:
      "No. Finding a page's corners in a photograph and warping it flat is genuine computer vision — in practice a multi-megabyte vision library. This does the tonal work, which is most of what makes a photographed page readable, and asks you to hold the camera square to the page for the rest.",
  },
  {
    question: "Can I search the text in the scan?",
    answer:
      "No. The PDF holds a photograph of each page, so there is no text in it at all. Making a scan searchable requires OCR, which this site deliberately does not do — it would mean shipping several megabytes of WebAssembly plus a language model to every visitor.",
  },
  {
    question: "How do I get the best results?",
    answer:
      "Use a phone rather than a laptop webcam — the rear camera is several times sharper. Put the page on a flat, contrasting surface, get even light with no hard shadow across the page, hold the camera parallel to the paper, and fill the frame. Capture each page, check the thumbnail, and retake before moving on.",
  },
];

export default function ScannerPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="scanner"
      title="PDF Scanner"
      description="Scan pages to PDF with your phone or webcam — cleaned up for legibility, and never uploaded."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "PDF Scanner" },
      ]}
      steps={[
        "Start the camera and allow access when your browser asks.",
        "Capture each page, checking the thumbnails as you go.",
        "Choose a page size and build the PDF.",
      ]}
      articleContent={
        <>
          <h2>A scanner without an app</h2>
          <p>
            Scanning a document usually means installing something. The
            app-store scanners are capable, and they also want an account, a
            cloud folder, sync, and permission to upload your pages for
            processing. For a passport, a signed contract or a medical form,
            that is a lot to accept for something the phone in your hand can do
            unaided.
          </p>
          <p>
            This runs in the browser. The camera stream, the image processing and
            the PDF assembly all happen on your device, and nothing is
            transmitted anywhere.
          </p>

          <h2>Making a photo look like a scan</h2>
          <p>
            The gap between a photo of a page and a scan of it is mostly tone. A
            camera sees white paper as grey, unevenly lit, with the ink washed
            towards the paper rather than sitting black against it. Printed
            untreated, it looks like what it is: a photograph of a document.
          </p>
          <p>
            Document mode converts each pixel to luminance — weighted the way
            the eye weights the channels, so coloured ink and highlighter darken
            sensibly instead of vanishing — then applies a contrast curve that
            pushes paper towards white and ink towards black.
          </p>
          <p>
            Deliberately a curve, not a threshold. A hard black-and-white
            threshold looks sharper on clean laser print and destroys everything
            faint: pencil, a light stamp, a signature that did not press hard,
            the small print on a receipt. Those are precisely the details that
            make a scan worth keeping, so the midtones are preserved.
          </p>

          <h2>What it does not do</h2>
          <p>
            <strong>No edge detection or deskewing.</strong> Locating a page in a
            photograph and warping it flat is real computer vision, and doing it
            in a browser means shipping a vision library of several megabytes to
            everyone who visits. Holding the camera square to the page achieves
            the same thing for free.
          </p>
          <p>
            <strong>No OCR.</strong> The PDF contains pictures, so it cannot be
            searched or copied from. Recognising the text would mean a
            recognition engine plus a model per language — an order of magnitude
            heavier than anything else here.
          </p>

          <h2>Getting good results</h2>
          <ul>
            <li>Use a phone if you can — a rear camera is far sharper than a webcam</li>
            <li>Flat surface, ideally one that contrasts with the paper</li>
            <li>Even light, and no hard shadow falling across the page</li>
            <li>Camera parallel to the page, not at an angle</li>
            <li>Fill the frame with the page</li>
            <li>Check each thumbnail and retake before moving on</li>
          </ul>

          <h2>Common uses</h2>
          <ul>
            <li>Scanning a signed form to send back by email</li>
            <li>Turning a receipt or invoice into a PDF for an expense claim</li>
            <li>Capturing ID or a certificate for an application</li>
            <li>Digitising a few pages without walking to an office scanner</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            The camera stream is used and discarded, the frames stay in memory,
            and the PDF is built on your device. The camera is released as soon
            as you finish. For the documents people actually scan — identity,
            medical, financial, legal — that is the difference that matters.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ScannerTool />
    </ToolPageShell>
  );
}
