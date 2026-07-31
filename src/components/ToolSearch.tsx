"use client";

import { useState, useRef, useEffect, useMemo, useCallback, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ToolIcon } from "@/lib/tool-icons";
import { searchTools, TOOL_COUNT, type ToolWithCategory } from "@/lib/tools";

/**
 * Instant tool search.
 *
 * On a site with this many tools the nav stops being a viable way to find
 * anything — iLovePDF and Smallpdf both solve it with a mega-menu, but a
 * mega-menu still requires knowing which category your task lives in, and
 * "remove the GPS from my photos" does not obviously live under Image.
 *
 * Search runs against the registry in memory. No index to build, no network
 * call, and it works offline like everything else here.
 */

interface ToolSearchProps {
  variant?: "hero" | "nav";
  /** Called after a result is chosen — lets the nav close its drawer. */
  onNavigate?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}

export default function ToolSearch({
  variant = "hero",
  onNavigate,
  autoFocus = false,
  placeholder,
}: ToolSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const results = useMemo(() => searchTools(query, variant === "nav" ? 6 : 8), [query, variant]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const go = useCallback(
    (tool: ToolWithCategory) => {
      setOpen(false);
      setQuery("");
      onNavigate?.();
      router.push(tool.href);
    },
    [router, onNavigate]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const tool = results[activeIndex];
      if (tool) go(tool);
    }
  };

  const isHero = variant === "hero";
  const showResults = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <svg
          width={isHero ? 18 : 16}
          height={isHero ? 18 : 16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showResults}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-label="Search tools"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            // Reset the highlight with the query, not in an effect reacting to
            // it — otherwise Enter on a fast keystroke opens whatever sat at
            // the old index in the new result list.
            setActiveIndex(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? `Search ${TOOL_COUNT} tools…`}
          className={`w-full bg-surface border border-border rounded-lg text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-shadow duration-150 ${
            isHero
              ? "pl-11 pr-4 py-3.5 text-base shadow-[var(--shadow-card)]"
              : "pl-9 pr-3 py-2 text-sm"
          }`}
        />
      </div>

      {showResults && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className="absolute z-50 top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-dropdown overflow-hidden max-h-[22rem] overflow-y-auto"
        >
          {results.length === 0 ? (
            <p className="px-4 py-6 text-sm text-ink-muted text-center">
              Nothing matched &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            results.map((tool, i) => (
              <Link
                key={tool.href}
                href={tool.href}
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                  onNavigate?.();
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 transition-colors duration-100 ${
                  i === activeIndex ? "bg-surface-raised" : ""
                }`}
              >
                <span
                  className={`shrink-0 w-8 h-8 rounded-md ${tool.category.subtleClass} ${tool.category.colorClass} flex items-center justify-center`}
                >
                  <ToolIcon category={tool.category.slug} slug={tool.slug} size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink truncate">{tool.name}</span>
                  <span className="block text-xs text-ink-muted truncate">
                    {tool.description}
                  </span>
                </span>
                <span className="shrink-0 text-[0.6875rem] font-medium uppercase tracking-wide text-ink-muted">
                  {tool.category.label}
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
