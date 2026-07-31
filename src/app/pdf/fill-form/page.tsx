import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import FillFormTool from "./FillFormTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "fill-form",
  title: "PDF Form Filler — Fill a PDF Form Online, In Your Browser",
  description:
    "Fill in a PDF form and save it, without uploading the file. Reads the form's real fields, writes your answers back, and can flatten them so they print correctly.",
});

const FAQ_ITEMS = [
  {
    question: "It says my PDF has no fillable fields.",
    answer:
      "Then it is a printed form rather than an interactive one — the boxes and lines are drawn on the page, but there are no fields behind them. That is extremely common: any form that was scanned, or exported without interactivity, looks fillable to a person and is inert to software. There is nothing to type into, and no tool can create the fields for you automatically.",
  },
  {
    question: "Why not just fill it in my PDF reader?",
    answer:
      "If your reader supports forms, do that. Many do not: mobile browsers, most in-app PDF previews, and older viewers render the page and ignore the form layer entirely, so you see the boxes but cannot type. This tool reads the fields out, gives them ordinary inputs, and writes the values back into the file.",
  },
  {
    question: "What does the flatten option do?",
    answer:
      "It bakes your answers into the page as ordinary content and removes the form. Leave it on if you are sending the form somewhere final — it stops the answers being edited and makes them print identically in every viewer. Turn it off if you want to come back and change something later.",
  },
  {
    question: "Will the filled form print correctly?",
    answer:
      "Yes. A field's value and its drawn appearance are stored separately in a PDF, and forms filled by some software save the value without generating the appearance — which is why a filled form sometimes prints blank. This tool regenerates the appearance for every field it writes, which is exactly what prevents that.",
  },
  {
    question: "If I overwrite a value, is the old one really gone?",
    answer:
      "Only if you flatten. A PDF does not overwrite in place — replacing a field's value leaves its previous appearance behind inside the file, unreferenced and invisible in any viewer, but still readable in the raw bytes. That matters when a form reaches you with someone else's details already in it. Flattening here rebuilds the document from its pages alone, so nothing unreferenced survives; the tool checks this. Saved unflattened, the file remains an editable form and the earlier value remains recoverable.",
  },
  {
    question: "Why are the field names strange?",
    answer:
      "Because they are internal identifiers, not labels — things like topmostSubform[0].Page1[0].f1_01[0]. A PDF form has no reliable link between a field and the text printed next to it on the page. The names are tidied up for display and the page number is shown, but the surest way to tell which is which is to have the PDF open beside you.",
  },
  {
    question: "Are read-only fields editable?",
    answer:
      "No. Fields marked read-only by the form's author are shown with their value but cannot be changed — usually calculated totals or reference numbers the issuer set deliberately.",
  },
  {
    question: "Is my form uploaded?",
    answer:
      "No. The PDF is read and rewritten entirely in your browser. Forms carry names, addresses, salaries, medical details and account numbers — this is the category of file that should never be handed to an unknown server.",
  },
];

export default function FillFormPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="fill-form"
      title="PDF Form Filler"
      description="Fill in a fillable PDF and save it — the fields are read from the file and your answers written back."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "PDF Form Filler" },
      ]}
      steps={[
        "Drop your fillable PDF into the box above — it stays on your device.",
        "Type into the fields the tool finds in the form.",
        "Save, choosing whether to flatten the answers into the page.",
      ]}
      articleContent={
        <>
          <h2>The form layer</h2>
          <p>
            A fillable PDF is two things at once. There is the page — the lines,
            labels and boxes that were printed — and above it a form layer: a
            dictionary of named fields, each with a type, a value, and a widget
            saying where on the page it should be drawn.
          </p>
          <p>
            This tool reads that dictionary, presents each field as an ordinary
            input, and writes your answers back into it. The page itself is never
            modified, so the form looks exactly as its author intended.
          </p>

          <h2>Why a browser tool for something readers already do</h2>
          <p>
            Because a great many readers do not. Form support is optional, and
            plenty of software skips it: mobile browsers, the preview panes built
            into mail and messaging apps, older desktop viewers, and most
            lightweight readers show the page and ignore the fields. You can see
            where to write and cannot write there.
          </p>
          <p>
            Running the form layer directly means it does not matter what your
            reader supports.
          </p>

          <h2>The blank-printout problem</h2>
          <p>
            A PDF stores a field&apos;s <em>value</em> and its <em>appearance</em>
            separately — the text you typed, and a description of how that text
            should be drawn. Software that writes the value without regenerating
            the appearance produces a file that looks filled in one viewer and
            empty in another, and frequently prints blank.
          </p>
          <p>
            Every field written here has its appearance regenerated on save, with
            a font that is actually embedded rather than one the form merely
            names. That single step is what makes the difference between a filled
            form and a filled form that survives being sent to someone else.
          </p>

          <h2>Flatten, or leave it live</h2>
          <p>
            <strong>Flattened</strong> — the answers become page content and the
            form disappears. Nothing can be retyped, and every viewer draws it
            identically. This is what you want for anything final.
          </p>
          <p>
            <strong>Left live</strong> — the file stays a form with your values in
            it, so you or someone else can come back and change an answer. Right
            for a draft or a form that gets passed along.
          </p>

          <h2>What this cannot do</h2>
          <p>
            It cannot create fields that do not exist. If your form is a scan, or
            was exported flat, there is no form layer to read — the boxes are just
            ink. The tool says so rather than showing you an empty list and
            leaving you to guess.
          </p>
          <p>
            It also does not fill signature fields. A signature field expects a
            cryptographic signature, which is a different thing from typing a
            name; the Sign PDF tool places a drawn or typed signature image
            instead.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Completing an application on a phone whose browser cannot fill forms</li>
            <li>Filling a tax, visa or benefits form without installing software</li>
            <li>Filling the same template repeatedly with different details</li>
            <li>Finishing a form someone sent that your reader shows as inert</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            Everything runs on your device. Nothing about the form — least of all
            what you typed into it — is transmitted anywhere.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <FillFormTool />
    </ToolPageShell>
  );
}
