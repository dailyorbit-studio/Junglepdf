import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import CategoryIndex from "@/components/CategoryIndex";
import { findCategory } from "@/lib/tools";

const category = findCategory("text");

export const metadata: Metadata = pageMetadata({
  title: "Text Tools — Sort, Count, Convert Case & Clean Text",
  description:
    "Free browser-based text utilities: remove duplicate lines, sort alphabetically, count words, change case, generate slugs and more. Nothing is uploaded — it all runs as you type.",
  path: "/text/",
  brandSuffix: true,
});

export default function TextCategoryPage() {
  if (!category) notFound();
  return <CategoryIndex category={category} />;
}
