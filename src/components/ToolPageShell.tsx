import AdSlot from "./AdSlot";
import FAQAccordion, { type FAQItem } from "./FAQAccordion";
import RelatedTools from "./RelatedTools";
import { ToolIcon } from "@/lib/tool-icons";
import { findTool } from "@/lib/tools";
import { SITE_URL, SITE_NAME } from "@/lib/site";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ToolPageShellProps {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  /** Registry coordinates — drives the icon, the schema and the related rail. */
  category: string;
  slug: string;
  children: React.ReactNode;
  articleContent: React.ReactNode;
  faqItems: FAQItem[];
  /** Optional ordered steps, emitted as HowTo schema and shown above the tool. */
  steps?: string[];
}

export default function ToolPageShell({
  title,
  description,
  breadcrumbs,
  category,
  slug,
  children,
  articleContent,
  faqItems,
  steps,
}: ToolPageShellProps) {
  const tool = findTool(category, slug);
  const canonical = `${SITE_URL}/${category}/${slug}/`;

  // next.config sets `trailingSlash: true`, so "/pdf" 308-redirects to "/pdf/".
  // Breadcrumbs were written without the slash, which cost a redirect on every
  // click and pointed the schema at a non-canonical URL.
  const withSlash = (href: string) => (href.endsWith("/") ? href : `${href}/`);

  return (
    <>
      {/*
        Breadcrumb JSON-LD. `item` has to be an absolute URL — Google silently
        drops the whole breadcrumb when it is a path, which is what these were
        before.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbs.map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: item.label,
              ...(item.href ? { item: `${SITE_URL}${withSlash(item.href)}` } : {}),
            })),
          }),
        }}
      />

      {/*
        Each tool is its own free WebApplication. Declaring it per-tool rather
        than only site-wide is what lets a tool page show as an application
        result rather than an ordinary blue link.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: title,
            url: canonical,
            description,
            applicationCategory: "UtilityApplication",
            operatingSystem: "Any",
            browserRequirements: "Requires a modern browser with JavaScript enabled",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            featureList: tool?.summary,
          }),
        }}
      />

      {steps && steps.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: `How to ${title.toLowerCase()}`,
              description,
              totalTime: "PT1M",
              // A HowTo with no cost is what makes the "free" eligible for the
              // rich result; omitting it drops the whole block.
              estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
              step: steps.map((text, i) => ({
                "@type": "HowToStep",
                position: i + 1,
                name: text,
                text,
                url: `${canonical}#step-${i + 1}`,
              })),
            }),
          }}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/*
          py-1 on the links: at 12px these were a 16px-tall tap target, which
          is under the 24px WCAG 2.5.8 floor and awkward to hit on a phone. The
          nav's own margin absorbs the extra height.
        */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-x-1.5 text-xs text-ink-muted mb-5">
          {breadcrumbs.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-border">/</span>}
              {item.href ? (
                <a href={withSlash(item.href)} className="inline-block px-0.5 py-1 -mx-0.5 hover:text-ink-secondary transition-colors duration-150">
                  {item.label}
                </a>
              ) : (
                <span className="text-ink-secondary">{item.label}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Page header */}
        <div className="mb-8 flex items-start gap-4">
          {tool && (
            <div
              className={`hidden sm:flex shrink-0 w-14 h-14 rounded-xl ${tool.category.subtleClass} ${tool.category.colorClass} items-center justify-center`}
            >
              <ToolIcon category={category} slug={slug} size={28} />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight mb-2">
              {title}
            </h1>
            <p className="text-base text-ink-secondary max-w-2xl">{description}</p>
          </div>
        </div>

        <AdSlot variant="leaderboard" className="mb-8" />

        {/* Tool content area */}
        <div className="bg-surface border border-border rounded-xl p-5 sm:p-8 shadow-[var(--shadow-card)]">
          {children}
        </div>

        {/* Privacy reassurance — the single most common hesitation on a file tool. */}
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Processed on your device. This file is never uploaded.
        </p>

        {steps && steps.length > 0 && (
          <ol className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map((step, i) => (
              <li
                key={i}
                id={`step-${i + 1}`}
                className="flex gap-3 p-4 bg-surface-raised rounded-lg"
              >
                <span className="shrink-0 w-6 h-6 rounded-full bg-accent text-white text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-ink-secondary leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        )}

        <AdSlot variant="in-feed" className="my-10" />

        <article className="prose-tool max-w-none mb-12">{articleContent}</article>

        <FAQAccordion items={faqItems} className="mb-12" />

        <RelatedTools category={category} slug={slug} className="mb-12" />

        <AdSlot variant="anchor" />
      </div>
    </>
  );
}
