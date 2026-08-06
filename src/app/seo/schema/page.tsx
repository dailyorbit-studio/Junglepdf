import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import SchemaTool from "./SchemaTool";

export const metadata: Metadata = toolMetadata({
  category: "seo",
  slug: "schema",
  title: "Schema Markup Generator — JSON-LD Structured Data",
  description:
    "Generate valid schema.org JSON-LD for organisations, articles, products, FAQs and more. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What is schema markup for?",
    answer:
      "Structured data describes your page to search engines in a machine-readable way, which can unlock rich results — star ratings, FAQ dropdowns, article cards. It does not directly boost ranking, but the enhanced listings can lift click-through.",
  },
  {
    question: "Why JSON-LD rather than microdata?",
    answer:
      "JSON-LD is Google's recommended format. It sits in a single script tag in your head rather than being woven through your HTML, which keeps it easy to add, edit and validate independently of your markup.",
  },
  {
    question: "Should I validate the output?",
    answer:
      "Yes. After adding it, run the page through Google's Rich Results Test or the Schema.org validator to confirm it is eligible and error-free — this generator produces valid JSON-LD, but only you know if the values are accurate.",
  },
];

export default function SchemaPage() {
  return (
    <ToolPageShell
      category="seo"
      slug="schema"
      title="Schema Markup Generator"
      description="Generate JSON-LD structured data for organisations, articles, FAQs and more. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "SEO", href: "/seo" },
        { label: "Schema Markup Generator" },
      ]}
      steps={[
        "Pick the schema type that fits your page.",
        "Fill in the fields.",
        "Copy the JSON-LD script into your <head>.",
      ]}
      articleContent={
        <>
          <h2>Describe your page to search engines</h2>
          <p>
            Structured data tells search engines exactly what a page is about — an
            article, a product, an organisation, a set of FAQs — in a format they
            can parse directly. That understanding is what makes rich results
            possible. This generator builds valid schema.org JSON-LD for several
            common types from a simple form.
          </p>
          <h2>Valid markup, accurate values</h2>
          <p>
            The output is well-formed JSON-LD in a ready-to-paste script tag. The
            generator guarantees the structure is correct; making sure the values
            match your page is up to you, so validate the result with Google&apos;s
            Rich Results Test before relying on it. It all runs on your device.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <SchemaTool />
    </ToolPageShell>
  );
}
