"use client";

import { useMemo, useState } from "react";
import { Field, Select, CodeResult, attr } from "@/components/SeoForm";

export default function OpenGraphTool() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [type, setType] = useState("website");
  const [siteName, setSiteName] = useState("");

  const code = useMemo(() => {
    if (!title && !desc && !url && !image) return "";
    const lines = [`<meta property="og:type" content="${type}">`];
    if (title) lines.push(`<meta property="og:title" content="${attr(title)}">`);
    if (desc) lines.push(`<meta property="og:description" content="${attr(desc)}">`);
    if (url) lines.push(`<meta property="og:url" content="${attr(url)}">`);
    if (image) lines.push(`<meta property="og:image" content="${attr(image)}">`);
    if (siteName) lines.push(`<meta property="og:site_name" content="${attr(siteName)}">`);
    return lines.join("\n");
  }, [title, desc, url, image, type, siteName]);

  return (
    <div className="space-y-5">
      <Field label="og:title" value={title} onChange={setTitle} placeholder="Best Coffee Beans" />
      <Field label="og:description" value={desc} onChange={setDesc} placeholder="Freshly roasted, shipped in 24 hours." />
      <Field label="og:url" value={url} onChange={setUrl} placeholder="https://example.com/coffee" />
      <Field label="og:image" value={image} onChange={setImage} placeholder="https://example.com/card.png" hint="Use an absolute URL, ideally 1200×630." />
      <Field label="og:site_name (optional)" value={siteName} onChange={setSiteName} placeholder="Example Coffee" />
      <Select
        label="og:type"
        value={type}
        onChange={setType}
        options={[
          { value: "website", label: "website" },
          { value: "article", label: "article" },
          { value: "product", label: "product" },
          { value: "profile", label: "profile" },
        ]}
      />
      <CodeResult code={code} label="Open Graph tags" />
    </div>
  );
}
