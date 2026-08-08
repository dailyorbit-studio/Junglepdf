"use client";

import { useMemo, useState } from "react";
import { Field, TextArea } from "@/components/SeoForm";
import CopyButton from "@/components/CopyButton";
import { downloadBlob } from "@/lib/download";

export default function ResumeBuilderTool() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [summary, setSummary] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [skills, setSkills] = useState("");

  const resume = useMemo(() => {
    if (!name.trim()) return "";
    const contact = [email, phone, location, website].map((s) => s.trim()).filter(Boolean).join("  ·  ");
    const section = (h: string, body: string) =>
      body.trim() ? `\n${h.toUpperCase()}\n${"—".repeat(h.length)}\n${body.trim()}\n` : "";
    let out = name.trim().toUpperCase() + "\n";
    if (title.trim()) out += `${title.trim()}\n`;
    if (contact) out += `${contact}\n`;
    out += section("Summary", summary);
    out += section("Experience", experience);
    out += section("Education", education);
    out += section("Skills", skills);
    return out.trimEnd();
  }, [name, title, email, phone, location, website, summary, experience, education, skills]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={name} onChange={setName} placeholder="Ada Lovelace" />
          <Field label="Title" value={title} onChange={setTitle} placeholder="Software Engineer" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="ada@example.com" />
          <Field label="Phone" value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
          <Field label="Location" value={location} onChange={setLocation} placeholder="Bengaluru, IN" />
          <Field label="Website" value={website} onChange={setWebsite} placeholder="ada.dev" />
        </div>
        <TextArea label="Summary" value={summary} onChange={setSummary} rows={3} placeholder="A short professional summary…" />
        <TextArea label="Experience" value={experience} onChange={setExperience} rows={6} placeholder={"Senior Engineer — Example Ltd (2021–present)\n- Rebuilt the checkout, cutting load time 40%"} />
        <TextArea label="Education" value={education} onChange={setEducation} rows={3} placeholder="B.Tech, Computer Science — IIT (2016–2020)" />
        <TextArea label="Skills" value={skills} onChange={setSkills} rows={2} placeholder="React, TypeScript, Node, SQL" />
      </div>

      <div className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-ink">Preview</span>
          <div className="flex gap-2">
            {resume && <CopyButton value={resume} />}
            {resume && (
              <button
                type="button"
                onClick={() => downloadBlob(new Blob([resume], { type: "text/plain" }), "resume.txt")}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink-secondary hover:bg-surface-raised transition-colors duration-150"
              >
                Download .txt
              </button>
            )}
          </div>
        </div>
        {/* break-words: whitespace-pre-wrap wraps on spaces but leaves a long
            unbreakable token (a pasted URL, say) to stretch the pre — and with
            it the grid column — past the viewport. break-words lets that token
            wrap too. */}
        <pre className="min-h-[20rem] overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-surface-raised p-4 font-mono text-xs text-ink leading-relaxed">
          {resume || "Fill in your details to build the resume."}
        </pre>
      </div>
    </div>
  );
}
