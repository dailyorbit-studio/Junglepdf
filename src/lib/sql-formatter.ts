/**
 * A pragmatic SQL pretty-printer.
 *
 * This is a readability formatter, not a full SQL parser: it reflows the major
 * clauses onto their own lines, indents the boolean/join conditions under them,
 * and normalises keyword case. It does not validate the query or understand
 * dialect-specific syntax — the goal is a query a human can read, produced
 * entirely in the browser.
 */

// Longest-match-first: "UNION ALL" must be tried before "UNION", "LEFT JOIN"
// before "JOIN", or the shorter keyword eats the longer one.
const BREAK_BEFORE = [
  "SELECT",
  "FROM",
  "WHERE",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "UNION ALL",
  "UNION",
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "FULL OUTER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "INNER JOIN",
  "CROSS JOIN",
  "JOIN",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
  "AND",
  "OR",
  "ON",
];

// Conditions read better indented one level under the clause they belong to.
const INDENTED = new Set(["AND", "OR", "ON"]);

export function formatSQL(input: string, indent = "  "): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  let sql = trimmed.replace(/\s+/g, " ");

  for (const kw of BREAK_BEFORE) {
    const re = new RegExp(`\\s*\\b${kw.replace(/ /g, "\\s+")}\\b`, "gi");
    sql = sql.replace(re, `\n${kw}`);
  }

  return sql
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const firstWord = line.split(/\s|\(/, 1)[0].toUpperCase();
      return INDENTED.has(firstWord) ? indent + line : line;
    })
    .join("\n")
    .trim();
}

/** Collapse a formatted or messy query back to a single line. */
export function minifySQL(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}
