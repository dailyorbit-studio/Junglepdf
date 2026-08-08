"use client";

import CopyButton from "./CopyButton";

/** Prose-styled output box with a copy button, used by the AI prompt tools. */
export default function PromptResult({ text, label = "Your prompt" }: { text: string; label?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-ink">{label}</span>
        {text && <CopyButton value={text} />}
      </div>
      {/* break-words: whitespace-pre-wrap keeps line breaks and wraps on spaces,
          but a long unbreakable token (a pasted URL or ID) would still push the
          box — and the page — past the viewport. break-words wraps it too. */}
      <p className="min-h-[3rem] whitespace-pre-wrap break-words text-sm text-ink leading-relaxed">
        {text || <span className="text-ink-muted">Fill in the fields to build your prompt.</span>}
      </p>
    </div>
  );
}
