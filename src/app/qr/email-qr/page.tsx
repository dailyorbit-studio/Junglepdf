import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import EmailQrTool from "./EmailQrTool";

export const metadata: Metadata = toolMetadata({
  category: "qr",
  slug: "email-qr",
  title: "Email QR Code Generator — Scan to Email",
  description:
    "Make a QR code that opens a new email with the address, subject and body prefilled. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What does scanning do?",
    answer:
      "It opens the scanner's default email app with a new message addressed to you, and the subject and body filled in if you provided them. The sender just reviews and hits send.",
  },
  {
    question: "Can I prefill the subject and message?",
    answer:
      "Yes. Both are optional, but adding them makes it easy for people to reach you about a specific thing — an enquiry, a support request, an RSVP.",
  },
  {
    question: "Is anything uploaded?",
    answer: "No. The mailto link and QR are generated in your browser.",
  },
];

export default function EmailQrPage() {
  return (
    <ToolPageShell
      category="qr"
      slug="email-qr"
      title="Email QR Code"
      description="Make a QR code that opens a prefilled email to your address. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "QR Codes", href: "/qr" },
        { label: "Email QR Code" },
      ]}
      steps={["Enter your email address.", "Optionally set a subject and body.", "Download the QR to print or share."]}
      articleContent={
        <>
          <h2>Make it easy to email you</h2>
          <p>
            An email QR encodes a mailto link, so scanning it opens a fresh
            message addressed to you — with the subject and body already written
            if you set them. It turns &quot;email us&quot; on a poster or a stand
            into a single tap.
          </p>
          <h2>Generated locally</h2>
          <p>
            The link and code are built on your device, so nothing is uploaded.
            Prefilling the subject is a small touch that pays off — it routes
            enquiries and gives people a reason to actually send the message.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <EmailQrTool />
    </ToolPageShell>
  );
}
