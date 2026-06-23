'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { GuestPill } from '@/components/admin/distribution/guest-pill';
import { RoomShapeDisplay } from '@/components/admin/floor-plan/room-shape-display';
import { Alert, EmptyState, PageHeader } from '@/components/ui';
import {
  formatRoomDimensions,
  type FloorPlanSetup,
} from '@/lib/floor-plan-setup';
import {
  countTablesByStatus,
  filterDistributionTableGroups,
  getStatusChipLabel,
  type DistributionTableFilter,
  type DistributionTableGroup,
  type TableOccupancyStatus,
} from '@/lib/distribution-view';

const STATUS_FILTER_OPTIONS: Array<{
  id: DistributionTableFilter;
  label: string;
  countKey: keyof ReturnType<typeof countTablesByStatus>;
}> = [
  { id: 'all', label: 'Todas', countKey: 'all' },
  { id: 'full', label: 'Llenas', countKey: 'full' },
  { id: 'in-use', label: 'En uso', countKey: 'inUse' },
  { id: 'empty', label: 'Vacías', countKey: 'empty' },
];

function tableCardClass(status: TableOccupancyStatus): string {
  switch (status) {
    case 'full':
      return 'border-success-500/40 bg-success-500/5 text-success-500';
    case 'in-use':
      return 'border-warning-500/40 bg-warning-500/5 text-warning-500';
    case 'empty':
      return 'border-neutral-200 bg-neutral-50 text-neutral-500';
  }
}

