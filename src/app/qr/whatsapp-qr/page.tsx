import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import WhatsappQrTool from "./WhatsappQrTool";

export const metadata: Metadata = toolMetadata({
  category: "qr",
  slug: "whatsapp-qr",
  title: "WhatsApp QR Code Generator — Click to Chat",
  description:
    "Create a QR code that opens a WhatsApp chat with your number and a prefilled message. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How do I enter the phone number?",
    answer:
      "Digits only, with the country code and no plus sign or spaces — for example 919876543210 for an Indian number. The tool strips anything that is not a digit before building the link.",
  },
  {
    question: "Does the person need my number saved?",
    answer:
      "No. Scanning opens a chat with your number directly, even if it is not in their contacts, which is exactly what makes this useful on a shopfront or a flyer.",
  },
  {
    question: "Is my number uploaded?",
    answer: "No. The wa.me link and QR are built entirely in your browser.",
  },
];

export default function WhatsappQrPage() {
  return (
    <ToolPageShell
      category="qr"
      slug="whatsapp-qr"
      title="WhatsApp QR Code"
      description="Create a QR code that opens a WhatsApp chat with a prefilled message. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "QR Codes", href: "/qr" },
        { label: "WhatsApp QR Code" },
      ]}
      steps={["Enter your number with country code.", "Add a prefilled message if you want.", "Download the QR for your flyer or shopfront."]}
      articleContent={
        <>
          <h2>One scan to a conversation</h2>
          <p>
            A WhatsApp QR encodes a wa.me link, so scanning it opens a chat with
            you — optionally with a message already typed. It removes the friction
            of saving a number first, which is why it works so well on packaging,
            posters and business cards.
          </p>
          <h2>Built on your device</h2>
          <p>
            The link and code are generated locally, so your number is never
            uploaded. The result is a plain, permanent QR that keeps working
            regardless of this site. Add a prefilled message to guide the first
            reply — an order enquiry, a booking, a question.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <WhatsappQrTool />
    </ToolPageShell>
  );
}
