import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ExcelToPdfTool from "./ExcelToPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "excel-to-pdf",
  title: "Excel to PDF — Convert XLSX to PDF in Your Browser",
  description:
    "Convert an Excel workbook to PDF without uploading it. Every sheet, dates handled properly, landscape pages for wide tables. Free and runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "Will it look like my spreadsheet does in Excel?",
    answer:
      "No. You get the data as a clean table: values, rows and columns, with the first row optionally set as a header. Colours, borders, merged cells, conditional formatting, charts and images are not carried over, and columns are given equal width rather than the widths you set. For a pixel-exact copy, Excel's own Save as PDF is the right tool — it knows your print areas and page breaks.",
  },
  {
    question: "Do dates come out correctly?",
    answer:
      "Yes, and this is worth knowing about. Excel does not store dates as dates — it stores a day count from 1900 and marks the cell with a date format. A converter that ignores that prints 45678 instead of 2025-01-15. This one reads the workbook's style table, finds the cells formatted as dates or times, and converts them properly.",
  },
  {
    question: "What happens to formulas?",
    answer:
      "The last computed value is used. Every .xlsx caches the result of each formula alongside the formula itself, so a normal workbook converts with all its numbers intact. A file written by a program that never calculated the formulas will show blanks in those cells — nothing here evaluates formulas.",
  },
  {
    question: "My table has too many columns and the text is tiny.",
    answer:
      "Columns get equal width, so a wide sheet squeezes. Turn on landscape (it is on by default), set margins to narrow, and consider whether every column needs to be there. Beyond roughly a dozen columns, no page size will make it comfortable — that is a limit of the paper, not the converter.",
  },
  {
    question: "Does it support .xls or .csv?",
    answer:
      "Only .xlsx. The old .xls is a binary format from a different era and shares nothing with .xlsx but the name — open it in Excel, LibreOffice or Google Sheets and save as .xlsx first. For a CSV, use the TXT to PDF tool, or open it in a spreadsheet program and export .xlsx.",
  },
  {
    question: "Is my workbook uploaded?",
    answer:
      "No. The .xlsx is unzipped and its XML read inside your browser, and the PDF is built in memory. Spreadsheets hold payroll, pricing, customer lists and financial models — exactly what should not be sent to someone else's server for a format conversion.",
  },
];

export default function ExcelToPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="excel-to-pdf"
      title="Excel to PDF"
      description="Turn an Excel workbook into a PDF table — every sheet, with dates and formula results intact."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Excel to PDF" },
      ]}
      steps={[
        "Drop your .xlsx file into the box above — it stays on your device.",
        "Choose landscape, header row and whether to include every sheet.",
        "Convert and download the PDF.",
      ]}
      articleContent={
        <>
          <h2>A spreadsheet is data; a PDF is a document</h2>
          <p>
            Sending a workbook sends a working file: formulas someone can break,
            columns they can hide, numbers they can change. Sending a PDF sends a
            statement of what the numbers were. That is why finance, procurement
            and reporting workflows all end in a PDF even when the work was done
            in Excel.
          </p>
          <p>
            It also solves the plainer problem of the recipient not having Excel,
            or opening it on a phone where a wide sheet is unreadable.
          </p>

          <h2>Reading .xlsx without a spreadsheet engine</h2>
          <p>
            An .xlsx file is a zip archive of XML. That is what makes this
            possible in a browser: the workbook lists its sheets, a relationship
            file maps them to their worksheet XML, and each worksheet holds its
            cells. Text is stored once in a shared-string table and referenced by
            index, because spreadsheets repeat themselves enormously.
          </p>
          <p>
            All of that can be read with the zip library and XML parser already
            present, which keeps the tool light. What a full spreadsheet library
            would add — formula evaluation, charts, pivot tables — is not needed
            when the destination is a printed table.
          </p>

          <h2>The date problem</h2>
          <p>
            Excel has no date type. A date is a number — days elapsed since the
            start of 1900 — and the only thing marking it as a date is the
            cell&apos;s number format. Convert naively and every date in your
            document prints as a five-digit number.
          </p>
          <p>
            So the workbook&apos;s style table is read, the cells whose format is
            a date or a time are identified, and those numbers are converted back
            into readable dates. The conversion even reproduces Excel&apos;s
            famous 1900 leap-year bug, because every spreadsheet in existence
            depends on it and dates would otherwise land a day out.
          </p>

          <h2>Wide sheets</h2>
          <p>
            Columns are given equal width, since the widths you set in Excel are
            about screen space rather than paper. Landscape is on by default and
            makes a real difference; narrow margins add a little more. Past a
            dozen or so columns, though, a table stops fitting on a page in any
            orientation — at that point the honest answer is to split the sheet.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Sending a report as a fixed document rather than a live file</li>
            <li>Attaching figures to an application or a submission</li>
            <li>Printing a sheet from a machine with no spreadsheet software</li>
            <li>Archiving a monthly export in a format that will still open</li>
            <li>Sharing data with someone who should not edit it</li>
          </ul>

          <h2>Privacy</h2>
          <p>
            The workbook never leaves your device. Given what spreadsheets tend to
            contain — salaries, pricing, customer records — that matters more here
            than almost anywhere else on this site.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ExcelToPdfTool />
    </ToolPageShell>
  );
}
