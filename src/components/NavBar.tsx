"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import BrandMark from "./BrandMark";
import { usePathname } from "next/navigation";
import ToolSearch from "./ToolSearch";
import { ToolIcon } from "@/lib/tool-icons";
import { TOOL_CATEGORIES, categoryHref, toolHref, TOOL_COUNT } from "@/lib/tools";
import { SITE_NAME } from "@/lib/site";

/**
 * Top navigation.
 *
 * The old version put each category behind its own hover dropdown, which was
 * fine for five tools and unusable at thirty-seven — finding "Extract Frames"
 * meant guessing that it lived under Video and then reading a 9-item list.
 *
 * This is the pattern iLovePDF and Smallpdf both converged on: the three or
 * four highest-traffic tools as direct links, then one "All Tools" panel that
 * shows the entire catalogue grouped by category, plus search for anyone who
 * knows what they want and does not care which category it is in.
 */

/** Direct links, by search volume. Everything else lives in the panel. */
const FEATURED = [
  { label: "Merge PDF", href: "/pdf/merge-pdf/" },
  { label: "Compress Image", href: "/image/compressor/" },
  { label: "Video to MP3", href: "/audio/video-to-mp3/" },
];

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Route changes have to close both menus, or tapping a tool on mobile
  // navigates behind a drawer that is still covering the screen. Adjusted
  // during render rather than in an effect: an effect would paint the new
  // route with the old drawer still open and then close it on the next frame.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setPanelOpen(false);
  }

  useEffect(() => {
    if (!panelOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;

      // The trigger has to be excluded, not just the panel. Clicking "All
      // Tools" to close fired mousedown first (closing the panel), then the
      // button's own click toggled it straight back open — so the panel only
      // stayed shut if you clicked and moved the cursor away fast enough.
      if (triggerRef.current?.contains(target)) return;

      if (!panelRef.current?.contains(target)) setPanelOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [panelOpen]);

  // Lock body scroll behind the mobile drawer.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white">
              <BrandMark size={16} />
            </div>
            <span className="text-base font-bold text-ink tracking-tight group-hover:text-accent transition-colors duration-200">
              {SITE_NAME}
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1 flex-1">
            {FEATURED.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-ink-secondary hover:text-ink rounded-md hover:bg-surface-raised transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              aria-expanded={panelOpen}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-ink-secondary hover:text-ink rounded-md hover:bg-surface-raised transition-colors duration-150"
            >
              All Tools
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform duration-200 ${panelOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </button>
          </div>

          {/* Desktop search */}
          <div className="hidden md:block w-56 lg:w-72 shrink-0">
            <ToolSearch variant="nav" />
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 -mr-2 rounded-md text-ink-secondary hover:bg-surface-raised transition-colors duration-150"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Desktop mega-panel */}
      {panelOpen && (
        <div
          ref={panelRef}
          /*
            The height cap is load-bearing. The panel is absolutely positioned
            under a sticky nav, so anything below the fold is unreachable — no
            amount of page scrolling brings it into view. The PDF column passing
            fifteen tools was enough to push its last entries off a laptop
            screen entirely.
          */
          className="hidden lg:block absolute top-full left-0 right-0 bg-surface border-b border-border shadow-dropdown max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
            {/*
              A fifth column gives the long categories somewhere to go: one
              tall column forces the whole panel to its height, and the other
              three then sit in a field of white space.

              1152px rather than the xl breakpoint because that is where it
              starts paying: below it the five columns are narrow enough that
              a longer label like "Remove EXIF Data" wraps onto a second line,
              which costs more height than the split saves.
            */}
            <div className="grid grid-cols-4 min-[1152px]:grid-cols-5 gap-x-6 gap-y-2">
              {TOOL_CATEGORIES.map((cat) => (
                <div
                  key={cat.slug}
                  className={cat.tools.length > 10 ? "min-[1152px]:col-span-2" : ""}
                >
                  <Link
                    href={categoryHref(cat.slug)}
                    className="flex items-center gap-2 mb-3 group"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cat.colorClass.replace("text-", "bg-")}`} />
                    <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider group-hover:text-ink transition-colors duration-150">
                      {cat.label}
                    </span>
                  </Link>

                  <ul
                    className={
                      cat.tools.length > 10
                        ? "min-[1152px]:columns-2 min-[1152px]:gap-x-6 space-y-0.5"
                        : "space-y-0.5"
                    }
                  >
                    {cat.tools.map((tool) => (
                      // break-inside-avoid: without it a link splits across the
                      // column boundary, icon at the bottom of one and label at
                      // the top of the next.
                      <li key={tool.slug} className="break-inside-avoid">
                        <Link
                          href={toolHref(cat.slug, tool.slug)}
                          className="flex items-center gap-2.5 px-2 py-1.5 -mx-2 rounded-md hover:bg-surface-raised transition-colors duration-150 group"
                        >
                          <span className={`shrink-0 ${cat.colorClass} opacity-80 group-hover:opacity-100 transition-opacity`}>
                            <ToolIcon category={cat.slug} slug={tool.slug} size={16} />
                          </span>
                          <span className="text-sm text-ink-secondary group-hover:text-ink transition-colors duration-150">
                            {tool.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-border-subtle flex items-center justify-between">
              <p className="text-xs text-ink-muted">
                {TOOL_COUNT} tools. Every one runs in your browser — no uploads, no account.
              </p>
              {/*
                Was href="/" — which did nothing at all when you were already
                on the homepage, since the route never changed and the panel
                only closes on a route change. Anchoring to the grid means it
                works from the homepage and from every tool page, and the
                explicit close covers the same-page case.
              */}
              <Link
                href="/#all-tools"
                onClick={(e) => {
                  setPanelOpen(false);

                  // On the homepage the route does not change, and the App
                  // Router treats a same-route hash link as a no-op — the
                  // click did nothing at all. Scroll it ourselves when the
                  // grid is on this page; otherwise let the Link navigate.
                  const grid = document.getElementById("all-tools");
                  if (grid) {
                    e.preventDefault();
                    // Smooth is opt-in here rather than global: setting it on
                    // <html> broke the router's scroll-to-top on navigation.
                    // Reduced-motion is honoured explicitly since there is no
                    // longer a stylesheet rule doing it for us.
                    const still = window.matchMedia(
                      "(prefers-reduced-motion: reduce)"
                    ).matches;
                    grid.scrollIntoView({
                      block: "start",
                      behavior: still ? "auto" : "smooth",
                    });
                  }
                }}
                className="text-xs font-medium text-accent hover:text-accent-hover transition-colors duration-150"
              >
                Browse all →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/*
        Mobile drawer.

        dvh, not vh: on mobile Safari and Chrome `100vh` is the height with the
        address bar retracted, so a vh-based cap puts the last few tools
        underneath the browser chrome until you scroll the page itself.
      */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-surface max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain">
          <div className="px-4 py-4">
            <ToolSearch variant="nav" onNavigate={() => setMobileOpen(false)} />
          </div>

          <div className="px-4 pb-4 space-y-5">
            {TOOL_CATEGORIES.map((cat) => (
              <div key={cat.slug}>
                <Link
                  href={categoryHref(cat.slug)}
                  className="flex items-center gap-2 px-1 py-1.5 mb-1"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cat.colorClass.replace("text-", "bg-")}`} />
                  <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    {cat.label}
                  </span>
                </Link>

                <div className="grid grid-cols-2 gap-1">
                  {cat.tools.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={toolHref(cat.slug, tool.slug)}
                      className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-surface-raised transition-colors duration-150"
                    >
                      <span className={`shrink-0 ${cat.colorClass}`}>
                        <ToolIcon category={cat.slug} slug={tool.slug} size={15} />
                      </span>
                      <span className="text-[0.8125rem] text-ink-secondary truncate">
                        {tool.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/*
              py-1.5 rather than bare text: at 12px these were a 16px-tall tap
              target in a drawer that only exists on touch devices, well under
              the 24px WCAG 2.5.8 floor.
            */}
            <div className="border-t border-border-subtle pt-2 flex flex-wrap gap-x-5">
              <Link href="/legal/privacy-policy/" className="inline-block py-1.5 text-xs text-ink-muted hover:text-ink-secondary">Privacy</Link>
              <Link href="/legal/terms-of-use/" className="inline-block py-1.5 text-xs text-ink-muted hover:text-ink-secondary">Terms</Link>
              <Link href="/legal/contact/" className="inline-block py-1.5 text-xs text-ink-muted hover:text-ink-secondary">Contact</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
