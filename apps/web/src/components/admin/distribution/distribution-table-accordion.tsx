'use client';

import { IconChevronDown } from '@/components/icons';
import { GuestPill } from '@/components/admin/distribution/guest-pill';
import type { DistributionTableGroup } from '@/lib/distribution-view';

export function DistributionTableAccordion({
  group,
  open,
  onToggle,
}: {
  group: DistributionTableGroup;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="card-admin overflow-hidden p-0">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-neutral-50"
        aria-expanded={open}
        onClick={onToggle}
      >
        <IconChevronDown
          width={16}
          height={16}
          className={`shrink-0 text-neutral-400 transition-transform ${
            open ? 'rotate-0' : '-rotate-90'
          }`}
        />
        <span className="min-w-0 flex-1 text-sm font-semibold text-neutral-900">
          {group.tableLabel}
        </span>
        <span className="hidden text-xs text-neutral-500 sm:inline">
          {group.shapeLabel}
        </span>
        <span className="text-xs text-neutral-500">
          {group.assignedCount}/{group.capacity} pax
        </span>
        <span className="inline-flex shrink-0 rounded-full border border-success-500/30 bg-success-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-success-500">
          Afinidad {group.affinityPercent}%
        </span>
      </button>
      {open ? (
        <div className="flex flex-wrap gap-2 border-t border-neutral-200 px-5 py-4">
          {group.guestNames.map((name) => (
            <GuestPill key={`${group.tableId}-${name}`} name={name} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
