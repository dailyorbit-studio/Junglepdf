import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import SignPdfTool from "./SignPdfTool";

export const metadata: Metadata = toolMetadata({
  category: "pdf",
  slug: "sign-pdf",
  title: "Sign PDF — Draw or Type a Signature Online, Free",
  description:
    "Add a signature to a PDF by drawing it or typing your name, then place it anywhere on the page. Runs in your browser — your document is never uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Is this a legally binding signature?",
    answer:
      "It can be, and that depends on jurisdiction and context rather than on technology. Under laws like the US ESIGN Act and the EU's eIDAS regulation, a simple electronic signature — including a drawn image of your name — is generally admissible for ordinary agreements. What it is not is a qualified or digital signature: it carries no certificate, so it cannot prove who applied it or that the document is unchanged since. High-value contracts, deeds, and anything requiring notarisation typically need more than this.",
  },
  {
    question: "What's the difference between this and a digital signature?",
    answer:
      "This stamps a picture onto the page. A digital signature applies a cryptographic hash bound to a certificate issued by a trusted authority, which lets any reader verify both the signer's identity and that not a byte has changed since. The second requires a certificate you obtain from a certificate authority, which is not something a web page can issue you.",
  },
  {
    question: "Can someone copy my signature out of the PDF?",
    answer:
      "Yes — as they could from any signed document, paper or digital. The signature is an image on the page and can be extracted with any PDF tool. That is a property of every image-based signature, not of this tool, and it is one reason high-stakes documents use certificate-based signing instead.",
  },
  {
    question: "Is my document uploaded to sign it?",
    answer:
      "No, and this is the main reason to use this rather than a signing service. The PDF is read into your browser, the signature is drawn on a canvas in the same tab, and pdf-lib embeds it locally. Your contract, its contents, and your signature never touch a server — with an online signing service, all three do.",
  },
  {
    question: "Can I sign more than one page?",
    answer:
      "One page per pass. Sign the document, then drop the signed file back in and sign the next page. Each pass builds on the last, so a three-signature document takes three runs and the result carries all three.",
  },
  {
    question: "The signature looks pixelated in the output.",
    answer:
      "Drawn signatures are captured at your screen's pixel density, so making one very large on the page can soften it. Draw slowly and use most of the width of the pad, then scale down rather than up — and if you need a crisp result at large sizes, the typed option renders at a much higher resolution.",
  },
];

export default function SignPdfPage() {
  return (
    <ToolPageShell
      category="pdf"
      slug="sign-pdf"
      title="Sign PDF"
      description="Draw or type a signature, place it anywhere on the page, and download the signed document."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "PDF", href: "/pdf" },
        { label: "Sign PDF" },
      ]}
      steps={[
        "Drop your PDF into the box above — it stays on your device.",
        "Draw your signature or type your name, then choose it.",
        "Click the page to place it, adjust the size, and download.",
      ]}
      articleContent={
        <>
          <h2>Signing without sending your contract anywhere</h2>
          <p>
            Signing a document online normally means uploading it. You hand a
            company your lease, your employment contract, or your NDA, along with
            an image of your signature, and trust their retention policy. For a
            routine form that may be fine. For anything sensitive it is a
            strange trade to make for what is, technically, a very small
            operation.
          </p>
          <p>
            Here the whole thing happens in the tab. The PDF is read into memory,
            the page is rendered so you can see where you are placing things, your
            signature is drawn onto a canvas, and pdf-lib embeds it into the
            document — all locally. Nothing is transmitted, so there is nothing
            stored, logged, or subpoenable afterwards.
          </p>

          <h2>Drawn or typed</h2>
          <p>
            <strong>Drawing</strong> gives you your actual signature, and works
            best with a finger on a phone or a stylus on a tablet — a mouse
            produces something that looks like a mouse drew it. The stroke is
            captured with pointer events, so it stays continuous even if your
            flourish overshoots the edge of the pad.
          </p>
          <p>
            <strong>Typing</strong> renders your name in a script face. It looks
            less personal but it is crisp at any size, which matters if the
            signature has to be large. Both paths produce the same thing: a PNG
            with a transparent background, trimmed to its ink, so nothing stamps a
            white box over the page underneath.
          </p>

          <h2>What this is, legally</h2>
          <p>
            Worth being precise about, because the word &ldquo;signature&rdquo;
            covers two quite different things.
          </p>
          <p>
            What this produces is a <strong>simple electronic signature</strong>.
            Under the US ESIGN Act, the EU&apos;s eIDAS regulation, and equivalent
            legislation elsewhere, an electronic mark made with intent to sign is
            generally valid for ordinary commercial agreements, and courts have
            upheld far less than a drawn signature — including typed names in
            emails.
          </p>
          <p>
            What it is <strong>not</strong> is a digital signature. That term means
            something specific: a cryptographic hash of the document, signed with a
            private key whose certificate was issued by a trusted authority. It
            proves both who signed and that nothing has changed since. It also
            requires a certificate you have to obtain from a certificate authority,
            which no web page can hand you.
          </p>
          <p>
            The practical rule: for a rental agreement, a permission slip, an
            invoice approval, or an NDA, this is almost certainly sufficient. For a
            property deed, a will, anything requiring notarisation, or anything
            where a counterparty may later dispute that they signed, get proper
            certificate-based signing.
          </p>

          <h2>How placement works</h2>
          <p>
            The page preview is rendered at screen resolution by pdf.js, and your
            placement is recorded as fractions of the page rather than pixels. That
            is what makes the position accurate regardless of the preview&apos;s
            scale — a signature you drop two-thirds across a 600-pixel preview
            lands two-thirds across the real page, whether that page is A4 or
            tabloid.
          </p>
          <p>
            The signature is stamped as an ordinary image object on top of the
            existing content. Nothing underneath is disturbed, the text stays
            selectable, and the rest of the document is byte-for-byte what it was.
          </p>

          <h2>Common uses</h2>
          <ul>
            <li>Signing a rental or employment agreement without printing it</li>
            <li>Returning a countersigned invoice or purchase order</li>
            <li>Adding initials to each page of an agreement</li>
            <li>Signing a permission slip or consent form on a phone</li>
            <li>Approving a document that would otherwise need a scanner</li>
          </ul>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <SignPdfTool />
    </ToolPageShell>
  );
}
