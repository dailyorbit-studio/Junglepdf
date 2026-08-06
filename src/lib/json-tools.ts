/**
 * Shared JSON parsing helpers for the formatter and the validator.
 *
 * Both tools need the same thing browsers do not give directly: when a parse
 * fails, the line and column of the offending character, not just a message.
 * V8 and SpiderMonkey word the error differently, so we recover the character
 * offset from either "position N" or "line L column C" and compute the rest.
 */

export interface JsonError {
  message: string;
  line: number;
  column: number;
}

export type JsonResult =
  | { ok: true; value: unknown }
  | { ok: false; error: JsonError };

function locate(text: string, raw: string): JsonError {
  const posMatch = raw.match(/position (\d+)/i);
  if (posMatch) {
    const pos = Number(posMatch[1]);
    const before = text.slice(0, pos);
    const line = before.split("\n").length;
    const lastBreak = before.lastIndexOf("\n");
    return { message: raw, line, column: pos - lastBreak };
  }

  const lineMatch = raw.match(/line (\d+) column (\d+)/i);
  if (lineMatch) {
    return { message: raw, line: Number(lineMatch[1]), column: Number(lineMatch[2]) };
  }

  return { message: raw, line: 1, column: 1 };
}

export function parseJson(text: string): JsonResult {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    return { ok: false, error: locate(text, raw) };
  }
}
