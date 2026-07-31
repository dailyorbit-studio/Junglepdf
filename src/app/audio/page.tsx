import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import CategoryIndex from "@/components/CategoryIndex";
import { findCategory } from "@/lib/tools";

const category = findCategory("audio");

export const metadata: Metadata = pageMetadata({
  title: "Audio Tools — Extract, Trim & Convert Audio",
  description:
    "Free browser-based audio tools. Extract MP3 from video, trim audio files to a custom range. No uploads — everything runs on your device.",
  path: "/audio/",
  brandSuffix: true,
});

export default function AudioCategoryPage() {
  if (!category) notFound();
  return <CategoryIndex category={category} />;
}
