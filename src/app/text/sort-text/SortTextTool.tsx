"use client";

import TextTransformTool from "@/components/TextTransformTool";

function transform(input: string, active: Set<string>): string {
  let lines = input.split("\n");
  if (active.has("unique")) lines = [...new Set(lines)];
  const collator = new Intl.Collator(undefined, {
    numeric: active.has("numeric"),
    sensitivity: active.has("ci") ? "base" : "variant",
  });
  lines.sort((a, b) => collator.compare(a, b));
  if (active.has("desc")) lines.reverse();
  return lines.join("\n");
}

export default function SortTextTool() {
  return (
    <TextTransformTool
      transform={transform}
      placeholder={"banana\nApple\ncherry\napple\n10\n2"}
      options={[
        { id: "desc", label: "Z → A" },
        { id: "ci", label: "Case-insensitive" },
        { id: "numeric", label: "Numeric order" },
        { id: "unique", label: "Remove duplicates" },
      ]}
    />
  );
}
