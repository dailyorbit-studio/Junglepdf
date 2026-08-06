import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import CategoryIndex from "@/components/CategoryIndex";
import { findCategory } from "@/lib/tools";

const category = findCategory("seo");

export const metadata: Metadata = pageMetadata({
  title: "SEO Tools — Meta Tags, Robots, Sitemap & Schema",
  description:
    "Free SEO generators: meta tags, Open Graph, Twitter cards, robots.txt, XML sitemaps, canonical tags and schema markup. Fill the form and copy the code. Runs in your browser.",
  path: "/seo/",
  brandSuffix: true,
});

export default function SeoCategoryPage() {
  if (!category) notFound();
  return <CategoryIndex category={category} />;
}
