import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import CategoryIndex from "@/components/CategoryIndex";
import { findCategory } from "@/lib/tools";

const category = findCategory("color");

export const metadata: Metadata = pageMetadata({
  title: "Color Tools — Converters, Palettes & Contrast",
  description:
    "Free colour tools: HEX/RGB/HSL converters, palette and gradient generators, a contrast checker and a Tailwind shade generator. Everything runs in your browser.",
  path: "/color/",
  brandSuffix: true,
});

export default function ColorCategoryPage() {
  if (!category) notFound();
  return <CategoryIndex category={category} />;
}
