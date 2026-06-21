type AlertVariant = 'success' | 'warning' | 'error' | 'info';

const alertStyles: Record<AlertVariant, string> = {
  success: 'border-success-500/30 bg-success-500/10 text-neutral-900',
  warning: 'border-warning-500/30 bg-warning-500/10 text-neutral-900',
  error: 'border-error-500/30 bg-error-500/10 text-neutral-900',
  info: 'border-info-500/30 bg-info-500/10 text-neutral-900',
};

export function Alert({
  variant,
  children,
}: {
  variant: AlertVariant;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${alertStyles[variant]}`}
      role="alert"
    >
      {children}
    </div>
  );
}
