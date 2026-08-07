"use client";

import { useMemo, useState } from "react";
import { Field, TextArea, Select } from "@/components/SeoForm";
import PromptResult from "@/components/PromptResult";

export default function ChatgptPromptTool() {
  const [role, setRole] = useState("");
  const [task, setTask] = useState("");
  const [context, setContext] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Professional");
  const [format, setFormat] = useState("Prose");

  const prompt = useMemo(() => {
    if (!task.trim()) return "";
    const lines: string[] = [];
    if (role.trim()) lines.push(`Act as ${role.trim()}.`);
    lines.push(task.trim().replace(/\s*\.?$/, "."));
    if (context.trim()) lines.push(`Context: ${context.trim()}`);
    if (audience.trim()) lines.push(`Audience: ${audience.trim()}.`);
    lines.push(`Tone: ${tone}.`);
    if (format !== "Prose") lines.push(`Format the response as ${format.toLowerCase()}.`);
    return lines.join("\n");
  }, [role, task, context, audience, tone, format]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Role (act as…)" value={role} onChange={setRole} placeholder="a senior marketing strategist" />
        <Field label="Audience (optional)" value={audience} onChange={setAudience} placeholder="small business owners" />
      </div>
      <TextArea label="Task — what should it do?" value={task} onChange={setTask} rows={3} placeholder="Write a 5-email welcome sequence for a new newsletter" />
      <TextArea label="Context (optional)" value={context} onChange={setContext} rows={3} placeholder="The newsletter is about sustainable gardening; readers are beginners." />
      <div className="grid gap-4 md:grid-cols-2">
        <Select label="Tone" value={tone} onChange={setTone} options={["Professional", "Friendly", "Persuasive", "Casual", "Formal", "Enthusiastic"].map((v) => ({ value: v, label: v }))} />
        <Select label="Output format" value={format} onChange={setFormat} options={["Prose", "Bullet points", "Numbered list", "Table", "Step-by-step", "JSON"].map((v) => ({ value: v, label: v }))} />
      </div>
      <PromptResult text={prompt} />
    </div>
  );
}
