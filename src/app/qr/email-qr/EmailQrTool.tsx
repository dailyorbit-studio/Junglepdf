"use client";

import { useMemo, useState } from "react";
import QrResult from "@/components/QrResult";
import { Field, TextArea } from "@/components/SeoForm";

export default function EmailQrTool() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const payload = useMemo(() => {
    if (!to) return "";
    const params = [
      subject && `subject=${encodeURIComponent(subject)}`,
      body && `body=${encodeURIComponent(body)}`,
    ].filter(Boolean);
    return `mailto:${to.trim()}${params.length ? `?${params.join("&")}` : ""}`;
  }, [to, subject, body]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Email address" value={to} onChange={setTo} placeholder="hello@example.com" />
        <Field label="Subject (optional)" value={subject} onChange={setSubject} placeholder="Enquiry" />
        <TextArea label="Body (optional)" value={body} onChange={setBody} rows={4} placeholder="Hi, I'd like to ask about…" />
      </div>
      <QrResult value={payload} filename="email-qr" />
    </div>
  );
}
