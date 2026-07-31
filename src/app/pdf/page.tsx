import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import CategoryIndex from "@/components/CategoryIndex";
import { findCategory } from "@/lib/tools";

const category = findCategory("pdf");

export const metadata: Metadata = pageMetadata({
  title: "PDF Tools — Merge, Split, Compress & Convert",
  description:
    "Free browser-based PDF tools. Merge documents, extract page ranges, reduce file size. Nothing is uploaded — safe for confidential files.",
  path: "/pdf/",
  brandSuffix: true,
});

export default function PdfCategoryPage() {
  if (!category) notFound();
  return <CategoryIndex category={category} />;
}
