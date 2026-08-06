import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import DiscountCalculatorTool from "./DiscountCalculatorTool";

export const metadata: Metadata = toolMetadata({
  category: "calc",
  slug: "discount-calculator",
  title: "Discount Calculator — Sale Price & Savings",
  description:
    "Find the sale price and the amount saved from an original price and a discount percentage. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How is the sale price calculated?",
    answer:
      "The discount amount is the percentage of the original price, and the sale price is what remains after subtracting it. A 25% discount on ₹2,000 saves ₹500, leaving ₹1,500.",
  },
  {
    question: "Can I check a store's '30% off' claim?",
    answer:
      "Yes — enter the original price and the advertised percentage to see the exact final price and saving, so you can confirm the till total matches the offer.",
  },
  {
    question: "Are my figures uploaded?",
    answer: "No. The calculation runs entirely in your browser.",
  },
];

export default function DiscountCalculatorPage() {
  return (
    <ToolPageShell
      category="calc"
      slug="discount-calculator"
      title="Discount Calculator"
      description="Find the sale price and the amount saved from a price and a discount. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calc" },
        { label: "Discount Calculator" },
      ]}
      steps={[
        "Enter the original price.",
        "Enter the discount percentage.",
        "See what you pay and what you save.",
      ]}
      articleContent={
        <>
          <h2>Know the real price before the till</h2>
          <p>
            &quot;40% off&quot; is easy to advertise and easy to mis-add in your
            head. Enter the original price and the discount and this calculator
            shows the exact amount you save and the price you actually pay, so
            there is no surprise at checkout.
          </p>
          <h2>Instant, and private</h2>
          <p>
            The result updates as you type, which makes it quick to compare two
            offers or check whether a bundle is really the better deal. It runs
            on your device, so nothing you enter is sent anywhere.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <DiscountCalculatorTool />
    </ToolPageShell>
  );
}
