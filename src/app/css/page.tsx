import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import CategoryIndex from "@/components/CategoryIndex";
import { findCategory } from "@/lib/tools";

const category = findCategory("css");

export const metadata: Metadata = pageMetadata({
  title: "CSS Generators — Gradient, Shadow, Glass & More",
  description:
    "Free visual CSS generators: gradients, box-shadow, glassmorphism, neumorphism, border-radius, clip-path, grid and flexbox. Tune it live and copy the code. Runs in your browser.",
  path: "/css/",
  brandSuffix: true,
});

export default function CssCategoryPage() {
  if (!category) notFound();
  return <CategoryIndex category={category} />;
}
