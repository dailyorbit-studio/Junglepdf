import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import CurrencyTool from "./CurrencyTool";

export const metadata: Metadata = toolMetadata({
  category: "unit",
  slug: "currency",
  title: "Currency Converter — Offline, Editable Rate",
  description:
    "Convert between currencies using a built-in indicative rate you can edit with today's figure. Fully offline — no rate is fetched and nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Are the rates live?",
    answer:
      "No, and that is deliberate. This whole site promises that nothing leaves your device, and a live rate would mean calling a third-party service on every visit. Instead it ships an indicative snapshot you can edit — paste today's rate and the conversion is exact.",
  },
  {
    question: "How do I get an accurate conversion?",
    answer:
      "Look up the current rate for your pair and type it into the editable rate field. The tool then converts your amount at exactly that rate. The Reset button restores the built-in indicative figure.",
  },
  {
    question: "Is anything uploaded?",
    answer:
      "No. There is no network request at all — the conversion is pure arithmetic on your device.",
  },
];

export default function CurrencyPage() {
  return (
    <ToolPageShell
      category="unit"
      slug="currency"
      title="Currency Converter"
      description="Convert between currencies using an editable, offline reference rate. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Unit Converter", href: "/unit" },
        { label: "Currency Converter" },
      ]}
      steps={["Enter an amount and choose the currencies.", "Edit the rate to today's figure for accuracy.", "Read the converted amount."]}
      articleContent={
        <>
          <h2>A currency converter that respects the promise</h2>
          <p>
            Most currency converters phone a rate service on every keystroke. This
            one does not — because the entire point of this site is that your data
            never leaves your device. It ships with an indicative rate for each
            pair and lets you overwrite it with the current figure, so you get an
            exact conversion without any network call.
          </p>
          <h2>Edit the rate, get the exact answer</h2>
          <p>
            Look up today&apos;s rate, type it into the rate box, and the amount
            converts precisely. The built-in numbers are only a starting point,
            clearly labelled as indicative — useful for a rough figure, and the
            base for your own exact rate. It all runs locally, with nothing
            fetched or uploaded.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <CurrencyTool />
    </ToolPageShell>
  );
}
