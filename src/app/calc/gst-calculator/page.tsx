import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import GstCalculatorTool from "./GstCalculatorTool";

export const metadata: Metadata = toolMetadata({
  category: "calc",
  slug: "gst-calculator",
  title: "GST Calculator — Add or Remove GST Online",
  description:
    "Add GST to a price or remove it from a GST-inclusive amount, at any rate, with the tax split into CGST and SGST. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What's the difference between add and remove?",
    answer:
      "Add GST starts from a pre-tax price and adds the tax on top. Remove GST starts from a total that already includes GST and works backwards to the base amount and the tax within it — useful when you only know the final price.",
  },
  {
    question: "Why is GST split into CGST and SGST?",
    answer:
      "For an intra-state sale, GST is shared equally between the central government (CGST) and the state (SGST), so an 18% rate is 9% CGST plus 9% SGST. For inter-state sales the same total appears as IGST instead.",
  },
  {
    question: "Are my amounts uploaded?",
    answer: "No. The calculation runs entirely in your browser.",
  },
];

export default function GstCalculatorPage() {
  return (
    <ToolPageShell
      category="calc"
      slug="gst-calculator"
      title="GST Calculator"
      description="Add or remove GST at any rate, with the tax split into CGST and SGST. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calc" },
        { label: "GST Calculator" },
      ]}
      steps={[
        "Choose Add GST or Remove GST.",
        "Enter the amount and pick a rate.",
        "Read the tax, the CGST/SGST split and the total.",
      ]}
      articleContent={
        <>
          <h2>GST, both ways round</h2>
          <p>
            Sometimes you have a price and need to add tax; sometimes you have a
            final, tax-included total and need to know the base and the tax
            within it. This calculator does both, at any rate, and always shows
            the CGST and SGST halves as well as the total — the breakdown an
            invoice needs.
          </p>
          <h2>Quick rates, private maths</h2>
          <p>
            The common slabs — 5%, 12%, 18% and 28% — are one tap away, or type
            any rate. Everything is worked out on your device, so pricing and
            invoice figures you enter never leave the page.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <GstCalculatorTool />
    </ToolPageShell>
  );
}
