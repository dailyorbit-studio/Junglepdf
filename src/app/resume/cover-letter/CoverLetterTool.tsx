"use client";

import { useMemo, useState } from "react";
import { Field, TextArea } from "@/components/SeoForm";
import CopyButton from "@/components/CopyButton";
import { downloadBlob } from "@/lib/download";

export default function CoverLetterTool() {
  const [yourName, setYourName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [manager, setManager] = useState("");
  const [points, setPoints] = useState("");

  const letter = useMemo(() => {
    if (!company.trim() || !role.trim()) return "";
    const greeting = `Dear ${manager.trim() || "Hiring Manager"},`;
    const p1 = `I am writing to express my strong interest in the ${role.trim()} position at ${company.trim()}. Having read the role, I am confident that my background makes me a strong fit.`;
    const p2 = points.trim()
      ? points.trim()
      : `Across my career I have consistently delivered results, and I am excited by the opportunity to bring that to ${company.trim()}.`;
    const p3 = `I would welcome the chance to discuss how I can contribute to ${company.trim()}. Thank you for your time and consideration.`;
    return `${greeting}\n\n${p1}\n\n${p2}\n\n${p3}\n\nSincerely,\n${yourName.trim() || "Your Name"}`;
  }, [yourName, company, role, manager, points]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" value={yourName} onChange={setYourName} placeholder="Ada Lovelace" />
          <Field label="Hiring manager (optional)" value={manager} onChange={setManager} placeholder="Ms. Rao" />
          <Field label="Company" value={company} onChange={setCompany} placeholder="Example Ltd" />
          <Field label="Role" value={role} onChange={setRole} placeholder="Frontend Developer" />
        </div>
        <TextArea
          label="Your pitch (optional)"
          value={points}
          onChange={setPoints}
          rows={5}
          placeholder="A paragraph on why you're a great fit — your relevant experience and a standout achievement."
        />
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-ink">Preview</span>
          <div className="flex gap-2">
            {letter && <CopyButton value={letter} />}
            {letter && (
              <button
                type="button"
                onClick={() => downloadBlob(new Blob([letter], { type: "text/plain" }), "cover-letter.txt")}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink-secondary hover:bg-surface-raised transition-colors duration-150"
              >
                Download .txt
              </button>
            )}
          </div>
        </div>
        <pre className="min-h-[20rem] overflow-x-auto whitespace-pre-wrap rounded-xl border border-border bg-surface-raised p-4 text-sm text-ink leading-relaxed">
          {letter || "Enter the company and role to draft your cover letter."}
        </pre>
      </div>
    </div>
  );
}
