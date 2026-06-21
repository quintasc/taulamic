import Link from 'next/link';
import Image from 'next/image';

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
      className={`rounded-lg border px-4 py-3 text-sm ${alertStyles[variant]}`}
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
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card-admin">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
      {hint ? (
        <p className="mt-1 text-sm text-neutral-500">{hint}</p>
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
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
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
    <div className="card-admin flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-2xl text-neutral-500">
        ▦
      </div>
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-neutral-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function MarketingHeader() {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 md:px-12">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/taulamic-logo.png"
          alt="Taulamic"
          width={32}
          height={32}
        />
        <span className="text-lg font-semibold lowercase text-neutral-900">
          taulamic
        </span>
      </Link>
      <nav className="hidden items-center gap-8 text-sm text-neutral-700 md:flex">
        <span className="cursor-default">Sobre nosotros</span>
        <span className="cursor-default">Precios</span>
        <span className="cursor-default">Blog</span>
      </nav>
      <Link href="/admin" className="btn-primary text-sm">
        Iniciar sesión
      </Link>
    </header>
  );
}
