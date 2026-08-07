import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import ScanQrTool from "./ScanQrTool";

export const metadata: Metadata = toolMetadata({
  category: "qr",
  slug: "scan-qr",
  title: "QR Code Scanner — Scan QR With Your Camera",
  description:
    "Scan a QR code with your camera or from an image and read what it contains — no app to install. Everything is decoded on your device; nothing is uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "Do I need to install an app?",
    answer:
      "No. The scanner runs in your browser using your device's camera. Grant camera permission when prompted and point it at a QR code.",
  },
  {
    question: "Is the camera feed uploaded?",
    answer:
      "No. Every frame is analysed on your device and immediately discarded. Nothing from your camera — no image, no video — is ever sent to a server.",
  },
  {
    question: "Can I scan a QR from a saved image?",
    answer:
      "Yes. Use “Scan from image” to pick a screenshot or photo, and it decodes the QR from the file, which is handy on a desktop without a camera.",
  },
  {
    question: "Why won't the camera start?",
    answer:
      "The most common reason is a denied camera permission, or a browser that blocks the camera on insecure pages. On this site the connection is secure, so check the site's camera permission in your browser settings, or use the image option.",
  },
];

export default function ScanQrPage() {
  return (
    <ToolPageShell
      category="qr"
      slug="scan-qr"
      title="Scan QR Code"
      description="Scan a QR code with your camera and read what it contains. Everything is decoded on your device."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "QR Codes", href: "/qr" },
        { label: "Scan QR Code" },
      ]}
      steps={["Tap Start camera and allow access.", "Point it at a QR code.", "Read the result — links become tappable."]}
      articleContent={
        <>
          <h2>Read any QR, no app required</h2>
          <p>
            Point your camera at a QR code and this scanner decodes it live in the
            browser, showing exactly what it contains. If it is a link, the result
            is tappable; if it is text, WiFi details or a contact, you see the raw
            content. There is nothing to install.
          </p>
          <h2>Nothing leaves your device</h2>
          <p>
            Each camera frame is analysed on your device and thrown away
            immediately — no image or video is uploaded. On a computer without a
            camera, the “Scan from image” option decodes a QR from a screenshot or
            photo instead, with the same privacy.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <ScanQrTool />
    </ToolPageShell>
  );
}
