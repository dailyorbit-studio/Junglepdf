interface ProgressBarProps {
  progress: number; // 0–100
  label?: string;
  className?: string;
}

export default function ProgressBar({ progress, label, className = "" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-ink-secondary">{label}</p>
          <p className="text-sm font-medium text-ink tabular-nums">{Math.round(clamped)}%</p>
        </div>
      )}
      <div className="w-full h-2 bg-surface-raised rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300 ease-[var(--ease-smooth)]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
