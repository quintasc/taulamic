'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { GuestPill } from '@/components/admin/distribution/guest-pill';
import { AssignGuestDialog } from '@/components/admin/distribution/assign-guest-dialog';
import { PlacementMutationFeedback } from '@/components/admin/distribution/placement-mutation-feedback';
import { FloorPlanAccessoriesOverlay } from '@/components/admin/floor-plan/floor-plan-accessories-overlay';
import { RoomShapeDisplay } from '@/components/admin/floor-plan/room-shape-display';
import { Alert, EmptyState, PageHeader } from '@/components/ui';
import {
  acceptGuestDragOver,
  clearGuestDrag,
  getActiveGuestDrag,
} from '@/lib/distribution-dnd';
import {
  filterChipClass,
  filterChipCountClass,
  tableStatusCardClass,
} from '@/lib/semantic-ui';
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
  type UnassignedGuestOption,
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

function TablePreviewCard({
  group,
  selected,
  dropActive = false,
  onSelect,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  group: DistributionTableGroup;
  selected: boolean;
  dropActive?: boolean;
  onSelect: () => void;
  onDragOver?: (event: DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (event: DragEvent) => void;
}) {
  const isRound =
    group.shapeLabel === 'Redonda' || group.shapeLabel === 'Ovalada';

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`Mesa ${group.tableLabel}, ${group.assignedCount} de ${group.capacity} asientos`}
      onClick={onSelect}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex flex-col items-center justify-center border-2 px-3 py-4 transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${tableStatusCardClass(group.status)} ${
        isRound ? 'aspect-square min-w-[88px] rounded-full' : 'min-w-[100px] rounded-xl'
      } ${selected ? 'ring-2 ring-primary-500 ring-offset-2' : ''} ${
        dropActive ? 'ring-2 ring-primary-500 ring-offset-1 brightness-105' : ''
      }`}
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
  editable = false,
  unassigningGuestId = null,
  movingGuestId = null,
  draggingGuestId = null,
  onDragStartGuest,
  onDragEndGuest,
  onUnassignGuest,
  canAssignGuest = false,
  onOpenAssignGuest,
  mutationWarning = null,
  mutationError = null,
}: {
  group: DistributionTableGroup;
  onClose: () => void;
  compact?: boolean;
  editable?: boolean;
  unassigningGuestId?: string | null;
  movingGuestId?: string | null;
  draggingGuestId?: string | null;
  onDragStartGuest?: (guestId: string) => void;
  onDragEndGuest?: () => void;
  onUnassignGuest?: (guestId: string) => void;
  canAssignGuest?: boolean;
  onOpenAssignGuest?: () => void;
  mutationWarning?: string | null;
  mutationError?: string | null;
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

      <PlacementMutationFeedback
        warning={mutationWarning}
        error={mutationError}
        compact
      />

      <div className="mt-4 max-h-40 overflow-y-auto">
        <div className="flex flex-wrap gap-2">
          {group.guests.length > 0 ? (
            group.guests.map((guest) => (
              <GuestPill
                key={`${group.tableId}-${guest.guestId || guest.guestName}`}
                name={guest.guestName}
                guestId={guest.guestId}
                removable={editable}
                removing={
                  unassigningGuestId === guest.guestId ||
                  movingGuestId === guest.guestId
                }
                draggable={editable}
                dragging={draggingGuestId === guest.guestId}
                sourceTableId={group.tableId}
                onDragStart={() => onDragStartGuest?.(guest.guestId)}
                onDragEnd={onDragEndGuest}
                onRemove={onUnassignGuest}
              />
            ))
          ) : (
            <p className="text-sm text-neutral-500">Sin invitados asignados</p>
          )}
          {canAssignGuest ? (
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1 rounded-full border border-dashed border-neutral-300 bg-neutral-0 px-3 text-sm font-medium text-neutral-600 transition hover:border-primary-500/50 hover:text-primary-600"
              aria-label={`Añadir invitado a ${group.tableLabel}`}
              onClick={onOpenAssignGuest}
            >
              + Añadir
            </button>
          ) : null}
        </div>
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
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${filterChipClass(active)}`}
      onClick={onClick}
    >
      {label}
      <span className={filterChipCountClass(active)}>
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
  editable = false,
  unassigningGuestId = null,
  assigningGuestId = null,
  movingGuestId = null,
  unassignedGuests = [],
  onUnassignGuest,
  onAssignGuest,
  onMoveGuest,
  mutationError = null,
  mutationWarning = null,
}: {
  tableGroups: DistributionTableGroup[];
  roomSetup: FloorPlanSetup;
  distributionHref: string;
  setupHref: string;
  editable?: boolean;
  unassigningGuestId?: string | null;
  assigningGuestId?: string | null;
  movingGuestId?: string | null;
  unassignedGuests?: UnassignedGuestOption[];
  onUnassignGuest?: (guestId: string) => void;
  onAssignGuest?: (tableId: string, guestId: string) => void | Promise<void>;
  onMoveGuest?: (guestId: string, targetTableId: string) => void | Promise<void>;
  mutationError?: string | null;
  mutationWarning?: string | null;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<DistributionTableFilter>('all');
  const [shapeFilter, setShapeFilter] = useState<string | 'all'>('all');
  const [selectedGroup, setSelectedGroup] =
    useState<DistributionTableGroup | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [draggingGuestId, setDraggingGuestId] = useState<string | null>(null);
  const [dropTargetTableId, setDropTargetTableId] = useState<string | null>(
    null,
  );

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
          {editable
            ? 'Pulsa una mesa para ver invitados. Arrastra un pill a otra mesa para moverlo. Guardar posiciones de mesas — post-MVP.'
            : 'Pulsa una mesa en el plano para ver sus invitados. Arrastrar y guardar posiciones — disponible post-MVP.'}
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
              <FloorPlanAccessoriesOverlay
                accessoryIds={roomSetup.placedAccessories}
              />
              <div className="absolute inset-[10%] z-[2] flex flex-wrap content-center justify-center gap-2">
                {filteredGroups.map((group) => (
                  <TablePreviewCard
                    key={group.tableId}
                    group={group}
                    selected={selectedGroup?.tableId === group.tableId}
                    dropActive={dropTargetTableId === group.tableId}
                    onSelect={() =>
                      setSelectedGroup((current) =>
                        current?.tableId === group.tableId ? null : group,
                      )
                    }
                    onDragOver={(event) => {
                      if (!editable || !onMoveGuest) {
                        return;
                      }
                      if (
                        acceptGuestDragOver(
                          event,
                          group.tableId,
                          group.freeSeats,
                        )
                      ) {
                        setDropTargetTableId(group.tableId);
                      } else {
                        setDropTargetTableId((current) =>
                          current === group.tableId ? null : current,
                        );
                      }
                    }}
                    onDragLeave={() => {
                      setDropTargetTableId((current) =>
                        current === group.tableId ? null : current,
                      );
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDropTargetTableId(null);
                      if (!editable || !onMoveGuest) {
                        clearGuestDrag();
                        return;
                      }
                      const payload = getActiveGuestDrag();
                      clearGuestDrag();
                      if (!payload) {
                        return;
                      }
                      setSelectedGroup(group);
                      void Promise.resolve(
                        onMoveGuest(payload.guestId, group.tableId),
                      ).finally(() => setDraggingGuestId(null));
                    }}
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
            <div className="absolute right-4 top-4 z-30 w-72 max-w-[calc(100%-2rem)] sm:max-w-xs">
              <TableGuestsPanel
                group={selectedGroup}
                compact
                editable={editable}
                unassigningGuestId={unassigningGuestId}
                movingGuestId={movingGuestId}
                draggingGuestId={draggingGuestId}
                onDragStartGuest={setDraggingGuestId}
                onDragEndGuest={() => setDraggingGuestId(null)}
                onUnassignGuest={onUnassignGuest}
                mutationWarning={mutationWarning}
                mutationError={mutationError}
                canAssignGuest={
                  editable &&
                  selectedGroup.freeSeats > 0 &&
                  unassignedGuests.length > 0
                }
                onOpenAssignGuest={() => setAssignOpen(true)}
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

      <AssignGuestDialog
        open={assignOpen && selectedGroup !== null}
        tableLabel={selectedGroup?.tableLabel ?? ''}
        guests={unassignedGuests}
        assigningGuestId={assigningGuestId}
        onCancel={() => setAssignOpen(false)}
        onAssign={(guestId) => {
          if (!selectedGroup || !onAssignGuest) {
            return;
          }
          void Promise.resolve(
            onAssignGuest(selectedGroup.tableId, guestId),
          ).finally(() => setAssignOpen(false));
        }}
      />
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
