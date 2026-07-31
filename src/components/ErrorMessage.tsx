/**
 * Inline error callout. `role="alert"` so screen readers announce failures
 * that would otherwise pass silently.
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
      className={`px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-lg ${className}`}
    >
      <p className="text-sm text-red-700">{children}</p>
    </div>
  );
}
