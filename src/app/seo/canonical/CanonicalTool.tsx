"use client";

import { useMemo, useState } from "react";
import { Field, CodeResult, attr } from "@/components/SeoForm";

const TRACKING = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid", "mc_cid", "mc_eid", "ref"];

export default function CanonicalTool() {
  const [input, setInput] = useState("");

  const result = useMemo<{ code: string; cleaned: string } | { error: string } | null>(() => {
    const raw = input.trim();
    if (!raw) return null;
    try {
      const url = new URL(raw);
      url.hash = "";
      TRACKING.forEach((p) => url.searchParams.delete(p));
      const cleaned = url.toString();
      return { code: `<link rel="canonical" href="${attr(cleaned)}">`, cleaned };
    } catch {
      return { error: "Enter a full URL including https://" };
    }
  }, [input]);

  return (
    <div className="space-y-5">
      <Field
        label="Page URL"
        value={input}
        onChange={setInput}
        placeholder="https://example.com/page?utm_source=newsletter#top"
        hint="Tracking parameters and the fragment are stripped automatically."
      />
      {result && "error" in result && (
        <p className="rounded-lg border border-error-border bg-error-subtle px-4 py-3 text-sm text-error-ink">{result.error}</p>
      )}
      {result && "cleaned" in result && (
        <>
          {result.cleaned !== input.trim() && (
            <p className="text-sm text-ink-secondary">
              Canonical URL: <span className="font-mono text-ink break-all">{result.cleaned}</span>
            </p>
          )}
          <CodeResult code={result.code} label="Canonical tag" />
        </>
      )}
    </div>
  );
}
