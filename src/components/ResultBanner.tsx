/**
 * Success callout shown when a tool finishes. `children` holds any extra
 * detail (stat grids, warnings) below the headline.
 *
 * The check sits in a filled disc rather than floating as a bare tick. This is
 * the one moment in the flow that should feel like an arrival — the tool has
 * finished and the file is ready — and a solid mark reads as a stamp where a
 * hairline stroke read as just another row of text.
 */
export default function ResultBanner({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-success-subtle border border-success-border rounded-lg">
      <div className="flex items-center gap-3">
        <span
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-success text-white"
          aria-hidden="true"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20,6 9,17 4,12" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-success-ink">{title}</p>
          {detail && (
            <p className="text-xs text-success-ink/80 mt-0.5 truncate">{detail}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
