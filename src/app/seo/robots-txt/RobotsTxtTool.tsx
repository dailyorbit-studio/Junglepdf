"use client";

import { useMemo, useState } from "react";
import { Field, TextArea, Select, CodeResult } from "@/components/SeoForm";

export default function RobotsTxtTool() {
  const [preset, setPreset] = useState("allow");
  const [disallow, setDisallow] = useState("/admin\n/cart\n/checkout");
  const [sitemap, setSitemap] = useState("");

  const code = useMemo(() => {
    const lines = ["User-agent: *"];
    if (preset === "allow") {
      lines.push("Disallow:");
    } else if (preset === "disallowAll") {
      lines.push("Disallow: /");
    } else {
      const paths = disallow.split("\n").map((s) => s.trim()).filter(Boolean);
      if (paths.length === 0) lines.push("Disallow:");
      else paths.forEach((p) => lines.push(`Disallow: ${p.startsWith("/") ? p : `/${p}`}`));
    }
    if (sitemap.trim()) lines.push("", `Sitemap: ${sitemap.trim()}`);
    return lines.join("\n");
  }, [preset, disallow, sitemap]);

  return (
    <div className="space-y-5">
      <Select
        label="Crawling"
        value={preset}
        onChange={setPreset}
        options={[
          { value: "allow", label: "Allow all crawlers" },
          { value: "disallowAll", label: "Block all crawlers" },
          { value: "custom", label: "Custom disallow paths" },
        ]}
      />
      {preset === "custom" && (
        <TextArea label="Disallow paths (one per line)" value={disallow} onChange={setDisallow} placeholder={"/admin\n/cart"} />
      )}
      <Field label="Sitemap URL (optional)" value={sitemap} onChange={setSitemap} placeholder="https://example.com/sitemap.xml" />
      <CodeResult code={code} label="robots.txt" />
    </div>
  );
}
