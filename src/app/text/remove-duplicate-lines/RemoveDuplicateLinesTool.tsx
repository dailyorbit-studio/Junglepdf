"use client";

import TextTransformTool from "@/components/TextTransformTool";

function transform(input: string, active: Set<string>): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of input.split("\n")) {
    let key = active.has("trim") ? line.trim() : line;
    if (active.has("ci")) key = key.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out.join("\n");
}

export default function RemoveDuplicateLinesTool() {
  return (
    <TextTransformTool
      transform={transform}
      placeholder={"apple\nbanana\napple\ncherry\nbanana"}
      options={[
        { id: "trim", label: "Ignore surrounding spaces" },
        { id: "ci", label: "Case-insensitive" },
      ]}
    />
  );
}
