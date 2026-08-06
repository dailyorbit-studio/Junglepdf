"use client";

import EncodeDecodeTool from "@/components/EncodeDecodeTool";

function encode(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decode(s: string): string {
  // A detached textarea decodes named and numeric entities without executing
  // anything — its content is always treated as text, never markup.
  const el = document.createElement("textarea");
  el.innerHTML = s;
  return el.value;
}

export default function HtmlEntitiesTool() {
  return (
    <EncodeDecodeTool
      encode={encode}
      decode={decode}
      plainLabel="Text"
      encodedLabel="HTML-escaped"
      placeholderEncode={'<div class="note">Tom & Jerry</div>'}
      placeholderDecode={"&lt;div&gt;Tom &amp; Jerry&lt;/div&gt;"}
    />
  );
}
