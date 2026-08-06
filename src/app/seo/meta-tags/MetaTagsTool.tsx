"use client";

import { useMemo, useState } from "react";
import { Field, Select, CodeResult, attr } from "@/components/SeoForm";

const escText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export default function MetaTagsTool() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [keywords, setKeywords] = useState("");
  const [author, setAuthor] = useState("");
  const [robots, setRobots] = useState("index, follow");

  const code = useMemo(() => {
    if (!title && !desc && !keywords && !author) return "";
    const lines = ['<meta charset="UTF-8">', '<meta name="viewport" content="width=device-width, initial-scale=1">'];
    if (title) lines.push(`<title>${escText(title)}</title>`);
    if (desc) lines.push(`<meta name="description" content="${attr(desc)}">`);
    if (keywords) lines.push(`<meta name="keywords" content="${attr(keywords)}">`);
    if (author) lines.push(`<meta name="author" content="${attr(author)}">`);
    lines.push(`<meta name="robots" content="${robots}">`);
    return lines.join("\n");
  }, [title, desc, keywords, author, robots]);

  return (
    <div className="space-y-5">
      <Field label="Page title" value={title} onChange={setTitle} placeholder="Best Coffee Beans — Roasted Fresh" hint="Aim for 50–60 characters." />
      <Field label="Meta description" value={desc} onChange={setDesc} placeholder="Freshly roasted specialty coffee beans, shipped within 24 hours." hint="Aim for 110–160 characters." />
      <Field label="Keywords (optional)" value={keywords} onChange={setKeywords} placeholder="coffee beans, specialty coffee, fresh roast" />
      <Field label="Author (optional)" value={author} onChange={setAuthor} placeholder="Jane Doe" />
      <Select
        label="Robots"
        value={robots}
        onChange={setRobots}
        options={[
          { value: "index, follow", label: "index, follow (default)" },
          { value: "noindex, follow", label: "noindex, follow" },
          { value: "index, nofollow", label: "index, nofollow" },
          { value: "noindex, nofollow", label: "noindex, nofollow" },
        ]}
      />
      <CodeResult code={code} label="Meta tags" />
    </div>
  );
}
