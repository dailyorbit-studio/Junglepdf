import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import CsvToExcelTool from "./CsvToExcelTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "csv-to-excel",
  title: "CSV to Excel — Convert CSV to XLSX Without Mangling Data",
  description:
    "Turn a CSV into a real .xlsx workbook with every cell kept as text, so leading zeros survive and nothing is guessed into a date. No uploads.",
});

const FAQ_ITEMS = [
  {
    question: "Why are my numbers left-aligned and not adding up?",
    answer:
      "Because every cell is stored as text, which is the whole point — it is what stops Excel mangling identifiers. Select the columns that should be numeric and use Excel’s convert-to-number, and they will behave normally.",
  },
  {
    question: "Will this preserve leading zeros?",
    answer:
      "Yes. That is the main reason to use it. A value like 00123 stays 00123 rather than becoming 123, because nothing is ever interpreted as a number on import.",
  },
  {
    question: "Does it handle semicolon or tab separated files?",
    answer:
      "Yes. The delimiter is detected from the file contents, so European semicolon exports and tab-separated database dumps both work without any setting.",
  },
  {
    question: "Is there a row limit?",
    answer:
      "The practical limit is your browser’s memory, since the whole workbook is built in the tab. Very large files — hundreds of thousands of rows — may be slow or fail. Excel itself stops at 1,048,576 rows regardless.",
  },
  {
    question: "Is my data uploaded?",
    answer:
      "No. The CSV is parsed and the workbook assembled entirely in your browser. Nothing leaves your device.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="pdf"
      slug="csv-to-excel"
      title="CSV to Excel"
      description="Wrap a CSV in a real workbook — without Excel rewriting your data on the way in."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "CSV to Excel" },
      ]}
      steps={[
        "Drop in a CSV or TSV file",
        "Convert",
        "Download the .xlsx",
      ]}
      articleContent={
        <>
          <h2>The problem this actually solves</h2>
          <p>
            Opening a CSV directly in Excel runs an importer that guesses a type for
            every cell, and it guesses badly in ways that quietly destroy data. Leading
            zeros vanish, so a postcode or a phone number becomes a smaller number.
            Anything shaped like a date becomes one — the classic example being gene
            names such as SEPT1, which Excel has been turning into dates for two decades.
          </p>
          <p>
            Values with more than fifteen significant digits lose their tail. Text that
            looks like scientific notation is converted. None of this is announced; you
            find out later, if you are lucky.
          </p>
          <h2>Every cell as text</h2>
          <p>
            This writes each cell as an inline string in the workbook. Excel opens it
            with the values exactly as they appeared in the CSV, because there is no
            import step left to guess anything.
          </p>
          <p>
            The trade-off is that numbers arrive as text too, so they will not sum until
            you convert the columns you actually want numeric. That is a deliberate
            choice: converting the four columns you care about is a minute of work, and
            recovering a mangled identifier column is impossible.
          </p>
          <h2>What you get</h2>
          <p>
            A genuine .xlsx — a zipped set of XML parts following the Office Open XML
            spec, not a renamed CSV. It opens in Excel, LibreOffice, Numbers and Google
            Sheets, and the sheet is named after your file.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <CsvToExcelTool />
    </ToolPageShell>
  );
}
