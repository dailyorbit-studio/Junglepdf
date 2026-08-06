"use client";

import { useEffect, useState } from "react";
import CopyButton from "@/components/CopyButton";

const ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
type Algo = (typeof ALGOS)[number];

const BOX =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 font-mono text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y";

async function digestHex(algo: Algo, text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algo, data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HashGeneratorTool() {
  const [text, setText] = useState("");
  const [hashes, setHashes] = useState<Record<Algo, string>>({
    "SHA-1": "",
    "SHA-256": "",
    "SHA-384": "",
    "SHA-512": "",
  });

  useEffect(() => {
    let cancelled = false;
    if (!text) {
      setHashes({ "SHA-1": "", "SHA-256": "", "SHA-384": "", "SHA-512": "" });
      return;
    }
    (async () => {
      const entries = await Promise.all(ALGOS.map(async (a) => [a, await digestHex(a, text)] as const));
      if (!cancelled) setHashes(Object.fromEntries(entries) as Record<Algo, string>);
    })();
    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="hash-in" className="block text-sm font-medium text-ink mb-2">
          Text to hash
        </label>
        <textarea
          id="hash-in"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          spellCheck={false}
          placeholder="Type or paste any text…"
          className={BOX}
        />
      </div>

      <div className="space-y-3">
        {ALGOS.map((algo) => (
          <div key={algo} className="rounded-lg border border-border bg-surface-raised p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-ink">{algo}</span>
              {hashes[algo] && <CopyButton value={hashes[algo]} />}
            </div>
            <p className="break-all font-mono text-xs text-ink leading-relaxed min-h-[1rem]">
              {hashes[algo] || <span className="text-ink-muted">—</span>}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink-muted">
        MD5 is not offered: it is cryptographically broken and browsers deliberately omit it from
        the Web Crypto API. Use SHA-256 or stronger.
      </p>
    </div>
  );
}
