"use client";

import { useState } from "react";
import QrResult from "@/components/QrResult";

export default function QrGeneratorTool() {
  const [text, setText] = useState("");

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <label htmlFor="qr-text" className="block text-sm font-medium text-ink mb-2">
          Text or URL
        </label>
        <textarea
          id="qr-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="https://example.com or any text…"
          className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y"
        />
      </div>
      <QrResult value={text.trim()} filename="qr-code" />
    </div>
  );
}
