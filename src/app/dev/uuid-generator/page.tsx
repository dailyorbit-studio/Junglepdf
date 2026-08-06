import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import UuidGeneratorTool from "./UuidGeneratorTool";

export const metadata: Metadata = toolMetadata({
  category: "dev",
  slug: "uuid-generator",
  title: "UUID Generator — Random v4 UUIDs, Free & Online",
  description:
    "Generate cryptographically random version 4 UUIDs, one or hundreds at a time. Runs in your browser with crypto.randomUUID — no server, nothing logged.",
});

const FAQ_ITEMS = [
  {
    question: "Are these UUIDs random enough to be unique?",
    answer:
      "Yes. They come from the browser's crypto.randomUUID (or crypto.getRandomValues as a fallback), which is a cryptographically secure random source. A version 4 UUID has 122 random bits, so the odds of a collision are negligible for any realistic number of IDs.",
  },
  {
    question: "What is a version 4 UUID?",
    answer:
      "It is a 128-bit identifier where almost every bit is random, apart from a few fixed bits that mark it as version 4. It is the format you want when you just need a unique ID and do not need it to encode a timestamp or MAC address.",
  },
  {
    question: "Is anything sent to a server?",
    answer:
      "No. Generation happens entirely in your browser. No UUID you create here is ever transmitted or stored anywhere, so it is safe to generate IDs for private systems.",
  },
  {
    question: "Can I generate them in bulk?",
    answer:
      "Yes — set the count up to 1000 and copy them all at once. Use the toggles to switch case, add braces, or drop the hyphens to match the format your database or language expects.",
  },
];

export default function UuidGeneratorPage() {
  return (
    <ToolPageShell
      category="dev"
      slug="uuid-generator"
      title="UUID Generator"
      description="Generate random version 4 UUIDs one at a time or in bulk. Everything happens in your browser — nothing is logged."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Developer", href: "/dev" },
        { label: "UUID Generator" },
      ]}
      steps={[
        "Choose how many UUIDs you need.",
        "Toggle case, hyphens or braces to match your format.",
        "Click Generate and copy them all.",
      ]}
      articleContent={
        <>
          <h2>Where UUIDs come from here</h2>
          <p>
            Every UUID on this page is produced by your browser&apos;s built-in
            cryptographic random number generator — the same source used for
            security-sensitive work. There is no server involved and no shared
            sequence, so two people generating IDs at the same moment will not
            clash.
          </p>
          <h2>When to reach for a v4 UUID</h2>
          <p>
            Version 4 is the right default when you need a unique identifier and
            nothing more: primary keys, request IDs, idempotency keys, file
            names. If you specifically need IDs that sort by creation time you
            would want a time-based scheme instead, but for the common case —
            &quot;give me something unique&quot; — v4 is exactly it.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <UuidGeneratorTool />
    </ToolPageShell>
  );
}
