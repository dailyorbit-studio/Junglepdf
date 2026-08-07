import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import CategoryIndex from "@/components/CategoryIndex";
import { findCategory } from "@/lib/tools";

const category = findCategory("resume");

export const metadata: Metadata = pageMetadata({
  title: "Resume Tools — Builder, Cover Letter & ATS Checker",
  description:
    "Free resume tools: build a resume and cover letter, and check them for common issues and ATS keywords. Everything runs in your browser — your details are never uploaded.",
  path: "/resume/",
  brandSuffix: true,
});

export default function ResumeCategoryPage() {
  if (!category) notFound();
  return <CategoryIndex category={category} />;
}
