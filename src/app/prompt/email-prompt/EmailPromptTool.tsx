"use client";

import { useMemo, useState } from "react";
import { Field, TextArea, Select } from "@/components/SeoForm";
import PromptResult from "@/components/PromptResult";

export default function EmailPromptTool() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("Professional");
  const [points, setPoints] = useState("");
  const [length, setLength] = useState("Concise");

  const prompt = useMemo(() => {
    if (!purpose.trim()) return "";
    let out = `Write a ${tone.toLowerCase()} email to ${recipient.trim() || "the recipient"} about ${purpose.trim()}.`;
    if (points.trim()) out += `\nInclude these points:\n${points.trim()}`;
    out += `\n\nKeep it ${length.toLowerCase()}, suggest a clear subject line, and end with a specific call to action.`;
    return out;
  }, [purpose, recipient, tone, points, length]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Purpose" value={purpose} onChange={setPurpose} placeholder="following up on a job application" />
        <Field label="Recipient" value={recipient} onChange={setRecipient} placeholder="the hiring manager" />
      </div>
      <TextArea label="Key points (optional)" value={points} onChange={setPoints} rows={4} placeholder="Applied last week; very interested; available for a call" />
      <div className="grid gap-4 md:grid-cols-2">
        <Select label="Tone" value={tone} onChange={setTone} options={["Professional", "Friendly", "Formal", "Apologetic", "Persuasive", "Warm"].map((v) => ({ value: v, label: v }))} />
        <Select label="Length" value={length} onChange={setLength} options={["Very short", "Concise", "Detailed"].map((v) => ({ value: v, label: v }))} />
      </div>
      <PromptResult text={prompt} />
    </div>
  );
}
