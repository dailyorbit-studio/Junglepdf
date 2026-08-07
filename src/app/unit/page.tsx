import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import CategoryIndex from "@/components/CategoryIndex";
import { findCategory } from "@/lib/tools";

const category = findCategory("unit");

export const metadata: Metadata = pageMetadata({
  title: "Unit Converters — Length, Weight, Temperature & More",
  description:
    "Free unit converters for length, area, volume, weight, temperature, time and currency. Instant, accurate, and entirely in your browser — nothing is uploaded.",
  path: "/unit/",
  brandSuffix: true,
});

export default function UnitCategoryPage() {
  if (!category) notFound();
  return <CategoryIndex category={category} />;
}
