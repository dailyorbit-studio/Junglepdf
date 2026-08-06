import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import CategoryIndex from "@/components/CategoryIndex";
import { findCategory } from "@/lib/tools";

const category = findCategory("calc");

export const metadata: Metadata = pageMetadata({
  title: "Calculators — EMI, SIP, GST, Percentage & Dates",
  description:
    "Free online calculators for loans, investments, tax and dates: EMI, SIP, FD, GST, percentage, age and more. Everything runs in your browser — nothing is uploaded.",
  path: "/calc/",
  brandSuffix: true,
});

export default function CalcCategoryPage() {
  if (!category) notFound();
  return <CategoryIndex category={category} />;
}
