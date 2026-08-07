"use client";

import { useMemo, useState } from "react";
import { Field, TextArea, Select } from "@/components/SeoForm";
import PromptResult from "@/components/PromptResult";

const LANGS = ["JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "SQL", "Bash"];

export default function CodingPromptTool() {
  const [language, setLanguage] = useState("Python");
  const [task, setTask] = useState("");
  const [constraints, setConstraints] = useState("");
  const [io, setIo] = useState("");

  const prompt = useMemo(() => {
    if (!task.trim()) return "";
    let out = `Write ${language} code that ${task.trim().replace(/\s*\.?$/, "")}.`;
    if (constraints.trim()) out += `\n\nRequirements:\n${constraints.trim()}`;
    if (io.trim()) out += `\n\nInput / output: ${io.trim()}`;
    out += `\n\nReturn clean, well-commented ${language} code, briefly explain the approach, and note any edge cases you handle.`;
    return out;
  }, [language, task, constraints, io]);

  return (
    <div className="space-y-5">
      <Select label="Language" value={language} onChange={setLanguage} options={LANGS.map((v) => ({ value: v, label: v }))} />
      <TextArea label="Task — what should the code do?" value={task} onChange={setTask} rows={3} placeholder="parse a CSV file and return the rows where the amount column is over 100" />
      <TextArea label="Requirements / constraints (optional)" value={constraints} onChange={setConstraints} rows={3} placeholder="- No external libraries\n- Handle missing values gracefully" />
      <Field label="Input / output shape (optional)" value={io} onChange={setIo} placeholder="input: path to CSV; output: list of dictionaries" />
      <PromptResult text={prompt} />
    </div>
  );
}
