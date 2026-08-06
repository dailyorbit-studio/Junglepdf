import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ToolPageShell from "@/components/ToolPageShell";
import WifiQrTool from "./WifiQrTool";

export const metadata: Metadata = toolMetadata({
  category: "qr",
  slug: "wifi-qr",
  title: "WiFi QR Code Generator — Connect With One Scan",
  description:
    "Make a QR code that connects any phone to your WiFi with a single scan — no typing the password. Runs in your browser; your password is never uploaded.",
});

const FAQ_ITEMS = [
  {
    question: "How does scanning connect to WiFi?",
    answer:
      "The QR encodes your network name, password and security type in the standard WIFI: format that phone cameras understand. Scanning it offers a 'Connect to network' prompt, so nobody has to read out or type the password.",
  },
  {
    question: "Is my WiFi password safe?",
    answer:
      "Yes. The code is built entirely in your browser and the password is never sent anywhere. Print the QR for guests and only people who can see it can use it — the same as if you had written the password on a card.",
  },
  {
    question: "Which security type should I pick?",
    answer:
      "Almost every modern router uses WPA (which covers WPA2 and WPA3). Choose WEP only for very old networks, or None for a genuinely open network with no password.",
  },
];

export default function WifiQrPage() {
  return (
    <ToolPageShell
      category="qr"
      slug="wifi-qr"
      title="WiFi QR Code"
      description="Make a QR code that connects a phone to your WiFi with one scan. Runs entirely in your browser."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "QR Codes", href: "/qr" },
        { label: "WiFi QR Code" },
      ]}
      steps={["Enter your network name and password.", "Pick the security type.", "Download the QR and put it where guests can scan it."]}
      articleContent={
        <>
          <h2>Share WiFi without sharing the password aloud</h2>
          <p>
            A WiFi QR code encodes everything a phone needs to join your network —
            name, password and security type. Guests point their camera at it and
            tap connect; no one dictates a long password or types it wrong. It is
            ideal for a café, an office guest network, or a card on the fridge at
            home.
          </p>
          <h2>Built on your device</h2>
          <p>
            The password is encoded locally and never uploaded, so generating the
            code is as private as writing the password down yourself. Anyone who
            can see the printed QR can join — so place it where you would happily
            show the password, and no further.
          </p>
        </>
      }
      faqItems={FAQ_ITEMS}
    >
      <WifiQrTool />
    </ToolPageShell>
  );
}
