"use client";

import TextTransformTool from "@/components/TextTransformTool";

function slugify(line: string, sep: string): string {
  return line
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accent marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, sep)
    .replace(new RegExp(`^\\${sep}+|\\${sep}+$`, "g"), "");
}

function transform(input: string, active: Set<string>): string {
  const sep = active.has("underscore") ? "_" : "-";
  return input
    .split("\n")
    .map((line) => slugify(line, sep))
    .join("\n");
}

export default function SlugGeneratorTool() {
  return (
    <TextTransformTool
      transform={transform}
      placeholder={"10 Tips for Better Café Brûlée!"}
      options={[{ id: "underscore", label: "Use underscores" }]}
    />
  );
}
