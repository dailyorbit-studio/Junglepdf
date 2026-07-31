/**
 * Success callout shown when a tool finishes. `children` holds any extra
 * detail (stat grids, warnings) below the headline.
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
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-success shrink-0"
          aria-hidden="true"
        >
          <polyline points="20,6 9,17 4,12" />
        </svg>
        <div className="min-w-0">
          <p className="text-sm font-medium text-green-800">{title}</p>
          {detail && <p className="text-xs text-green-700 mt-0.5 truncate">{detail}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
