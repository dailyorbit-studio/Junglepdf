"use client";

import { useMemo, useState } from "react";
import QrResult from "@/components/QrResult";
import { Field } from "@/components/SeoForm";

export default function PaymentQrTool() {
  const [vpa, setVpa] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const payload = useMemo(() => {
    if (!vpa) return "";
    const parts = [
      `pa=${encodeURIComponent(vpa.trim())}`,
      name && `pn=${encodeURIComponent(name)}`,
      "cu=INR",
      amount && `am=${encodeURIComponent(amount)}`,
      note && `tn=${encodeURIComponent(note)}`,
    ].filter(Boolean);
    return `upi://pay?${parts.join("&")}`;
  }, [vpa, name, amount, note]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="UPI ID (VPA)" value={vpa} onChange={setVpa} placeholder="name@bank" />
        <Field label="Payee name (optional)" value={name} onChange={setName} placeholder="Your name or shop" />
        <Field label="Amount in ₹ (optional)" value={amount} onChange={setAmount} placeholder="199" hint="Leave blank to let the payer choose." />
        <Field label="Note (optional)" value={note} onChange={setNote} placeholder="Order #123" />
      </div>
      <QrResult value={payload} filename="upi-qr" />
    </div>
  );
}
