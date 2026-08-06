"use client";

import TextTransformTool from "@/components/TextTransformTool";

function transform(input: string, active: Set<string>): string {
  if (active.has("lines")) return input.split("\n").reverse().join("\n");
  if (active.has("words")) {
    return input
      .split("\n")
      .map((line) => line.split(/(\s+)/).reverse().join(""))
      .join("\n");
  }
  // Spread to code points so surrogate pairs (emoji) are not split.
  return [...input].reverse().join("");
}

export default function ReverseTextTool() {
  return (
    <TextTransformTool
      transform={transform}
      placeholder={"The quick brown fox"}
      options={[
        { id: "words", label: "Reverse word order" },
        { id: "lines", label: "Reverse line order" },
      ]}
    />
  );
}
