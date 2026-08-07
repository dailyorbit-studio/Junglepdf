import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import CategoryIndex from "@/components/CategoryIndex";
import { findCategory } from "@/lib/tools";

const category = findCategory("prompt");

export const metadata: Metadata = pageMetadata({
  title: "AI Prompt Generators — ChatGPT, Midjourney & More",
  description:
    "Free prompt generators for ChatGPT, Midjourney, resumes, emails and code. Build a structured prompt from a simple form and copy it. No AI runs here — just templates, in your browser.",
  path: "/prompt/",
  brandSuffix: true,
});

export default function PromptCategoryPage() {
  if (!category) notFound();
  return <CategoryIndex category={category} />;
}
