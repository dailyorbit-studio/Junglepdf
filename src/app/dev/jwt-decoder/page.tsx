import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import JwtDecoderTool from "./JwtDecoderTool";

export const metadata: Metadata = toolMetadata({
  category: "dev",
  slug: "jwt-decoder",
  title: "JWT Decoder — Read Any JSON Web Token Online",
  description:
    "Decode a JSON Web Token to inspect its header, payload and expiry. Runs entirely in your browser — your token is never uploaded to a server.",
});

const FAQ_ITEMS = [
  {
    question: "Is my token uploaded anywhere?",
    answer:
      "No. The token is split and base64url-decoded in your browser using JavaScript. It never crosses the network, which is what makes it safe to paste a real token from your own app.",
  },
  {
    question: "Does this verify the signature?",
    answer:
      "No — it only decodes. Verifying a JWT requires the signing secret or public key and has to happen on a trusted server, never in a public web page. This tool shows you what a token contains, which is a separate job from proving it is authentic.",
  },
  {
    question: "Why can anyone read my token's contents?",
    answer:
      "A JWT's header and payload are only base64url-encoded, not encrypted. Encoding is not encryption. That is exactly why you must never store passwords, secrets or sensitive personal data inside a JWT payload — treat everything in it as public.",
  },
  {
    question: "What do exp and iat mean?",
    answer:
      "They are registered claims: exp is the expiry time and iat is the issued-at time, both as Unix timestamps (seconds since 1970). The tool converts them to your local time and tells you whether the token has already expired.",
  },
];

export default function JwtDecoderPage() {
  return (
    <ToolPageShell
      category="dev"
      slug="jwt-decoder"
      title="JWT Decoder"
      description="Decode a JSON Web Token to read its header, payload and expiry. Nothing is uploaded — decoding happens in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Developer", href: "/dev" },
        { label: "JWT Decoder" },
      ]}
      steps={[
        "Paste your JWT into the box — it stays in your browser.",
        "Read the decoded header and payload below, formatted as JSON.",
        "Check the expiry and issued-at times, shown in your local time.",
      ]}
      articleContent={
        <>
          <h2>What a JWT actually is</h2>
          <p>
            A JSON Web Token is three base64url-encoded strings joined by dots:
            a header, a payload, and a signature. The header and payload are
            plain JSON that has been encoded, not encrypted — so decoding them
            back to readable JSON needs no key and no server. This tool does
            exactly that split-and-decode in your browser.
          </p>
          <h2>Decoding is not verifying</h2>
          <p>
            Reading a token and trusting a token are two different things.
            Anyone can decode the payload; only the party holding the signing
            key can confirm the signature is genuine. That check belongs on your
            backend, where the secret lives. Use this decoder to inspect and
            debug what a token carries — the claims, the algorithm, the expiry —
            not to authenticate it.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <JwtDecoderTool />
    </ToolPageShell>
  );
}
