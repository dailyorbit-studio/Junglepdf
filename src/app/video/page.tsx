import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import CategoryIndex from "@/components/CategoryIndex";
import { findCategory } from "@/lib/tools";

const category = findCategory("video");

export const metadata: Metadata = pageMetadata({
  title: "Video Tools — Trim, Convert, Compress & Mute",
  description:
    "Free browser-based video tools. Trim clips, convert formats, make GIFs, and remove audio tracks. No uploads — everything runs on your device.",
  path: "/video/",
  brandSuffix: true,
});

export default function VideoCategoryPage() {
  if (!category) notFound();
  return <CategoryIndex category={category} />;
}
