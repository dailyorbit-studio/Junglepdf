"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

/** Decode one base64url segment to a UTF-8 string. */
function b64urlToText(part: string): string {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

interface Decoded {
  header?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  error?: string;
}

const INPUT =
  "w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 font-mono text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y break-all";

function claimDate(value: unknown): string | null {
  if (typeof value !== "number") return null;
  const ms = value < 1e12 ? value * 1000 : value;
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, { timeZoneName: "short" });
}

export default function JwtDecoderTool() {
  const [token, setToken] = useState("");

  const decoded = useMemo<Decoded | null>(() => {
    const t = token.trim();
    if (!t) return null;

    const parts = t.split(".");
    if (parts.length < 2) {
      return {
        error:
          "A JWT has three parts separated by dots (header.payload.signature). This does not look like one.",
      };
    }
    try {
      return {
        header: JSON.parse(b64urlToText(parts[0])),
        payload: JSON.parse(b64urlToText(parts[1])),
      };
    } catch {
      return {
        error:
          "Could not decode this token — its header or payload is not valid base64url-encoded JSON.",
      };
    }
  }, [token]);

  const payload = decoded?.payload;
  const exp = payload?.exp;
  const expiryNote = useMemo(() => {
    if (typeof exp !== "number") return null;
    const ms = exp < 1e12 ? exp * 1000 : exp;
    const expired = ms < Date.now();
    return { expired, when: new Date(ms).toLocaleString(undefined, { timeZoneName: "short" }) };
  }, [exp]);

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="jwt" className="text-sm font-medium text-ink">
            Paste your JWT
          </label>
          <button
            type="button"
            onClick={() => setToken(SAMPLE)}
            className="text-xs font-medium text-accent hover:text-accent-hover"
          >
            Try a sample
          </button>
        </div>
        <textarea
          id="jwt"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={4}
          spellCheck={false}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
          className={INPUT}
        />
      </div>

      {decoded?.error && (
        <p className="rounded-lg border border-error-border bg-error-subtle px-4 py-3 text-sm text-error-ink">
          {decoded.error}
        </p>
      )}

      {decoded?.header && (
        <div className="grid gap-4 md:grid-cols-2">
          <Section title="Header" json={decoded.header} />
          <Section title="Payload" json={decoded.payload!} />
        </div>
      )}

      {expiryNote && (
        <p
          className={`rounded-lg border px-4 py-3 text-sm ${
            expiryNote.expired
              ? "border-error-border bg-error-subtle text-error-ink"
              : "border-success-border bg-success-subtle text-success-ink"
          }`}
        >
          {expiryNote.expired ? "Expired" : "Expires"} {expiryNote.when}
          {payload && typeof payload.iat === "number" && claimDate(payload.iat) && (
            <span className="block text-ink-muted mt-1">Issued {claimDate(payload.iat)}</span>
          )}
        </p>
      )}

      <p className="text-xs text-ink-muted">
        Decoding a JWT does not verify it. The signature is shown but not checked — anyone can
        read a token&apos;s contents, which is why you should never put secrets in one.
      </p>
    </div>
  );
}

function Section({ title, json }: { title: string; json: Record<string, unknown> }) {
  const text = JSON.stringify(json, null, 2);
  return (
    <div className="rounded-lg border border-border bg-surface-raised p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <CopyButton value={text} />
      </div>
      <pre className="overflow-x-auto text-xs font-mono text-ink leading-relaxed">{text}</pre>
    </div>
  );
}
