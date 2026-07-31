/**
 * Amber callout for outcomes that succeeded but come with a caveat — a
 * dropped AcroForm, a target size we couldn't reach, a file we left alone.
 */
export default function NoticeMessage({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-lg ${className}`}>
      <p className="text-sm text-amber-800">{children}</p>
    </div>
  );
}
