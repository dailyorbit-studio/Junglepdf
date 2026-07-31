import Link from "next/link";
import ToolCard from "./ToolCard";
import { relatedTools, categoryHref, findCategory } from "@/lib/tools";

/**
 * The "what next" rail at the foot of every tool page.
 *
 * Doing double duty: someone who just compressed an image usually has a second
 * job for the same file, and every card here is an internal link that gives
 * crawlers a path between tool pages that would otherwise only be reachable
 * from the nav.
 */
export default function RelatedTools({
  category,
  slug,
  className = "",
}: {
  category: string;
  slug: string;
  className?: string;
}) {
  const tools = relatedTools(category, slug);
  const parent = findCategory(category);

  if (tools.length === 0) return null;

  return (
    <section className={className} aria-labelledby="related-tools-heading">
      <div className="flex items-baseline justify-between mb-4 gap-4">
        <h2 id="related-tools-heading" className="text-xl font-bold text-ink">
          What next?
        </h2>
        {parent && (
          <Link
            href={categoryHref(category)}
            className="shrink-0 py-1 text-sm font-medium text-accent hover:text-accent-hover transition-colors duration-150"
          >
            All {parent.label.toLowerCase()} tools →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {tools.map((tool) => (
          <ToolCard key={tool.href} tool={tool} variant="compact" />
        ))}
      </div>
    </section>
  );
}
