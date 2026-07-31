import Link from "next/link";
import { ToolIcon } from "@/lib/tool-icons";
import type { ToolWithCategory } from "@/lib/tools";

/**
 * The tool card, used by the homepage grid, the category index and the
 * related-tools rail.
 *
 * One component rather than three copies because the three surfaces kept
 * drifting apart — the homepage grew hover states that the category pages
 * never got, so the same tool looked like two different things depending on
 * how you arrived at it.
 *
 * Cards carry no corner badges. "New" and "Popular" labelled roughly half the
 * catalogue between them, which made the grid read as decorated rather than
 * ranked; the ordering already puts the most-wanted tools first, so the badge
 * was saying a second time what position was saying anyway.
 */

interface ToolCardProps {
  tool: ToolWithCategory;
  /** `compact` drops the description — for dense rails. */
  variant?: "default" | "compact";
  /** Renders the name as an <h2>/<h3> instead of a <span>, for pages whose
   *  heading outline should include the tool names. */
  headingLevel?: "h2" | "h3" | null;
}

export default function ToolCard({
  tool,
  variant = "default",
  headingLevel = null,
}: ToolCardProps) {
  const Heading = headingLevel ?? "span";

  return (
    <Link
      href={tool.href}
      className="group relative flex flex-col bg-surface border border-border rounded-xl p-4 sm:p-5 hover:border-accent/40 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-10 h-10 rounded-lg ${tool.category.subtleClass} ${tool.category.colorClass} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}
        >
          <ToolIcon category={tool.category.slug} slug={tool.slug} size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <Heading className="block text-sm sm:text-[0.9375rem] font-semibold text-ink leading-snug group-hover:text-accent transition-colors duration-200">
            {tool.name}
          </Heading>

          {variant === "default" && (
            <p className="mt-1 text-[0.8125rem] text-ink-secondary leading-relaxed line-clamp-2">
              {tool.description}
            </p>
          )}
        </div>
      </div>

    </Link>
  );
}
