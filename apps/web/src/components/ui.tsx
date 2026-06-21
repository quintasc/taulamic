import Link from 'next/link';
import type { ReactNode } from 'react';
import { IconUpload } from '@/components/icons';

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

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[17px] font-semibold text-neutral-900">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-[13px] text-neutral-500">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2.5 text-[9px] font-bold uppercase tracking-[0.08em] text-wf-5">
      {children}
    </h2>
  );
}

export function QuickAccessCard({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2.5 rounded-lg border border-wf-3 bg-neutral-0 p-4 text-left transition hover:border-wf-4"
    >
      <span className="text-wf-4">{icon}</span>
      <span className="text-xs font-medium text-neutral-700">{label}</span>
    </Link>
  );
}

export function UploadZone({
  title,
  hint,
  accept,
  disabled,
  onFile,
  buttonLabel = 'Subir plano',
}: {
  title: string;
  hint: string;
  accept: string;
  disabled?: boolean;
  onFile: (file: File) => void;
  buttonLabel?: string;
}) {
  function pick(fileList: FileList | null) {
    const file = fileList?.[0];
    if (file) {
      onFile(file);
    }
  }

  return (
    <label
      className={`upload-zone cursor-pointer ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (!disabled) {
          pick(event.dataTransfer.files);
        }
      }}
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-500">
        <IconUpload width={28} height={28} strokeWidth={1.5} />
      </span>
      <p className="text-base font-semibold text-neutral-900">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{hint}</p>
      <span className="btn-primary mt-6">{buttonLabel}</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(event) => pick(event.target.files)}
      />
    </label>
  );
}

export function PreferenceOption({
  selected,
  title,
  description,
  onSelect,
}: {
  selected: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full cursor-pointer items-start gap-4 rounded-[10px] border-2 p-4 text-left transition ${
        selected
          ? 'border-primary-500 bg-neutral-0'
          : 'border-wf-3 bg-neutral-0 hover:border-wf-4'
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? 'border-primary-500' : 'border-neutral-300'
        }`}
      >
        {selected ? (
          <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
        ) : null}
      </span>
      <span>
        <span className="block font-semibold text-neutral-900">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-neutral-500">
          {description}
        </span>
      </span>
    </button>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-admin flex min-h-[320px] flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-3xl text-neutral-400">
        ▦
      </div>
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-neutral-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
