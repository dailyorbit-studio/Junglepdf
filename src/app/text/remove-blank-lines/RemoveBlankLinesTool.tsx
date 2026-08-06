"use client";

import TextTransformTool from "@/components/TextTransformTool";

function transform(input: string, active: Set<string>): string {
  let lines = input.split("\n").filter((l) => l.trim().length > 0);
  if (active.has("trimEach")) lines = lines.map((l) => l.trim());
  return lines.join("\n");
}

export default function RemoveBlankLinesTool() {
  return (
    <TextTransformTool
      transform={transform}
      placeholder={"first line\n\n\nsecond line\n   \nthird line"}
      options={[{ id: "trimEach", label: "Also trim each line" }]}
    />
  );
}
