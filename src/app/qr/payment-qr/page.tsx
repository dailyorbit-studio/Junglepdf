import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import PaymentQrTool from "./PaymentQrTool";

export const metadata: Metadata = toolMetadata({
  category: "qr",
  slug: "payment-qr",
  title: "UPI Payment QR Code Generator — Scan to Pay",
  description:
    "Generate a UPI payment QR with your UPI ID, name and an optional amount, scannable by any UPI app. Runs in your browser — nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Which apps can scan this?",
    answer:
      "Any UPI-enabled app — Google Pay, PhonePe, Paytm, BHIM and bank apps — because it encodes the standard upi:// payment link that all of them understand.",
  },
  {
    question: "Should I set an amount?",
    answer:
      "Only if it is fixed. Leave the amount blank for a general 'pay me' code where the payer types the sum, or set it for a specific price so they just confirm.",
  },
  {
    question: "Is this safe? Is my UPI ID uploaded?",
    answer:
      "Your UPI ID (VPA) is designed to be shared to receive money — it does not let anyone withdraw funds. The QR is built entirely in your browser and nothing is uploaded.",
  },
];

export default function PaymentQrPage() {
  return (
    <ToolPageShell
      category="qr"
      slug="payment-qr"
      title="Payment QR Code"
      description="Generate a UPI payment QR with your ID, name and an optional amount. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "QR Codes", href: "/qr" },
        { label: "Payment QR Code" },
      ]}
      steps={["Enter your UPI ID and name.", "Set an amount, or leave it open.", "Download the QR to display or print."]}
      articleContent={
        <>
          <h2>Accept UPI payments with a QR</h2>
          <p>
            A UPI QR encodes your UPI ID in the standard payment format, so any
            UPI app can scan it and pay you. Set a fixed amount for a specific
            price, or leave it open so the payer enters the sum — handy for a
            shop counter, an invoice or a donation.
          </p>
          <h2>Built on your device</h2>
          <p>
            The code is generated locally and nothing is uploaded. Your UPI ID is
            meant to be shared to receive money and cannot be used to take money
            out, so displaying the QR is safe. Add a note to tag the payment to an
            order or purpose.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <PaymentQrTool />
    </ToolPageShell>
  );
}
