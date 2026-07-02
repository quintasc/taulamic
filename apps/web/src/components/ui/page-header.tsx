export function PageHeader({
  title,
  subtitle,
  action,
  saveStatus,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  saveStatus?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[17px] font-semibold text-neutral-900">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-[13px] text-neutral-500">{subtitle}</p>
        ) : null}
      </div>
      {saveStatus || action ? (
        <div className="flex shrink-0 flex-row items-center gap-3">
          {action}
          {saveStatus}
        </div>
      ) : null}
    </div>
  );
}
