'use client';

import { useMemo, useState } from 'react';
import { IconChevronDown } from '@/components/icons';
import { GuestPill } from '@/components/admin/distribution/guest-pill';
import {
  countTablesByStatus,
  filterDistributionTableGroups,
  formatPilotTableAffinity,
  getStatusChipLabel,
  PILOT_AFFINITY_LABEL,
  type DistributionTableFilter,
  type DistributionTableGroup,
  type TableOccupancyStatus,
} from '@/lib/distribution-view';
import {
  filterChipClass,
  filterChipCountClass,
  tableStatusBadgeClass,
  tableStatusBarClass,
  tableStatusDotClass,
} from '@/lib/semantic-ui';

const FILTER_OPTIONS: Array<{
  id: DistributionTableFilter;
  label: string;
  countKey: keyof ReturnType<typeof countTablesByStatus>;
}> = [
  { id: 'all', label: 'Todas', countKey: 'all' },
  { id: 'full', label: 'Llenas', countKey: 'full' },
  { id: 'in-use', label: 'En uso', countKey: 'inUse' },
  { id: 'empty', label: 'Vacías', countKey: 'empty' },
];

function StatusDot({ status }: { status: TableOccupancyStatus }) {
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${tableStatusDotClass(status)}`}
      aria-hidden
    />
  );
}

function StatusChip({ group }: { group: DistributionTableGroup }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tableStatusBadgeClass(group.status)}`}
    >
      {getStatusChipLabel(group)}
    </span>
  );
}

function TableMesaCell({ group }: { group: DistributionTableGroup }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
      <span className="inline-flex items-center gap-2.5">
        <StatusDot status={group.status} />
        <span className="text-sm font-semibold text-neutral-900">
          {group.tableLabel}
        </span>
      </span>
      <StatusChip group={group} />
    </div>
  );
}

function CapacityBar({ group }: { group: DistributionTableGroup }) {
  const fillPercent =
    group.capacity > 0
      ? Math.min(100, (group.assignedCount / group.capacity) * 100)
      : 0;
  const barClass = tableStatusBarClass(group.status);

  return (
    <div className="flex min-w-[7.5rem] items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-wf-2">
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums text-neutral-700">
        {group.assignedCount}/{group.capacity}
      </span>
    </div>
  );
}

function AffinityCell({ group }: { group: DistributionTableGroup }) {
  const label = formatPilotTableAffinity(group);
  if (label === '—') {
    return <span className="text-neutral-400">—</span>;
  }
  return (
    <span
      className="text-xs font-medium text-neutral-500"
      title={PILOT_AFFINITY_LABEL}
    >
      {label}
    </span>
  );
}

function DistributionTableRow({
  group,
  open,
  onToggle,
}: {
  group: DistributionTableGroup;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        type="button"
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-3 px-5 py-4 text-left transition hover:bg-neutral-50 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.6fr)_auto] sm:items-center"
        aria-expanded={open}
        onClick={onToggle}
      >
        <TableMesaCell group={group} />

        <span className="hidden text-sm text-neutral-600 sm:block">
          {group.shapeLabel}
        </span>

        <span className="hidden sm:block">
          <CapacityBar group={group} />
        </span>

        <span className="hidden text-right text-sm sm:block">
          <AffinityCell group={group} />
        </span>

        <IconChevronDown
          width={16}
          height={16}
          className={`shrink-0 text-neutral-400 transition-transform ${
            open ? 'rotate-0' : '-rotate-90'
          }`}
        />
      </button>

      <div className="px-5 pb-3 sm:hidden">
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
          <span>{group.shapeLabel}</span>
          <CapacityBar group={group} />
          <AffinityCell group={group} />
        </div>
      </div>

      {open ? (
        <div className="border-t border-neutral-200 bg-wf-1 px-5 py-4">
          {group.guestNames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {group.guestNames.map((name) => (
                <GuestPill key={`${group.tableId}-${name}`} name={name} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Sin invitados asignados</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function DistributionTableList({
  tableGroups,
}: {
  tableGroups: DistributionTableGroup[];
}) {
  const [filter, setFilter] = useState<DistributionTableFilter>('all');
  const [search, setSearch] = useState('');
  const [openTableId, setOpenTableId] = useState<string | null>(null);

  const statusCounts = useMemo(
    () => countTablesByStatus(tableGroups),
    [tableGroups],
  );

  const visibleGroups = useMemo(
    () => filterDistributionTableGroups(tableGroups, filter, search),
    [tableGroups, filter, search],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => {
            const count = statusCounts[option.countKey];
            const active = filter === option.id;

            return (
              <button
                key={option.id}
                type="button"
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${filterChipClass(active)}`}
                onClick={() => setFilter(option.id)}
              >
                {option.label}
                <span className={filterChipCountClass(active)}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <input
            type="search"
            className="input-field max-w-xs py-2 text-sm"
            placeholder="Buscar mesa o invitado…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <p className="shrink-0 text-xs font-medium text-neutral-500">
            {tableGroups.length}{' '}
            {tableGroups.length === 1 ? 'mesa' : 'mesas'}
          </p>
        </div>
      </div>

      <div className="card-admin overflow-hidden p-0">
        <div className="hidden border-b border-neutral-200 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-wf-5 sm:grid sm:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.6fr)_auto] sm:gap-3">
          <span>Mesa</span>
          <span>Forma</span>
          <span>Capacidad</span>
          <span className="text-right">Afinidad</span>
          <span className="w-4" aria-hidden />
        </div>

        {visibleGroups.length > 0 ? (
          visibleGroups.map((group) => (
            <DistributionTableRow
              key={group.tableId}
              group={group}
              open={openTableId === group.tableId}
              onToggle={() =>
                setOpenTableId((current) =>
                  current === group.tableId ? null : group.tableId,
                )
              }
            />
          ))
        ) : (
          <p className="px-5 py-8 text-center text-sm text-neutral-500">
            Ninguna mesa coincide con el filtro.
          </p>
        )}
      </div>
    </div>
  );
}
