import Link from "next/link";
import AdSlot from "./AdSlot";
import ToolCard from "./ToolCard";
import { ToolIcon } from "@/lib/tool-icons";
import { toolHref, type ToolCategory } from "@/lib/tools";
import { SITE_URL } from "@/lib/site";

/**
 * Landing page for a tool category (/audio, /image, /pdf, /video).
 */
export default function CategoryIndex({ category }: { category: ToolCategory }) {
  const categoryUrl = `${SITE_URL}/${category.slug}/`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: `${category.label} Tools`, item: categoryUrl },
            ],
          }),
        }}
      />

      {/*
        An ItemList of the tools in this category. This is what can earn a
        multi-link result for a query like "pdf tools" rather than a single
        blue link into the page.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${category.label} Tools`,
            description: category.description,
            numberOfItems: category.tools.length,
            itemListElement: category.tools.map((tool, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: tool.name,
              description: tool.description,
              url: `${SITE_URL}${toolHref(category.slug, tool.slug)}`,
            })),
          }),
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-muted mb-6">
          {/* px-0.5/py-1 to match the tool-page breadcrumb: at 12px this was
              a 16px tap target, under the 24px WCAG 2.5.8 floor. */}
          <Link
            href="/"
            className="inline-block px-0.5 py-1 -mx-0.5 hover:text-ink-secondary transition-colors duration-150"
          >
            Home
          </Link>
          <span className="text-border">/</span>
          <span className="text-ink-secondary">{category.label}</span>
        </nav>

        <div className="mb-8 flex items-start gap-4">
          <div
            className={`hidden sm:flex shrink-0 w-14 h-14 rounded-xl ${category.subtleClass} ${category.colorClass} items-center justify-center`}
          >
            <ToolIcon category={category.slug} slug={category.tools[0]?.slug ?? ""} size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-2">
              {category.label} Tools
            </h1>
            <p className="text-base text-ink-secondary max-w-2xl">{category.description}</p>
            <p className="mt-2 text-sm text-ink-muted">
              {category.tools.length} tools · all free · nothing uploaded
            </p>
          </div>
        </div>

        <AdSlot variant="leaderboard" className="mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {category.tools.map((tool) => (
            <ToolCard
              key={tool.slug}
              tool={{ ...tool, category, href: toolHref(category.slug, tool.slug) }}
              headingLevel="h2"
            />
          ))}
        </div>

        <AdSlot variant="in-feed" className="my-10" />

        <article className="prose-tool max-w-3xl">
          <h2>Why these run in your browser</h2>
          <p>
            Every tool in this category processes files locally. Your data is read
            into memory, transformed, and written back out as a download — it is
            never transmitted anywhere. That means no upload wait, no queue, no
            file sitting on someone else&apos;s disk afterwards, and no account
            to create.
          </p>
          <p>
            It also means these tools are bound by your device rather than a
            server. Processing speed tracks your CPU, and very large files are
            limited by available memory rather than an upload cap. Where a tool has
            a real limitation — a format it cannot reach, a quality trade-off it
            has to make — it says so in the interface before you commit to a run,
            rather than after.
          </p>
        </article>

        <AdSlot variant="anchor" />
      </div>
    </>
  );
}
