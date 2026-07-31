"use client";

import { useState } from "react";
import DocumentToPdfTool from "@/components/DocumentToPdfTool";
import { txtToPDF, LINE_MODE_LABELS, type LineMode } from "@/lib/text-to-pdf";

const MODES: { value: LineMode; note: string }[] = [
  { value: "paragraphs", note: "A blank line starts a new paragraph. Best for prose." },
  { value: "preserve", note: "Every line stays a line. Best for logs, code and addresses." },
];

export default function TxtToPdfTool() {
  const [lineMode, setLineMode] = useState<LineMode>("paragraphs");

  return (
    <DocumentToPdfTool
      convert={(file, options, onProgress) =>
        txtToPDF(file, { ...options, lineMode: options.lineMode as LineMode }, onProgress)
      }
      accept=".txt,.text,.log,.md,.csv"
      maxFileSizeMB={25}
      dropLabel="Drop a text file here, or click to browse"
      dropSublabel=".txt, .log, .md or .csv up to 25MB"
      extraOptions={{ lineMode }}
      caveatTitle="How your text is laid out"
      caveats={[
        "Text is typeset at 11pt with automatic word wrapping",
        "Tabs become four spaces so columns keep their shape",
        "Lines starting with -, • or 1. are detected and set as lists",
        "Windows and Mac line endings are normalised",
      ]}
      extraControls={
        <div>
          <span className="block text-xs font-medium text-ink-secondary mb-1.5">Line handling</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setLineMode(mode.value)}
                className={`px-3 py-2.5 text-left rounded-lg border transition-colors ${
                  lineMode === mode.value
                    ? "border-accent bg-accent-subtle"
                    : "border-border hover:bg-surface-raised"
                }`}
              >
                <span
                  className={`block text-sm font-medium ${
                    lineMode === mode.value ? "text-accent" : "text-ink"
                  }`}
                >
                  {LINE_MODE_LABELS[mode.value]}
                </span>
                <span className="block text-xs text-ink-muted mt-0.5">{mode.note}</span>
              </button>
            ))}
          </div>
        </div>
      }
    />
  );
}
