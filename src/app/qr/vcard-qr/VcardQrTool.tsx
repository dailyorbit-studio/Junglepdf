"use client";

import { useMemo, useState } from "react";
import QrResult from "@/components/QrResult";
import { Field } from "@/components/SeoForm";

// vCard escaping: backslash, comma and semicolon are reserved.
const esc = (s: string) => s.replace(/([\\,;])/g, "\\$1").replace(/\n/g, "\\n");

export default function VcardQrTool() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const payload = useMemo(() => {
    if (!name && !phone && !email) return "";
    const lines = ["BEGIN:VCARD", "VERSION:3.0"];
    if (name) {
      lines.push(`N:${esc(name)}`);
      lines.push(`FN:${esc(name)}`);
    }
    if (org) lines.push(`ORG:${esc(org)}`);
    if (title) lines.push(`TITLE:${esc(title)}`);
    if (phone) lines.push(`TEL;TYPE=CELL:${esc(phone)}`);
    if (email) lines.push(`EMAIL:${esc(email)}`);
    if (url) lines.push(`URL:${esc(url)}`);
    lines.push("END:VCARD");
    return lines.join("\n");
  }, [name, phone, email, org, title, url]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Full name" value={name} onChange={setName} placeholder="Ada Lovelace" />
        <Field label="Phone" value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
        <Field label="Email" value={email} onChange={setEmail} placeholder="ada@example.com" />
        <Field label="Organisation (optional)" value={org} onChange={setOrg} placeholder="Example Ltd" />
        <Field label="Job title (optional)" value={title} onChange={setTitle} placeholder="Engineer" />
        <Field label="Website (optional)" value={url} onChange={setUrl} placeholder="https://example.com" />
      </div>
      <QrResult value={payload} filename="vcard-qr" />
    </div>
  );
}
