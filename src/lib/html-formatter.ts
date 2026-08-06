/**
 * A naive HTML indenter.
 *
 * It walks the tags and indents each by its nesting depth. It deliberately does
 * not parse the document into a real tree — no error recovery, no awareness of
 * optional closing tags — so malformed markup indents literally rather than
 * being "corrected". The contents of <pre>/<script>/<style> are kept as a
 * single token and indented as a block rather than reflowed. Runs in the
 * browser; nothing is uploaded.
 */

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

function tagName(token: string): string {
  return (token.match(/^<\s*\/?\s*([a-zA-Z0-9-]+)/)?.[1] ?? "").toLowerCase();
}

export function formatHTML(input: string, indent = "  "): string {
  // Drop whitespace that sits purely between tags; keep text runs otherwise.
  const raw = input.replace(/>\s+</g, "><").trim();
  if (!raw) return "";

  const tokens = raw.match(/<[^>]+>|[^<]+/g) ?? [];
  const out: string[] = [];
  let depth = 0;

  for (const rawToken of tokens) {
    const token = rawToken.trim();
    if (!token) continue;

    const isTag = token.startsWith("<");
    const isClosing = /^<\//.test(token);
    const isMeta = /^<[!?]/.test(token); // <!doctype>, <!-- -->, <?xml ?>
    const isSelfClosing =
      /\/>\s*$/.test(token) || (isTag && !isMeta && VOID_TAGS.has(tagName(token)));

    if (isClosing) depth = Math.max(0, depth - 1);

    out.push(indent.repeat(depth) + token);

    if (isTag && !isClosing && !isMeta && !isSelfClosing) depth++;
  }

  return out.join("\n");
}

/** Collapse markup back down — whitespace between tags removed. */
export function minifyHTML(input: string): string {
  return input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}
