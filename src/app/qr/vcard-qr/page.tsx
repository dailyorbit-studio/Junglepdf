import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import VcardQrTool from "./VcardQrTool";

export const metadata: Metadata = toolMetadata({
  category: "qr",
  slug: "vcard-qr",
  title: "vCard QR Code Generator — Digital Business Card",
  description:
    "Put your contact details into a QR code that saves straight to a phone's contacts. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "What happens when someone scans it?",
    answer:
      "Their phone recognises the vCard and offers to add you as a new contact, with the name, phone, email and other fields already filled in — no typing.",
  },
  {
    question: "Which fields should I include?",
    answer:
      "Name, phone and email cover most needs; organisation, job title and website are optional. Only the fields you fill in are added to the code, keeping it as small and reliable as possible.",
  },
  {
    question: "Is my contact information uploaded?",
    answer: "No. The vCard and QR are generated entirely on your device.",
  },
];

export default function VcardQrPage() {
  return (
    <ToolPageShell
      category="qr"
      slug="vcard-qr"
      title="vCard QR Code"
      description="Put your contact details into a QR code that saves straight to a phone. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "QR Codes", href: "/qr" },
        { label: "vCard QR Code" },
      ]}
      steps={["Fill in your contact details.", "The QR updates as you type.", "Download it for your card, email signature or badge."]}
      articleContent={
        <>
          <h2>A business card people can actually save</h2>
          <p>
            A vCard QR encodes your details in the standard contact format every
            phone understands, so a single scan offers to save you as a contact —
            far more reliable than someone squinting at a card and typing it in.
            It is ideal for business cards, email signatures and event badges.
          </p>
          <h2>Only what you enter, kept local</h2>
          <p>
            The code includes just the fields you complete, so it stays compact
            and scans quickly. Everything is assembled in your browser, meaning
            your contact information is never uploaded anywhere.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <VcardQrTool />
    </ToolPageShell>
  );
}
