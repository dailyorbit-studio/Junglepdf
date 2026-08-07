"use client";

import { useMemo, useState } from "react";
import QrResult from "@/components/QrResult";
import { Field, TextArea } from "@/components/SeoForm";

export default function WhatsappQrTool() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const payload = useMemo(() => {
    const digits = phone.replace(/[^\d]/g, "");
    if (!digits) return "";
    return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  }, [phone, message]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field
          label="Phone number (with country code)"
          value={phone}
          onChange={setPhone}
          placeholder="919876543210"
          hint="Digits only, including the country code — no + or spaces."
        />
        <TextArea label="Prefilled message (optional)" value={message} onChange={setMessage} rows={4} placeholder="Hi! I saw your…" />
      </div>
      <QrResult value={payload} filename="whatsapp-qr" />
    </div>
  );
}
