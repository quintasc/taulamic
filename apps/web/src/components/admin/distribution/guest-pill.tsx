import { setGuestDragData, clearGuestDrag } from '@/lib/distribution-dnd';

export function GuestPill({
  name,
  guestId,
  removable = false,
  removing = false,
  draggable = false,
  dragging = false,
  sourceTableId,
  onRemove,
  onDragStart,
  onDragEnd,
}: {
  name: string;
  guestId?: string;
  removable?: boolean;
  removing?: boolean;
  draggable?: boolean;
  dragging?: boolean;
  sourceTableId?: string;
  onRemove?: (guestId: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  const canRemove = removable && Boolean(guestId) && Boolean(onRemove);
  const canDrag =
    draggable && Boolean(guestId) && Boolean(sourceTableId) && !removing;

  const pillClass = `inline-flex items-center gap-0.5 rounded-full border border-neutral-200 bg-neutral-50 text-[13px] font-medium text-neutral-800 ${
    canRemove ? 'pl-3 pr-1.5 py-1' : 'px-3 py-1.5'
  } ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''} ${
    dragging ? 'opacity-50' : ''
  }`;

  const nameNode = <span className="py-0.5">{name}</span>;

  if (!canRemove && !canDrag) {
    return <span className={pillClass}>{name}</span>;
  }

  return (
    <span
      className={`group/pill ${pillClass}`}
      draggable={canDrag}
      onDragStart={(event) => {
        if (!canDrag || !guestId || !sourceTableId) {
          return;
        }
        setGuestDragData(event.dataTransfer, {
          guestId,
          sourceTableId,
        });
        onDragStart?.();
        event.stopPropagation();
      }}
      onDragEnd={(event) => {
        clearGuestDrag();
        onDragEnd?.();
        event.stopPropagation();
      }}
    >
      {nameNode}
      {canRemove ? (
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
      ) : null}
    </span>
  );
}
