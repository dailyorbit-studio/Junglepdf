"use client";

import { useState, useMemo } from "react";
import ToolCard from "./ToolCard";
import { Leaf } from "./Foliage";
import {
  TOOL_CATEGORIES,
  ALL_TOOLS,
  TOOL_COUNT,
  popularFirst,
  type ToolWithCategory,
} from "@/lib/tools";

/**
 * The homepage tool grid with category filtering.
 *
 * Filtering happens in the client against the full list rather than by
 * navigating to a category route, because the whole catalogue is already in
 * the bundle — a round trip to show a subset of data the page is holding would
 * be slower and would lose the user's place.
 *
 * Every tool stays in the DOM regardless of the active filter. Rendering only
 * the matching subset would hide 30 of 37 internal links from a crawler that
 * does not execute the click, which is exactly the links this page exists to
 * provide.
 */

type Filter = "all" | string;

export default function ToolExplorer() {
  const [filter, setFilter] = useState<Filter>("all");

  // Each section leads with the tools people actually come here for, so the
  // first row of a category is the answer to the common job rather than
  // whatever happened to be added to the registry first.
  const groups = useMemo(() => {
    const cats =
      filter === "all"
        ? TOOL_CATEGORIES
        : TOOL_CATEGORIES.filter((c) => c.slug === filter);

    return cats.map((cat) => ({
      category: cat,
      tools: popularFirst(ALL_TOOLS.filter((t) => t.category.slug === cat.slug)),
    }));
  }, [filter]);

  return (
    <section
      id="all-tools"
      // scroll-mt clears the sticky header, or an anchor jump lands with the
      // filter chips hidden underneath it.
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 scroll-mt-20"
    >
      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-8" role="tablist" aria-label="Filter tools by category">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>
          All {TOOL_COUNT}
        </Chip>
        {TOOL_CATEGORIES.map((cat) => (
          <Chip
            key={cat.slug}
            active={filter === cat.slug}
            onClick={() => setFilter(cat.slug)}
            dotClass={cat.colorClass.replace("text-", "bg-")}
          >
            {cat.label}
            <span className="ml-1.5 text-ink-muted">{cat.tools.length}</span>
          </Chip>
        ))}
      </div>

      <div className="space-y-12">
        {groups.map(({ category, tools }) => (
          <div key={category.slug}>
            <div className="flex items-baseline justify-between gap-4 mb-4">
              {/*
                Leaf-green, not the category colour. Tinting it per category
                produced a crimson leaf on "PDF tools" and an orange one on
                "Video tools" — the motif only reads as foliage while it stays
                the colour foliage is. The category colour is already doing its
                job on the tool icons directly below.
              */}
              <h2 className="flex items-center gap-2 text-lg font-bold text-ink tracking-tight">
                <Leaf className="w-4 h-4 shrink-0 text-leaf" />
                {category.label} tools
              </h2>
              <a
                href={`/${category.slug}/`}
                className="shrink-0 py-1 text-sm font-medium text-accent hover:text-accent-hover transition-colors duration-150"
              >
                View all →
              </a>
            </div>

            <p className="text-sm text-ink-secondary leading-relaxed max-w-3xl mb-5">
              {category.description}
            </p>

            {/*
              md:3 rather than jumping straight from 2 to 3 at lg: a portrait
              tablet is 768–1024 wide and was showing two cards per row with
              the description wrapping to two lines — a third column fits
              comfortably there.
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {tools.map((tool: ToolWithCategory) => (
                <ToolCard key={tool.href} tool={tool} headingLevel="h3" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
  dotClass,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dotClass?: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-full border transition-all duration-150 ${
        active
          ? "border-accent bg-accent text-white shadow-[var(--shadow-card)]"
          : "border-border bg-surface text-ink-secondary hover:border-ink-muted hover:text-ink"
      }`}
    >
      {dotClass && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${active ? "bg-white/70" : dotClass}`}
        />
      )}
      {children}
    </button>
  );
}
