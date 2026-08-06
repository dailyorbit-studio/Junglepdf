/**
 * A small CSS beautifier and minifier.
 *
 * The beautifier walks the stylesheet character by character, breaking at the
 * structural punctuation ({ } ; ) and indenting by brace depth so nested
 * at-rules (@media, @supports) come out correctly. It does not touch colons,
 * so pseudo-classes like `a:hover` are left intact rather than being mistaken
 * for declarations. Runs in the browser.
 */

export function formatCSS(input: string, indent = "  "): string {
  const css = input.replace(/\s+/g, " ").trim();
  if (!css) return "";

  let out = "";
  let level = 0;

  const pad = () => indent.repeat(level);

  for (const ch of css) {
    if (ch === "{") {
      out = `${out.trimEnd()} {\n`;
      level++;
      out += pad();
    } else if (ch === "}") {
      out = out.trimEnd();
      level = Math.max(0, level - 1);
      out += `\n${pad()}}\n${pad()}`;
    } else if (ch === ";") {
      out = `${out.trimEnd()};\n${pad()}`;
    } else {
      out += ch;
    }
  }

  return out
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .filter((line) => line.trim() !== "")
    .join("\n")
    .trim();
}

/** Strip comments and collapse to the smallest equivalent stylesheet. */
export function minifyCSS(input: string): string {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>~+])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}
