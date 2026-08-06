"use client";

import { useMemo, useState } from "react";
import { Field, Select, CodeResult, attr } from "@/components/SeoForm";

export default function TwitterCardTool() {
  const [card, setCard] = useState("summary_large_image");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");
  const [site, setSite] = useState("");

  const code = useMemo(() => {
    if (!title && !desc && !image && !site) return "";
    const lines = [`<meta name="twitter:card" content="${card}">`];
    if (site) lines.push(`<meta name="twitter:site" content="${attr(site.startsWith("@") ? site : `@${site}`)}">`);
    if (title) lines.push(`<meta name="twitter:title" content="${attr(title)}">`);
    if (desc) lines.push(`<meta name="twitter:description" content="${attr(desc)}">`);
    if (image) lines.push(`<meta name="twitter:image" content="${attr(image)}">`);
    return lines.join("\n");
  }, [card, title, desc, image, site]);

  return (
    <div className="space-y-5">
      <Select
        label="Card type"
        value={card}
        onChange={setCard}
        options={[
          { value: "summary_large_image", label: "summary_large_image" },
          { value: "summary", label: "summary" },
        ]}
      />
      <Field label="twitter:site (optional)" value={site} onChange={setSite} placeholder="@yourhandle" />
      <Field label="twitter:title" value={title} onChange={setTitle} placeholder="Best Coffee Beans" />
      <Field label="twitter:description" value={desc} onChange={setDesc} placeholder="Freshly roasted, shipped in 24 hours." />
      <Field label="twitter:image" value={image} onChange={setImage} placeholder="https://example.com/card.png" hint="Absolute URL. Large cards use ~1200×628." />
      <CodeResult code={code} label="Twitter Card tags" />
    </div>
  );
}
