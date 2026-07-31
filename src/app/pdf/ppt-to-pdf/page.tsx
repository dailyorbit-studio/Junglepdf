import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import PptToPdfTool from "./PptToPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "ppt-to-pdf",
  title: "PPT to PDF — Convert PowerPoint Slides to PDF",
  description:
    "Turn a .pptx deck into a readable PDF — titles, bullets and speaker notes, one page per slide. Runs in your browser with no uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Will each slide look like it does in PowerPoint?",
    answer:
      "No, and this is the thing to understand before you start. What you get is the deck's content — titles, bullets, their nesting, optionally the speaker notes — laid out one page per slide. Backgrounds, themes, images, charts, SmartArt and shape positions are not rendered. If you need a visual copy of the slides, PowerPoint's own Export to PDF is the right tool and always will be.",
  },
  {
    question: "Why can't a browser render the slides properly?",
    answer:
      "Because a slide's appearance is described in DrawingML — a full vector layout language covering themes, master layouts, shape geometry, gradients, effects and text boxes positioned to the fraction of a millimetre. Rendering it faithfully means implementing a presentation engine. What is recoverable without one is the text, and that is what this does, rather than producing something that half looks like your deck.",
  },
  {
    question: "So what is it actually good for?",
    answer:
      "Reading a deck without PowerPoint, printing a text handout, quoting from a presentation, searching a deck's content, getting slides into a document you can edit, and pulling out the speaker notes — which are often the substance and are hard to extract any other way.",
  },
  {
    question: "Are slides kept in the right order?",
    answer:
      "Yes. The order comes from the presentation's own slide list, resolved through the file's relationships — not from the slide filenames, which would put slide10 before slide2.",
  },
  {
    question: "Some slides are missing from the PDF.",
    answer:
      "Slides with no text at all are skipped, and the count is reported afterwards. That normally means the slide is a full-bleed image, a diagram or a chart — there is no text on it to extract.",
  },
  {
    question: "Do tables on slides come across?",
    answer:
      "Their contents do, as ordinary bullets rather than as a grid. A table on a slide is usually a short list wearing a border, so the text is the part worth keeping.",
  },
  {
    question: "Does it support .ppt?",
    answer:
      "No — only .pptx. The old binary .ppt shares nothing with the modern format but its name. Open it in PowerPoint, LibreOffice or Google Slides and save it as .pptx first.",
  },
];

export default function PptToPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="ppt-to-pdf"
      title="PPT to PDF"
      description="Turn a PowerPoint deck into a readable PDF — titles, bullets and speaker notes, one page per slide."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "PPT to PDF" },
      ]}
      steps={[
        "Drop your .pptx file into the box above — it stays on your device.",
        "Choose whether to number slides and include speaker notes.",
        "Convert and download the PDF.",
      ]}
      articleContent={
        <>
          <h2>What a deck is, to a computer</h2>
          <p>
            A .pptx is a zip of XML, which is why it can be opened in a browser
            at all. Inside, each slide is a tree of shapes, and each shape may
            carry a text body of paragraphs and runs. That text — the titles, the
            bullets, their outline levels — is fully readable.
          </p>
          <p>
            Everything else about a slide is described in DrawingML: the theme,
            the master layout, shape geometry and position, fills, gradients,
            effects, images, charts, SmartArt. That is a vector layout language,
            and drawing it correctly means implementing a presentation engine.
          </p>

          <h2>So this tool takes the honest half</h2>
          <p>
            It extracts what the deck <em>says</em> and lays it out as a
            document: the slide title as a heading, the body as bullets with
            their nesting preserved, one slide per page, optionally with the
            speaker notes underneath.
          </p>
          <p>
            That is a genuinely useful artefact — it reads well, prints well,
            searches well and can be quoted from. It is not a picture of your
            slides, and the tool does not pretend otherwise. For that,
            PowerPoint&apos;s own Export to PDF is better than anything a browser
            could manage.
          </p>

          <h2>Speaker notes</h2>
          <p>
            Notes are stored in separate documents alongside the slides, and they
            are frequently where the actual content lives — the script, the
            caveats, the numbers behind the chart. Turning them on appends each
            slide&apos;s notes under its bullets, set apart with a rule.
          </p>
          <p>
            The notes document repeats the slide&apos;s own text in a
            placeholder, so only the genuine note body is taken; you do not get
            everything twice.
          </p>

          <h2>Slide order</h2>
          <p>
            Order comes from the presentation&apos;s slide list, resolved through
            the package&apos;s relationship file. This matters more than it
            sounds: reading the slide files in name order puts slide10 between
            slide1 and slide2, and a deck reordered after creation has filenames
            that no longer match its sequence at all.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Reading a deck on a device without PowerPoint</li>
            <li>Printing a text handout instead of forty pages of slides</li>
            <li>Pulling the speaker notes out of a presentation</li>
            <li>Quoting or searching a deck&apos;s content</li>
            <li>Turning slides into the starting point for a written document</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            The deck is unzipped and read inside your browser, and the PDF is
            built in memory. Nothing is uploaded — which matters for the internal
            decks that make up most of what anyone converts.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <PptToPdfTool />
    </ToolPageShell>
  );
}
