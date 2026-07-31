import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import CategoryIndex from "@/components/CategoryIndex";
import { findCategory } from "@/lib/tools";

const category = findCategory("image");

export const metadata: Metadata = pageMetadata({
  title: "Image Tools — Compress, Resize & Convert",
  description:
    "Free browser-based image tools. Compress to an exact KB target, resize to precise pixel or millimeter dimensions. No uploads.",
  path: "/image/",
  brandSuffix: true,
});

export default function ImageCategoryPage() {
  if (!category) notFound();
  return <CategoryIndex category={category} />;
}
