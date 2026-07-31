import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import PdfToExcelTool from "./PdfToExcelTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "pdf-to-excel",
  title: "PDF to Excel — Extract PDF Tables to XLSX",
  description:
    "Pull the tables out of a PDF into an editable Excel workbook. Columns are reconstructed from the page layout. Free, no uploads, runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "How accurate is this?",
    answer:
      "It depends entirely on the PDF, and it is worth understanding why. A PDF contains no table — it contains characters at coordinates. The grid you see is drawn lines, and nothing in the file records which text belongs to which column. So the columns are inferred from alignment: where text starts, across the whole page. On a real table — an invoice, a bank statement, an exported report — that recovers the structure well, because the producer aligned the columns. On prose or a heavily designed layout, it will not.",
  },
  {
    question: "My PDF came back as one column.",
    answer:
      "That means no consistent column alignment was found, which almost always means the page is prose rather than a table. The text is all there in one column — nothing was lost — but there was no grid to recover. If you only want the words, PDF to Text or PDF to Word will give you a better-shaped result.",
  },
  {
    question: "Do numbers come out as numbers?",
    answer:
      "Yes. Values that look numeric are written as real numbers so you can sum and sort them immediately, including ones carrying thousands separators, a leading currency symbol, or a trailing percent sign. Everything else is written as text.",
  },
  {
    question: "What about merged cells and multi-line rows?",
    answer:
      "Merged cells cannot be recovered — the merge exists in the original spreadsheet, not in the PDF. A cell whose text wrapped onto two lines in the PDF becomes two rows here, because visually that is what it is. Both are worth a quick tidy-up after opening the file.",
  },
  {
    question: "My PDF is a scan. Will this work?",
    answer:
      "No. A scan is a photograph of a page with no text in it at all, so there is nothing to read and no columns to detect. Extracting it would need OCR, which this tool deliberately does not do. The tool detects this case and tells you rather than handing back an empty workbook.",
  },
  {
    question: "Should I choose one sheet per page or everything in one?",
    answer:
      "One sheet per page keeps each page's table separate and is the safer default. Choose a single sheet when one long table runs across many pages — a statement or a ledger — so the rows end up contiguous and sortable.",
  },
  {
    question: "Is my PDF uploaded?",
    answer:
      "No. The text layer is read with pdf.js in your browser and the .xlsx is zipped together in memory. Statements, invoices and reports stay on your machine.",
  },
];

export default function PdfToExcelPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="pdf-to-excel"
      title="PDF to Excel"
      description="Pull the tables out of a PDF into an editable .xlsx workbook, with columns reconstructed from the page."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "PDF to Excel" },
      ]}
      steps={[
        "Drop your PDF into the box above — it stays on your device.",
        "Choose one sheet per page, or everything in a single sheet.",
        "Convert, then open the .xlsx in Excel, LibreOffice or Sheets.",
      ]}
      articleContent={
        <>
          <h2>There is no table in a PDF</h2>
          <p>
            That sentence is the whole tool. When you look at a table in a PDF you
            see rows, columns and borders. What the file actually contains is a
            set of characters, each with a position, plus some lines drawn on the
            page. There is no record anywhere that says &quot;these five values
            are a row&quot; or &quot;this is the Amount column&quot;.
          </p>
          <p>
            Every PDF-to-Excel converter, including the expensive ones, is
            therefore guessing. What separates a good result from a bad one is
            what the guess is based on.
          </p>

          <h2>How the columns are found</h2>
          <p>
            The strongest available evidence is alignment. Whoever produced the
            document lined its columns up, and that alignment survives into the
            coordinates.
          </p>
          <p>
            So every text run&apos;s left edge is collected across the page and
            those positions are clustered: runs starting at roughly the same place
            belong to the same column. A cluster has to be used by more than one
            row before it counts, which stops a single indented line inventing a
            column and shifting everything after it. Rows come from shared
            baselines, and each run is then placed in the column it starts at.
          </p>
          <p>
            The tolerances scale with the text size, so a six-point bank statement
            and a fourteen-point report both group sensibly rather than needing a
            setting you would have to guess at.
          </p>

          <h2>Where it works well, and where it does not</h2>
          <p>
            <strong>Well:</strong> invoices, bank and card statements, exported
            reports, price lists, timetables, results tables — anything generated
            by software from data, which is most tables that end up in a PDF.
          </p>
          <p>
            <strong>Poorly:</strong> prose, which correctly comes out as a single
            column; multi-column magazine layouts; and tables where cells span
            columns, since the merge only ever existed in the original document.
          </p>
          <p>
            A cell whose text wrapped onto two lines in the PDF becomes two rows,
            because on the page that is genuinely what it is. Expect a little
            tidying after opening the file — the point is to skip the retyping,
            not to skip reading the result.
          </p>

          <h2>Numbers stay numbers</h2>
          <p>
            A workbook where every figure is text is nearly useless: nothing sums,
            nothing sorts. Values that look numeric are written as real numbers,
            including ones with thousands separators, a leading currency symbol or
            a trailing percent sign. That means you can select a column and get a
            total straight away.
          </p>

          <h2>Not OCR</h2>
          <p>
            This reads the text layer that is already in the file. A scanned page
            has none — it is a picture — and no amount of column detection helps
            when there are no characters to position. The tool reports that
            clearly instead of producing an empty workbook.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Getting a bank or card statement into a spreadsheet for reconciliation</li>
            <li>Turning an invoice&apos;s line items into rows you can total</li>
            <li>Recovering data from a report whose source file is gone</li>
            <li>Pulling a published results or price table into a working file</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            Everything runs in your browser. Financial documents are the most
            common input to a tool like this, and they are precisely what should
            not be uploaded to a stranger&apos;s server.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <PdfToExcelTool />
    </ToolPageShell>
  );
}