function TablePreviewCard({
  group,
  selected,
  onSelect,
}: {
  group: DistributionTableGroup;
  selected: boolean;
  onSelect: () => void;
}) {
  const isRound =
    group.shapeLabel === 'Redonda' || group.shapeLabel === 'Ovalada';

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`Mesa ${group.tableLabel}, ${group.assignedCount} de ${group.capacity} asientos`}
      onClick={onSelect}
      className={`flex flex-col items-center justify-center border-2 px-3 py-4 transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${tableCardClass(group.status)} ${
        isRound ? 'aspect-square min-w-[88px] rounded-full' : 'min-w-[100px] rounded-xl'
      } ${selected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
    >
      <span className="text-sm font-bold">{group.tableLabel}</span>
      <span className="mt-1 text-xs font-medium">
        {group.assignedCount}/{group.capacity}
      </span>
    </button>
  );
}

function TableGuestsPanel({
  group,
  onClose,
  compact = false,
}: {
  group: DistributionTableGroup;
  onClose: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`card-admin shadow-lg ${compact ? 'border-primary-500/30 bg-neutral-0' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.08em] text-wf-5">
            Invitados en mesa
          </h2>
          <p className="mt-1 text-sm font-semibold text-neutral-900">
            {group.tableLabel}
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {group.shapeLabel} · {getStatusChipLabel(group)} ·{' '}
            {group.assignedCount}/{group.capacity}
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-neutral-500 hover:text-neutral-700"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>

      <div className="mt-4 max-h-40 overflow-y-auto">
        {group.guestNames.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {group.guestNames.map((name) => (
              <li key={`${group.tableId}-${name}`}>
                <GuestPill name={name} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">Sin invitados asignados</p>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? 'bg-neutral-900 text-white'
          : 'border border-neutral-200 bg-neutral-0 text-neutral-700 hover:bg-neutral-50'
      }`}
      onClick={onClick}
    >
      {label}
      <span className={active ? 'text-neutral-300' : 'text-neutral-500'}>
        {count}
      </span>
    </button>
  );
}

export function FloorPlanLayoutView({
  tableGroups,
  roomSetup,
  distributionHref,
  setupHref,
}: {
  tableGroups: DistributionTableGroup[];
  roomSetup: FloorPlanSetup;
  distributionHref: string;
  setupHref: string;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<DistributionTableFilter>('all');
  const [shapeFilter, setShapeFilter] = useState<string | 'all'>('all');
  const [selectedGroup, setSelectedGroup] =
    useState<DistributionTableGroup | null>(null);

  const statusCounts = useMemo(
    () => countTablesByStatus(tableGroups),
    [tableGroups],
  );

  const shapeOptions = useMemo(() => {
    const labels = [...new Set(tableGroups.map((group) => group.shapeLabel))].sort(
      (a, b) => a.localeCompare(b, 'es'),
    );

    return [
      { id: 'all' as const, label: 'Todas', count: tableGroups.length },
      ...labels.map((label) => ({
        id: label,
        label,
        count: tableGroups.filter((group) => group.shapeLabel === label).length,
      })),
    ];
  }, [tableGroups]);

  const filteredGroups = useMemo(
    () =>
      filterDistributionTableGroups(
        tableGroups,
        statusFilter,
        search,
        shapeFilter,
      ),
    [tableGroups, statusFilter, search, shapeFilter],
  );

  useEffect(() => {
    if (!selectedGroup) {
      return;
    }
    const fresh = tableGroups.find(
      (group) => group.tableId === selectedGroup.tableId,
    );
    if (fresh) {
      setSelectedGroup(fresh);
    }
  }, [tableGroups, selectedGroup?.tableId]);

  return (
    <>
      <PageHeader
        title="Plano del salón"
        subtitle="Pulsa una mesa para ver los invitados asignados."
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" disabled>
              Restablecer
            </button>
            <button type="button" className="btn-primary" disabled>
              Guardar posiciones
            </button>
          </div>
        }
      />

      <div className="mb-6">
        <Alert variant="info">
          Pulsa una mesa en el plano para ver sus invitados. Arrastrar y guardar
          posiciones — disponible post-MVP.
        </Alert>
      </div>

      <div className="mb-6 card-admin space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="floor-plan-table-search"
              className="text-[10px] font-bold uppercase tracking-[0.08em] text-wf-5"
            >
              Buscar mesa o invitado
            </label>
            <input
              id="floor-plan-table-search"
              type="search"
              className="input-field mt-2 w-full max-w-md py-2 text-sm"
              placeholder="Ej. M1, Ana García…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <p className="shrink-0 text-xs text-neutral-500 lg:pb-2.5">
            {filteredGroups.length} de {tableGroups.length}{' '}
            {tableGroups.length === 1 ? 'mesa visible' : 'mesas visibles'}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-wf-5">
            Estado
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STATUS_FILTER_OPTIONS.map((option) => (
              <FilterChip
                key={option.id}
                active={statusFilter === option.id}
                label={option.label}
                count={statusCounts[option.countKey]}
                onClick={() => setStatusFilter(option.id)}
              />
            ))}
          </div>
        </div>

        {shapeOptions.length > 1 ? (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-wf-5">
              Forma
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {shapeOptions.map((option) => (
                <FilterChip
                  key={option.id}
                  active={shapeFilter === option.id}
                  label={option.label}
                  count={option.count}
                  onClick={() => setShapeFilter(option.id)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex min-h-[520px] flex-col">
        <div className="card-admin relative flex min-h-[480px] flex-1 flex-col overflow-visible border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-6">
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <RoomShapeDisplay setup={roomSetup} maxPx={400}>
              <div className="absolute inset-3 flex flex-wrap content-center justify-center gap-2">
                {filteredGroups.map((group) => (
                  <TablePreviewCard
                    key={group.tableId}
                    group={group}
                    selected={selectedGroup?.tableId === group.tableId}
                    onSelect={() =>
                      setSelectedGroup((current) =>
                        current?.tableId === group.tableId ? null : group,
                      )
                    }
                  />
                ))}
              </div>
            </RoomShapeDisplay>
            {filteredGroups.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Ninguna mesa coincide con los filtros
              </p>
            ) : null}
          </div>

          {selectedGroup ? (
            <div className="absolute inset-x-4 bottom-4 z-30 max-w-md sm:inset-x-auto sm:right-4 sm:left-auto sm:w-80">
              <TableGuestsPanel
                group={selectedGroup}
                compact
                onClose={() => setSelectedGroup(null)}
              />
            </div>
          ) : null}
        </div>
        <p className="mt-3 text-center text-sm font-medium text-neutral-600">
          {formatRoomDimensions(roomSetup)}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link href={distributionHref} className="btn-secondary">
          Volver a distribución
        </Link>
        <Link
          href={setupHref}
          className="text-sm font-medium text-neutral-500 hover:text-neutral-700"
        >
          Configurar plano del salón
        </Link>
      </div>
    </>
  );
}

export function FloorPlanLayoutEmpty({
  distributionHref,
}: {
  distributionHref: string;
}) {
  return (
    <EmptyState
      title="Sin distribución calculada"
      description="Calcula la distribución antes de visualizar las mesas en el plano."
      action={
        <Link href={distributionHref} className="btn-primary">
          Ir a distribución
        </Link>
      }
    />
  );
}
