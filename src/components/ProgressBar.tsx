interface ProgressBarProps {
  progress: number; // 0–100
  label?: string;
  /** Extra reassurance under the bar, for jobs measured in minutes. */
  hint?: string;
  className?: string;
}

/**
 * The progress bar every tool reports through.
 *
 * Below 1% it switches itself to an indeterminate drift instead of rendering an
 * empty track. That gap is real work, not a rounding artefact: FFmpeg reports
 * nothing at all while it probes and builds its filter graph, and pdf.js reports
 * nothing while the first page rasterises. An empty bar sitting under the words
 * "Loading media engine…" is indistinguishable from a hung tab, and the honest
 * signal at that moment is "running, can't say how far" — which is what a moving
 * band means and what a frozen 0% does not.
 *
 * It also carries the ARIA progressbar role, which it previously had none of, so
 * the state is available to a screen reader rather than only to the eye.
 */
export default function ProgressBar({
  progress,
  label,
  hint,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  const indeterminate = clamped < 1;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-sm font-medium text-ink-secondary">{label}</p>
          {!indeterminate && (
            <p className="text-sm font-semibold text-ink tabular-nums shrink-0">
              {Math.round(clamped)}%
            </p>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-label={label ?? "Progress"}
        aria-valuemin={0}
        aria-valuemax={100}
        // Omitted entirely while indeterminate — that is precisely what tells
        // assistive tech "busy, position unknown".
        {...(indeterminate ? {} : { "aria-valuenow": Math.round(clamped) })}
        className={`relative w-full h-2 bg-surface-raised rounded-full overflow-hidden ${
          indeterminate ? "progress-indeterminate" : ""
        }`}
      >
        {!indeterminate && (
          <div
            className="h-full bg-accent rounded-full transition-all duration-300 ease-[var(--ease-smooth)]"
            style={{ width: `${clamped}%` }}
          />
        )}
      </div>

      {hint && <p className="mt-2 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}
