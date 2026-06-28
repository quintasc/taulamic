'use client';

import { IconMail } from '@/components/icons';

const BULK_ACTIONS = [
  { id: 'send', label: 'Enviar invitaciones' },
  { id: 'reminder', label: 'Recordatorio RSVP' },
  { id: 'category', label: 'Asignar categoría' },
  { id: 'export', label: 'Exportar selección' },
] as const;

export function GuestsBulkBarV2({
  selectedCount,
  totalSelectedCount,
  onClear,
}: {
  selectedCount: number;
  /** Selección total incluyendo filas ocultas por filtro */
  totalSelectedCount?: number;
  onClear: () => void;
}) {
  if (selectedCount === 0) {
    return null;
  }

  const total = totalSelectedCount ?? selectedCount;
  const countLabel =
    total !== selectedCount
      ? `${selectedCount} visible${selectedCount === 1 ? '' : 's'} (${total} en total)`
      : `${selectedCount} seleccionado${selectedCount === 1 ? '' : 's'}`;

  return (
    <div className="fixed bottom-6 left-1/2 z-30 flex w-[min(100%,42rem)] -translate-x-1/2 flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-0 px-4 py-3 shadow-lg">
      <span className="text-sm font-medium text-neutral-900">{countLabel}</span>
      <div className="flex flex-1 flex-wrap gap-2">
        {BULK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled
            title="Próximamente — no operativo en piloto"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-400"
          >
            <IconMail width={12} height={12} className="opacity-50" />
            {action.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
        onClick={onClear}
      >
        Limpiar
      </button>
    </div>
  );
}
