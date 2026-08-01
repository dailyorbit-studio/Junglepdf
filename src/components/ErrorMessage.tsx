/**
 * Inline error callout. `role="alert"` so screen readers announce failures
 * that would otherwise pass silently.
 *
 * The icon is not decoration. Without it colour is the entire signal, and
 * roughly one man in twelve cannot read that signal — which is what WCAG 1.4.1
 * is about. It also gives someone skimming a busy tool page a shape to catch,
 * which lands faster than the wording when a run has just failed.
 */
export default function ErrorMessage({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 px-3.5 py-3 bg-error-subtle border border-error-border rounded-lg ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="shrink-0 mt-px text-error"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="7.5" x2="12" y2="13" />
        <line x1="12" y1="16.5" x2="12" y2="16.5" />
      </svg>
      <p className="text-sm text-error-ink leading-relaxed">{children}</p>
    </div>
  );
}
