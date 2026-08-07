"use client";

import { useMemo, useState } from "react";
import { Field, TextArea } from "@/components/SeoForm";
import PromptResult from "@/components/PromptResult";

export default function ResumePromptTool() {
  const [role, setRole] = useState("");
  const [years, setYears] = useState("");
  const [skills, setSkills] = useState("");
  const [achievements, setAchievements] = useState("");

  const prompt = useMemo(() => {
    if (!role.trim()) return "";
    const lines: string[] = [
      `I'm applying for a ${role.trim()} position${years.trim() ? ` with ${years.trim()} years of experience` : ""}.`,
    ];
    if (skills.trim()) lines.push(`My key skills: ${skills.trim()}.`);
    if (achievements.trim()) lines.push(`Here is what I've done:\n${achievements.trim()}`);
    lines.push(
      `\nWrite 4–6 concise, action-oriented resume bullet points tailored to the ${role.trim()} role. Start each with a strong action verb, quantify impact with numbers where possible, and avoid clichés and personal pronouns.`
    );
    return lines.join("\n");
  }, [role, years, skills, achievements]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Target role" value={role} onChange={setRole} placeholder="Frontend Developer" />
        <Field label="Years of experience" value={years} onChange={setYears} placeholder="4" />
      </div>
      <Field label="Key skills" value={skills} onChange={setSkills} placeholder="React, TypeScript, accessibility, performance" />
      <TextArea
        label="Achievements & responsibilities"
        value={achievements}
        onChange={setAchievements}
        rows={5}
        placeholder="Rebuilt the checkout flow; cut load time; led a team of 3…"
      />
      <PromptResult text={prompt} />
    </div>
  );
}
