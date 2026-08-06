import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import CategoryIndex from "@/components/CategoryIndex";
import { findCategory } from "@/lib/tools";

const category = findCategory("dev");

export const metadata: Metadata = pageMetadata({
  title: "Developer Tools — JWT, JSON, Base64, Regex & More",
  description:
    "Free browser-based developer utilities: decode JWTs, format JSON and SQL, generate UUIDs and hashes, test regex. Nothing is uploaded — your tokens and queries stay local.",
  path: "/dev/",
  brandSuffix: true,
});

export default function DevCategoryPage() {
  if (!category) notFound();
  return <CategoryIndex category={category} />;
}
