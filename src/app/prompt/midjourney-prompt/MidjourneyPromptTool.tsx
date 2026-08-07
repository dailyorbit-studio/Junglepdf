"use client";

import { useMemo, useState } from "react";
import { Field, Select } from "@/components/SeoForm";
import PromptResult from "@/components/PromptResult";

export default function MidjourneyPromptTool() {
  const [subject, setSubject] = useState("");
  const [style, setStyle] = useState("");
  const [lighting, setLighting] = useState("");
  const [mood, setMood] = useState("");
  const [colors, setColors] = useState("");
  const [details, setDetails] = useState("");
  const [ratio, setRatio] = useState("16:9");
  const [version, setVersion] = useState("6");

  const prompt = useMemo(() => {
    if (!subject.trim()) return "";
    const parts = [subject, style, lighting, mood, colors, details].map((s) => s.trim()).filter(Boolean);
    return `${parts.join(", ")} --ar ${ratio} --v ${version}`;
  }, [subject, style, lighting, mood, colors, details, ratio, version]);

  return (
    <div className="space-y-5">
      <Field label="Subject" value={subject} onChange={setSubject} placeholder="a lone lighthouse on a rocky coast" />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Style" value={style} onChange={setStyle} placeholder="cinematic photography, hyper-detailed" />
        <Field label="Lighting" value={lighting} onChange={setLighting} placeholder="golden hour, dramatic backlight" />
        <Field label="Mood" value={mood} onChange={setMood} placeholder="moody, atmospheric" />
        <Field label="Colours" value={colors} onChange={setColors} placeholder="teal and amber palette" />
      </div>
      <Field label="Extra details (optional)" value={details} onChange={setDetails} placeholder="35mm lens, shallow depth of field" />
      <div className="grid gap-4 md:grid-cols-2">
        <Select label="Aspect ratio" value={ratio} onChange={setRatio} options={["1:1", "16:9", "9:16", "3:2", "2:3", "4:5"].map((v) => ({ value: v, label: v }))} />
        <Select label="Version" value={version} onChange={setVersion} options={["6", "5.2", "5.1", "niji 6"].map((v) => ({ value: v, label: `--v ${v}` }))} />
      </div>
      <PromptResult text={prompt} />
    </div>
  );
}
