import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import CsvToPdfTool from "./CsvToPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "csv-to-pdf",
  title: "CSV to PDF — Turn a Spreadsheet Into a Printable Table",
  description:
    "Convert a CSV or TSV into a properly laid out PDF table with a repeating header row. The delimiter is detected automatically. Runs in your browser.",
});

const FAQ_ITEMS = [
  {
    question: "My file uses semicolons. Will it work?",
    answer:
      "Yes. The delimiter is detected from the file rather than assumed, so semicolon, tab and pipe separated files all work without being told. That covers essentially every European spreadsheet export.",
  },
  {
    question: "Can I keep the header visible on every page?",
    answer:
      "Yes — that is what the header row option does. The first row is drawn in bold and repeated at the top of each new page, so a long table stays readable rather than becoming anonymous rows after page one.",
  },
  {
    question: "Why is my table in landscape when I did not ask for it?",
    answer:
      "Because it has more than six columns, and portrait would leave each one too narrow to read. Set the orientation explicitly to portrait if you would rather have it that way.",
  },
  {
    question: "Some characters came out as question marks.",
    answer:
      "The standard PDF fonts cover Western European text only. Devanagari, Chinese, Japanese, Arabic, Greek and Cyrillic characters cannot be drawn with them, so they are replaced and the count is reported. This is a limitation of the built-in fonts rather than of the file.",
  },
  {
    question: "Is my data uploaded?",
    answer:
      "No. The CSV is read as text in your browser and the PDF is built there with pdf-lib. Nothing is transmitted.",
  },
];

export default function Page() {
  return (
    <ToolPageShell
      category="pdf"
      slug="csv-to-pdf"
      title="CSV to PDF"
      description="Lay a CSV out as a real table in a PDF, ready to print or send."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "CSV to PDF" },
      ]}
      steps={[
        "Drop in a CSV or TSV file",
        "Choose the page size and whether the first row is a header",
        "Convert, then download the PDF",
      ]}
      articleContent={
        <>
          <h2>The delimiter is detected, not assumed</h2>
          <p>
            A “comma-separated” file is frequently not comma-separated. Much of Europe
            uses the comma as a decimal separator, so spreadsheet software there exports
            with semicolons instead. Tab-separated exports are common from databases, and
            pipes turn up in log processing.
          </p>
          <p>
            Assuming a comma means those files parse as a single column, which looks like
            a broken tool rather than a wrong guess. This counts each candidate outside
            quoted regions and takes whichever is most common, which is right in
            essentially every real file.
          </p>
          <h2>Quoting, newlines and the awkward cases</h2>
          <p>
            The parser follows RFC 4180 properly: a quoted field can contain the
            delimiter, a line break, and doubled quotes standing in for a literal quote
            character. That matters because those are exactly the fields people forget
            about — an address with a comma in it, or a comment containing a full
            sentence with its own punctuation.
          </p>
          <p>
            Line endings are handled in all three forms, including the lone carriage
            return that old Mac software still occasionally produces and that naive
            parsers read as one enormous row.
          </p>
          <h2>Wide tables and orientation</h2>
          <p>
            Every column gets an equal share of the page width. That keeps the layout
            predictable, but it means a very wide table gives each column very little
            room — at portrait A4, seven columns leaves about 65 points each, which is
            roughly one short word per line.
          </p>
          <p>
            So orientation switches to landscape automatically past six columns. You can
            override that in either direction, and beyond about twelve columns the honest
            answer is that no page size will make it comfortable to read.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <CsvToPdfTool />
    </ToolPageShell>
  );
}
