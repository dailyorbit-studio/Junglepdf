/**
 * Amber callout for outcomes that succeeded but come with a caveat — dropped
 * form fields, a target size we couldn't reach, a file we left alone.
 *
 * Deliberately not an error. These are the moments where a tool has to admit a
 * limit, and putting that in red would teach people to read a working result as
 * a failure. Amber plus a triangle says "worth reading", not "this broke".
 */
export default function NoticeMessage({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start gap-2.5 px-3.5 py-3 bg-warning-subtle border border-warning-border rounded-lg ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 mt-px text-warning"
        aria-hidden="true"
      >
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        <line x1="12" y1="9" x2="12" y2="13.5" />
        <line x1="12" y1="17" x2="12" y2="17" />
      </svg>
      <p className="text-sm text-warning-ink leading-relaxed">{children}</p>
    </div>
  );
}
