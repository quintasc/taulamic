export function GuestPill({
  name,
  guestId,
  removable = false,
  removing = false,
  onRemove,
}: {
  name: string;
  guestId?: string;
  removable?: boolean;
  removing?: boolean;
  onRemove?: (guestId: string) => void;
}) {
  const canRemove = removable && Boolean(guestId) && Boolean(onRemove);

  if (!canRemove) {
    return (
      <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[13px] font-medium text-neutral-800">
        {name}
      </span>
    );
  }

  return (
    <span className="group/pill inline-flex items-center gap-0.5 rounded-full border border-neutral-200 bg-neutral-50 pl-3 pr-1.5 py-1 text-[13px] font-medium text-neutral-800">
      <span className="py-0.5">{name}</span>
      <button
        type="button"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-700 disabled:opacity-50"
        aria-label={`Quitar a ${name} de la mesa`}
        title="Quitar de la mesa"
        disabled={removing}
        onClick={(event) => {
          event.stopPropagation();
          onRemove?.(guestId!);
        }}
      >
        ×
      </button>
    </span>
  );
}
