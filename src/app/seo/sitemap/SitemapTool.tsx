"use client";

import { useMemo, useState } from "react";
import { TextArea, Select, CodeResult } from "@/components/SeoForm";

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export default function SitemapTool() {
  const [urls, setUrls] = useState("");
  const [changefreq, setChangefreq] = useState("weekly");
  const [priority, setPriority] = useState("0.8");

  const code = useMemo(() => {
    const list = urls.split("\n").map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) return "";
    const body = list
      .map(
        (u) =>
          `  <url>\n    <loc>${escapeXml(u)}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
      )
      .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
  }, [urls, changefreq, priority]);

  return (
    <div className="space-y-5">
      <TextArea
        label="URLs (one per line)"
        value={urls}
        onChange={setUrls}
        rows={8}
        placeholder={"https://example.com/\nhttps://example.com/about\nhttps://example.com/contact"}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Change frequency"
          value={changefreq}
          onChange={setChangefreq}
          options={["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].map((v) => ({ value: v, label: v }))}
        />
        <Select
          label="Priority"
          value={priority}
          onChange={setPriority}
          options={["1.0", "0.9", "0.8", "0.7", "0.5", "0.3"].map((v) => ({ value: v, label: v }))}
        />
      </div>
      <CodeResult code={code} label="sitemap.xml" />
    </div>
  );
}
