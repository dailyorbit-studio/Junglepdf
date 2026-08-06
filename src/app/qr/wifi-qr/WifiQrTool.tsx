"use client";

import { useMemo, useState } from "react";
import QrResult from "@/components/QrResult";
import { Field, Select } from "@/components/SeoForm";

// Escape the characters that are special in the WIFI: payload syntax.
const esc = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");

export default function WifiQrTool() {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [enc, setEnc] = useState("WPA");
  const [hidden, setHidden] = useState(false);

  const payload = useMemo(() => {
    if (!ssid) return "";
    const pass = enc === "nopass" ? "" : `P:${esc(password)};`;
    return `WIFI:T:${enc};S:${esc(ssid)};${pass}${hidden ? "H:true;" : ""};`;
  }, [ssid, password, enc, hidden]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Network name (SSID)" value={ssid} onChange={setSsid} placeholder="MyHomeWiFi" />
        {enc !== "nopass" && (
          <Field label="Password" value={password} onChange={setPassword} placeholder="wifi password" />
        )}
        <Select
          label="Security"
          value={enc}
          onChange={setEnc}
          options={[
            { value: "WPA", label: "WPA / WPA2 / WPA3" },
            { value: "WEP", label: "WEP" },
            { value: "nopass", label: "None (open network)" },
          ]}
        />
        <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm text-ink-secondary">
          <input
            type="checkbox"
            checked={hidden}
            onChange={(e) => setHidden(e.target.checked)}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent/40"
          />
          Hidden network
        </label>
        <p className="text-xs text-ink-muted">Your password is encoded on your device and never uploaded.</p>
      </div>
      <QrResult value={payload} filename="wifi-qr" />
    </div>
  );
}
