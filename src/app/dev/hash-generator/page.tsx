import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import HashGeneratorTool from "./HashGeneratorTool";

export const metadata: Metadata = toolMetadata({
  category: "dev",
  slug: "hash-generator",
  title: "Hash Generator — SHA-256, SHA-512 & More Online",
  description:
    "Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes of any text, live as you type. Uses the browser's Web Crypto API — your input never leaves your device.",
});

const FAQ_ITEMS = [
  {
    question: "Where is the hashing done?",
    answer:
      "In your browser, using the built-in Web Crypto (SubtleCrypto) API — the same primitives the browser uses for TLS. Your input is never uploaded, so it is safe to hash sensitive strings.",
  },
  {
    question: "Why is there no MD5 option?",
    answer:
      "MD5 is cryptographically broken and browsers deliberately leave it out of the Web Crypto API. For anything security-related use SHA-256 or stronger; MD5 should only ever appear when a legacy system forces it.",
  },
  {
    question: "Are these hashes reversible?",
    answer:
      "No. A cryptographic hash is one-way — you cannot recover the input from the digest. That is the point: hashes are for verifying integrity and matching values, not for storing data you need back.",
  },
  {
    question: "Will the same text always give the same hash?",
    answer:
      "Yes. Hashing is deterministic, so identical input always produces an identical digest. Change a single character and the whole hash changes, which is what makes it useful as a fingerprint.",
  },
];

export default function HashGeneratorPage() {
  return (
    <ToolPageShell
      category="dev"
      slug="hash-generator"
      title="Hash Generator"
      description="Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes of any text, live. Runs in your browser with the Web Crypto API."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Developer", href: "/dev" },
        { label: "Hash Generator" },
      ]}
      steps={[
        "Type or paste the text you want to hash.",
        "Read the SHA-1, SHA-256, SHA-384 and SHA-512 digests.",
        "Copy the one you need.",
      ]}
      articleContent={
        <>
          <h2>A fingerprint for any text</h2>
          <p>
            A cryptographic hash reduces any input to a fixed-length string that
            changes completely if even one character of the input changes. That
            makes it a fingerprint: two pieces of text match if and only if their
            hashes match. This tool computes four SHA variants at once so you can
            grab whichever a given system expects.
          </p>
          <h2>Computed with real primitives, locally</h2>
          <p>
            The digests come from the browser&apos;s Web Crypto API — the same
            audited implementation used for secure connections — not a
            reimplementation. And because it runs on your device, the text you
            hash is never transmitted, so this is safe for values you would not
            paste into an online service.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <HashGeneratorTool />
    </ToolPageShell>
  );
}
