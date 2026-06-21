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
