"use client";

import { useMemo, useState } from "react";
import { Field, TextArea, Select, CodeResult } from "@/components/SeoForm";

type Fields = Record<string, string>;

const TYPE_FIELDS: Record<string, { key: string; label: string; placeholder?: string; area?: boolean }[]> = {
  Organization: [
    { key: "name", label: "Name" },
    { key: "url", label: "URL" },
    { key: "logo", label: "Logo URL" },
    { key: "sameAs", label: "Social profile URLs (one per line)", area: true },
  ],
  WebSite: [
    { key: "name", label: "Site name" },
    { key: "url", label: "URL" },
  ],
  Article: [
    { key: "headline", label: "Headline" },
    { key: "author", label: "Author name" },
    { key: "datePublished", label: "Date published (YYYY-MM-DD)" },
    { key: "image", label: "Image URL" },
    { key: "publisher", label: "Publisher name" },
  ],
  Product: [
    { key: "name", label: "Product name" },
    { key: "description", label: "Description" },
    { key: "image", label: "Image URL" },
    { key: "brand", label: "Brand" },
    { key: "price", label: "Price" },
    { key: "priceCurrency", label: "Currency (e.g. INR)" },
  ],
  LocalBusiness: [
    { key: "name", label: "Business name" },
    { key: "url", label: "URL" },
    { key: "telephone", label: "Phone" },
    { key: "address", label: "Street address" },
  ],
  FAQPage: [{ key: "faq", label: "FAQs — one per line as: Question | Answer", area: true }],
};

function build(type: string, f: Fields): object {
  const base: Record<string, unknown> = { "@context": "https://schema.org", "@type": type };
  const set = (k: string, v?: unknown) => {
    if (v && (typeof v !== "string" || v.trim())) base[k] = v;
  };

  if (type === "Organization") {
    set("name", f.name);
    set("url", f.url);
    if (f.logo?.trim()) base.logo = f.logo.trim();
    const sameAs = (f.sameAs ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
    if (sameAs.length) base.sameAs = sameAs;
  } else if (type === "WebSite") {
    set("name", f.name);
    set("url", f.url);
  } else if (type === "Article") {
    set("headline", f.headline);
    if (f.author?.trim()) base.author = { "@type": "Person", name: f.author.trim() };
    set("datePublished", f.datePublished);
    set("image", f.image);
    if (f.publisher?.trim()) base.publisher = { "@type": "Organization", name: f.publisher.trim() };
  } else if (type === "Product") {
    set("name", f.name);
    set("description", f.description);
    set("image", f.image);
    if (f.brand?.trim()) base.brand = { "@type": "Brand", name: f.brand.trim() };
    if (f.price?.trim()) {
      base.offers = {
        "@type": "Offer",
        price: f.price.trim(),
        priceCurrency: (f.priceCurrency ?? "").trim() || "USD",
      };
    }
  } else if (type === "LocalBusiness") {
    set("name", f.name);
    set("url", f.url);
    set("telephone", f.telephone);
    if (f.address?.trim()) base.address = { "@type": "PostalAddress", streetAddress: f.address.trim() };
  } else if (type === "FAQPage") {
    const items = (f.faq ?? "")
      .split("\n")
      .map((line) => line.split("|"))
      .filter((parts) => parts.length >= 2 && parts[0].trim() && parts[1].trim())
      .map((parts) => ({
        "@type": "Question",
        name: parts[0].trim(),
        acceptedAnswer: { "@type": "Answer", text: parts.slice(1).join("|").trim() },
      }));
    if (items.length) base.mainEntity = items;
  }
  return base;
}

export default function SchemaTool() {
  const [type, setType] = useState("Organization");
  const [fields, setFields] = useState<Fields>({});

  const set = (k: string, v: string) => setFields((prev) => ({ ...prev, [k]: v }));

  const code = useMemo(() => {
    const obj = build(type, fields);
    // More than just @context and @type means the user has entered something.
    if (Object.keys(obj).length <= 2) return "";
    return `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;
  }, [type, fields]);

  return (
    <div className="space-y-5">
      <Select
        label="Schema type"
        value={type}
        onChange={(v) => {
          setType(v);
          setFields({});
        }}
        options={Object.keys(TYPE_FIELDS).map((t) => ({ value: t, label: t }))}
      />
      {TYPE_FIELDS[type].map((field) =>
        field.area ? (
          <TextArea
            key={field.key}
            label={field.label}
            value={fields[field.key] ?? ""}
            onChange={(v) => set(field.key, v)}
            placeholder={field.key === "faq" ? "How do I reset my password? | Click 'Forgot password' on the login page." : undefined}
          />
        ) : (
          <Field
            key={field.key}
            label={field.label}
            value={fields[field.key] ?? ""}
            onChange={(v) => set(field.key, v)}
            placeholder={field.placeholder}
          />
        )
      )}
      <CodeResult code={code} label="JSON-LD" />
    </div>
  );
}
