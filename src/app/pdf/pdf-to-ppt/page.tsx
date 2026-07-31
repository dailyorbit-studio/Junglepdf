import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import PdfToPptTool from "./PdfToPptTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "pdf-to-ppt",
  title: "PDF to PPT — Convert PDF Into PowerPoint Slides",
  description:
    "Turn each PDF page into a PowerPoint slide. Slide size matches your page shape, so nothing is letterboxed. Free, no uploads, runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "Will I be able to edit the text in PowerPoint?",
    answer:
      "No. Each page becomes a picture filling one slide. That is not a shortcut — it is what the conversion honestly is. A PDF page has no titles, bullet lists or content placeholders in it; it has characters at coordinates and vector paths. There is nothing to turn into editable slide shapes without guessing, and guessing produces text boxes scattered across a slide that are worse to work with than an image.",
  },
  {
    question: "Then what is this actually for?",
    answer:
      "Presenting a document. You get a real .pptx you can open in presenter mode, project, step through, annotate over with PowerPoint's pen, reorder, and add your own slides around. That covers most of why people want a PDF in PowerPoint: they have a report or a deck exported as PDF and they need to present it.",
  },
  {
    question: "I need the words back, not pictures.",
    answer:
      "Then this is the wrong tool. PDF to Word rebuilds paragraphs and headings as editable text, and PDF to Text gives you the raw content. Convert with one of those, then paste into slides.",
  },
  {
    question: "What resolution should I pick?",
    answer:
      "96 DPI for sharing on a screen or in a call, 150 for projecting, 200 if the slides will be printed as handouts. Higher resolution means a sharper slide and a bigger file, and a 40-page PDF at 200 DPI can easily reach tens of megabytes.",
  },
  {
    question: "What if my PDF has mixed page sizes?",
    answer:
      "PowerPoint allows exactly one slide size per presentation, so the deck takes the shape of the first page. Pages of a different shape are fitted against it, and the tool tells you when it found any. Splitting the PDF by page size first gives a tidier result.",
  },
  {
    question: "Is my PDF uploaded?",
    answer:
      "No. Pages are rendered and the .pptx is zipped together entirely in your browser. Nothing is transmitted.",
  },
];

export default function PdfToPptPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="pdf-to-ppt"
      title="PDF to PPT"
      description="Turn each page of a PDF into a PowerPoint slide, sized to match your pages exactly."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "PDF to PPT" },
      ]}
      steps={[
        "Drop your PDF into the box above — it stays on your device.",
        "Pick a resolution to suit screen, projector or print.",
        "Convert and download the .pptx.",
      ]}
      articleContent={
        <>
          <h2>Why the pages become pictures</h2>
          <p>
            A slide is a small set of semantic shapes — a title, a body
            placeholder, maybe a picture — that a theme arranges and that you can
            edit. A PDF page is the opposite: a finished layout of characters at
            coordinates, vector paths and embedded images, with no record of
            which text was a heading or which run was a bullet.
          </p>
          <p>
            Converting the first into the second means inventing structure that
            is not in the file. Tools that try produce a slide covered in
            free-floating text boxes at arbitrary positions — technically
            editable, practically unusable, and worse than an image because it
            also looks wrong.
          </p>
          <p>
            So each page is rendered and placed on its own slide. What you get is
            an accurate deck rather than an approximate one.
          </p>

          <h2>What that gives you</h2>
          <p>
            A genuine .pptx: presenter mode, projection, stepping through pages,
            annotating with the pen during a talk, reordering slides, and adding
            your own slides before or after. That covers the real reason most
            people want this — they have a report or a deck that only exists as a
            PDF, and they need to present it.
          </p>
          <p>
            If you need the words instead, PDF to Word rebuilds paragraphs and
            headings as editable text, and PDF to Text gives you the raw content
            to paste wherever you like.
          </p>

          <h2>Slide size follows your pages</h2>
          <p>
            Rather than forcing everything into 16:9 and letterboxing an A4
            document with grey bars, the deck is created at the exact aspect
            ratio of your first page. A portrait PDF makes a portrait deck; a
            landscape one makes landscape.
          </p>
          <p>
            PowerPoint permits only one slide size per presentation, so a PDF
            that mixes page sizes has to fit its odd pages against the first.
            The tool reports when it finds any, so the result is not a surprise.
          </p>

          <h2>Choosing a resolution</h2>
          <p>
            The images are the file, so resolution decides both sharpness and
            size. 96 DPI is right for sharing on a screen or in a call, 150 for
            projecting, 200 when the slides will be printed. A long document at
            200 DPI runs to tens of megabytes — worth knowing before emailing
            it.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Presenting a report that only exists as a PDF</li>
            <li>Getting a client&apos;s exported deck back into PowerPoint to present</li>
            <li>Annotating over pages live during a talk</li>
            <li>Building a deck around existing pages without rebuilding them</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            Rendering and packaging both happen in your browser. Nothing is
            uploaded, and no server ever holds the document.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <PdfToPptTool />
    </ToolPageShell>
  );
}
