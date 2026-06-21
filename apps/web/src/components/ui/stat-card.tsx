export function StatCard({
  label,
  value,
  hint,
  progress,
  progressColor = 'primary',
  valueHighlight = false,
}: {
  label: string;
  value: string;
  hint?: string;
  progress?: number;
  progressColor?: 'primary' | 'success' | 'warning';
  valueHighlight?: boolean;
}) {
  return (
    <div className="card-admin flex min-h-[120px] flex-col">
      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-wf-5">
        {label}
      </p>
      <p
        className={`mt-1.5 text-2xl font-bold leading-none ${
          valueHighlight ? 'text-success-500' : 'text-neutral-900'
        }`}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] text-neutral-500">{hint}</p>
      ) : (
        <span className="mt-1 flex-1" />
      )}
      {progress !== undefined ? (
        <div className="mt-2.5 h-[3px] w-full overflow-hidden rounded-sm bg-wf-3">
          <div
            className={`h-full rounded-sm transition-all ${
              progressColor === 'success'
                ? 'bg-success-500'
                : progressColor === 'warning'
                  ? 'bg-warning-500'
                  : 'bg-wf-4'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
