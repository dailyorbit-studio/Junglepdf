import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import CategoryIndex from "@/components/CategoryIndex";
import { findCategory } from "@/lib/tools";

const category = findCategory("qr");

export const metadata: Metadata = pageMetadata({
  title: "QR Code Tools — Generate & Scan QR Codes Free",
  description:
    "Free QR code generators for links, WiFi, WhatsApp, contacts and UPI payments, plus a camera QR scanner and barcode generator. Everything runs in your browser — nothing uploaded.",
  path: "/qr/",
  brandSuffix: true,
});

export default function QrCategoryPage() {
  if (!category) notFound();
  return <CategoryIndex category={category} />;
}
