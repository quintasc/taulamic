'use client';

import { useMemo, useState, useEffect, type DragEvent } from 'react';
import { IconChevronDown } from '@/components/icons';
import { GuestPill } from '@/components/admin/distribution/guest-pill';
import { GuestPointerDragLayer } from '@/components/admin/distribution/guest-pointer-drag-layer';
import { AssignGuestDialog } from '@/components/admin/distribution/assign-guest-dialog';
import { PlacementMutationFeedback } from '@/components/admin/distribution/placement-mutation-feedback';
import { MOBILE_CHEVRON_ICON_BUTTON_CLASS } from '@/components/ui/mobile-horizontal-scroll';
import {
  acceptGuestDragOver,
  clearGuestDrag,
  getActiveGuestDrag,
} from '@/lib/distribution-dnd';
import {
  getGuestPointerDragHoverTableId,
  subscribeGuestPointerDrag,
} from '@/lib/guest-pointer-drag';
import {
  countTablesByStatus,
  filterDistributionTableGroups,
  formatPilotTableAffinity,
  getStatusChipLabel,
  PILOT_AFFINITY_LABEL,
  type DistributionTableFilter,
  type DistributionTableGroup,
  type TableOccupancyStatus,
  type UnassignedGuestOption,
} from '@/lib/distribution-view';
import {
  filterChipClass,
  filterChipCountClass,
  tableStatusBadgeClass,
  tableStatusBarClass,
  tableStatusDotClass,
} from '@/lib/semantic-ui';

/** Con sidebar fija (~220px), el grid multi-columna necesita más ancho que el breakpoint sm. */
const TABLE_ROW_GRID_CLASS =
  'lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.75fr)_minmax(0,0.9fr)_minmax(0,0.65fr)_auto]';

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
    <div className="flex min-w-0 max-w-full items-center gap-2">
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-wf-2 sm:max-w-20">
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
      <span className="shrink-0 text-xs font-medium tabular-nums text-neutral-700">
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
      className="block min-w-0 truncate text-xs font-medium text-neutral-500"
      title={`${label} — ${PILOT_AFFINITY_LABEL}`}
    >
      {label}
    </span>
  );
}

function DistributionExpandAllButton({
  allExpanded,
  disabled,
  onExpandAll,
  onCollapseAll,
}: {
  allExpanded: boolean;
  disabled: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}) {
  return (
    <button
      type="button"
      className={MOBILE_CHEVRON_ICON_BUTTON_CLASS}
      aria-label={
        allExpanded ? 'Contraer todas las mesas' : 'Expandir todas las mesas'
      }
      title={allExpanded ? 'Contraer todas' : 'Expandir todas'}
      disabled={disabled}
      onClick={allExpanded ? onCollapseAll : onExpandAll}
    >
      <IconChevronDown
        width={18}
        height={18}
        className={`transition ${allExpanded ? 'rotate-180' : ''}`}
      />
    </button>
  );
}

function DistributionTableRow({
  group,
  open,
  onToggle,
  editable,
  unassigningGuestId,
  movingGuestId,
  draggingGuestId,
  onDragStartGuest,
  onDragEndGuest,
  onUnassignGuest,
  canAssignGuest,
  onOpenAssignGuest,
  onMoveGuest,
  mutationWarning = null,
  mutationError = null,
}: {
  group: DistributionTableGroup;
  open: boolean;
  onToggle: () => void;
  editable: boolean;
  unassigningGuestId: string | null;
  movingGuestId: string | null;
  draggingGuestId: string | null;
  onDragStartGuest: (guestId: string) => void;
  onDragEndGuest: () => void;
  onUnassignGuest?: (guestId: string) => void;
  canAssignGuest: boolean;
  onOpenAssignGuest?: () => void;
  onMoveGuest?: (guestId: string, targetTableId: string) => void;
  mutationWarning?: string | null;
  mutationError?: string | null;
}) {
  const [dropActive, setDropActive] = useState(false);
  const [pointerDropActive, setPointerDropActive] = useState(false);

  useEffect(() => {
    return subscribeGuestPointerDrag(() => {
      setPointerDropActive(
        getGuestPointerDragHoverTableId() === group.tableId,
      );
    });
  }, [group.tableId]);

  const isDropActive = dropActive || pointerDropActive;

  function handleDragOver(event: DragEvent) {
    if (!editable || !onMoveGuest) {
      return;
    }

    if (acceptGuestDragOver(event, group.tableId, group.freeSeats)) {
      setDropActive(true);
    } else {
      setDropActive(false);
    }
  }

  function handleDragLeave() {
    setDropActive(false);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDropActive(false);

    if (!editable || !onMoveGuest) {
      clearGuestDrag();
      return;
    }

    const payload = getActiveGuestDrag();
    clearGuestDrag();
    if (!payload) {
      return;
    }

    onMoveGuest(payload.guestId, group.tableId);
  }

  return (
    <div
      className={`border-b border-neutral-200 last:border-b-0 ${
        isDropActive ? 'bg-primary-500/5 ring-2 ring-inset ring-primary-500/40' : ''
      }`}
      data-guest-drop-table={group.tableId}
      data-guest-drop-free-seats={group.freeSeats}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <button
        type="button"
        className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-3 px-5 py-4 text-left transition hover:bg-neutral-50 lg:items-center ${TABLE_ROW_GRID_CLASS}`}
        aria-expanded={open}
        onClick={onToggle}
      >
        <TableMesaCell group={group} />

        <span className="hidden min-w-0 text-sm text-neutral-600 lg:block">
          {group.shapeLabel}
        </span>

        <span className="hidden min-w-0 lg:block">
          <CapacityBar group={group} />
        </span>

        <span className="hidden min-w-0 text-right text-sm lg:block">
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

      <div className="px-5 pb-3 lg:hidden">
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
          <span>{group.shapeLabel}</span>
          <CapacityBar group={group} />
          <AffinityCell group={group} />
        </div>
      </div>

      {open ? (
        <div className="border-t border-neutral-200 bg-wf-1 px-5 py-4">
          <PlacementMutationFeedback
            warning={mutationWarning}
            error={mutationError}
            compact
          />
          <div
            className={`flex flex-wrap items-center gap-2 ${
              mutationWarning || mutationError ? 'mt-3' : ''
            }`}
          >
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
                  onDragStart={() => onDragStartGuest(guest.guestId)}
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
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenAssignGuest?.();
                }}
              >
                + Añadir
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DistributionTableList({
  tableGroups,
  editable = false,
  unassigningGuestId = null,
  assigningGuestId = null,
  movingGuestId = null,
  unassignedGuests = [],
  onUnassignGuest,
  onAssignGuest,
  onMoveGuest,
  mutationWarning = null,
  mutationError = null,
}: {
  tableGroups: DistributionTableGroup[];
  editable?: boolean;
  unassigningGuestId?: string | null;
  assigningGuestId?: string | null;
  movingGuestId?: string | null;
  unassignedGuests?: UnassignedGuestOption[];
  onUnassignGuest?: (guestId: string) => void;
  onAssignGuest?: (tableId: string, guestId: string) => void | Promise<void>;
  onMoveGuest?: (guestId: string, targetTableId: string) => void | Promise<void>;
  mutationWarning?: string | null;
  mutationError?: string | null;
}) {
  const [filter, setFilter] = useState<DistributionTableFilter>('all');
  const [search, setSearch] = useState('');
  const [openTableIds, setOpenTableIds] = useState<Set<string>>(() => new Set());
  const [assignTableId, setAssignTableId] = useState<string | null>(null);
  const [draggingGuestId, setDraggingGuestId] = useState<string | null>(null);
  const [mutationFocusTableId, setMutationFocusTableId] = useState<
    string | null
  >(null);

  function focusMutationTable(tableId: string) {
    setMutationFocusTableId(tableId);
    setOpenTableIds((current) => {
      const next = new Set(current);
      next.add(tableId);
      return next;
    });
  }

  function toggleTableOpen(tableId: string) {
    setOpenTableIds((current) => {
      const next = new Set(current);
      if (next.has(tableId)) {
        next.delete(tableId);
      } else {
        next.add(tableId);
      }
      return next;
    });
  }

  function findGuestTableId(guestId: string): string | null {
    const group = tableGroups.find((item) =>
      item.guests.some((guest) => guest.guestId === guestId),
    );
    return group?.tableId ?? null;
  }

  const assignGroup = useMemo(
    () =>
      assignTableId
        ? tableGroups.find((group) => group.tableId === assignTableId) ?? null
        : null,
    [assignTableId, tableGroups],
  );

  const statusCounts = useMemo(
    () => countTablesByStatus(tableGroups),
    [tableGroups],
  );

  const visibleGroups = useMemo(
    () => filterDistributionTableGroups(tableGroups, filter, search),
    [tableGroups, filter, search],
  );

  function expandAllVisible() {
    setOpenTableIds(new Set(visibleGroups.map((group) => group.tableId)));
  }

  function collapseAllVisible() {
    setOpenTableIds(new Set());
  }

  const allVisibleExpanded =
    visibleGroups.length > 0 &&
    visibleGroups.every((group) => openTableIds.has(group.tableId));

  return (
    <GuestPointerDragLayer
      onDrop={(guestId, targetTableId) => {
        if (!editable || !onMoveGuest) {
          return;
        }
        focusMutationTable(targetTableId);
        void Promise.resolve(onMoveGuest(guestId, targetTableId)).finally(
          () => setDraggingGuestId(null),
        );
      }}
      onDragStart={() => {
        const payload = getActiveGuestDrag();
        if (payload) {
          setDraggingGuestId(payload.guestId);
        }
      }}
      onDragEnd={() => setDraggingGuestId(null)}
    >
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
          <div className="flex items-center gap-2">
            {visibleGroups.length > 0 ? (
              <span className="lg:hidden">
                <DistributionExpandAllButton
                  allExpanded={allVisibleExpanded}
                  disabled={visibleGroups.length === 0}
                  onExpandAll={expandAllVisible}
                  onCollapseAll={collapseAllVisible}
                />
              </span>
            ) : null}
            <p className="shrink-0 text-xs font-medium text-neutral-500">
              {tableGroups.length}{' '}
              {tableGroups.length === 1 ? 'mesa' : 'mesas'}
            </p>
          </div>
        </div>
      </div>

      <div className="card-admin overflow-hidden p-0">
        <div
          className={`hidden border-b border-neutral-200 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-wf-5 lg:grid lg:gap-3 ${TABLE_ROW_GRID_CLASS}`}
        >
          <span>Mesa</span>
          <span>Forma</span>
          <span>Capacidad</span>
          <span className="text-right">Afinidad</span>
          <span className="flex w-10 justify-end">
            {visibleGroups.length > 0 ? (
              <DistributionExpandAllButton
                allExpanded={allVisibleExpanded}
                disabled={visibleGroups.length === 0}
                onExpandAll={expandAllVisible}
                onCollapseAll={collapseAllVisible}
              />
            ) : null}
          </span>
        </div>

        {visibleGroups.length > 0 ? (
          visibleGroups.map((group) => (
            <DistributionTableRow
              key={group.tableId}
              group={group}
              open={openTableIds.has(group.tableId)}
              editable={editable}
              unassigningGuestId={unassigningGuestId}
              movingGuestId={movingGuestId}
              draggingGuestId={draggingGuestId}
              onDragStartGuest={setDraggingGuestId}
              onDragEndGuest={() => setDraggingGuestId(null)}
              onUnassignGuest={(guestId) => {
                const sourceTableId = findGuestTableId(guestId);
                if (sourceTableId) {
                  focusMutationTable(sourceTableId);
                }
                onUnassignGuest?.(guestId);
              }}
              mutationWarning={
                mutationFocusTableId === group.tableId ? mutationWarning : null
              }
              mutationError={
                mutationFocusTableId === group.tableId ? mutationError : null
              }
              canAssignGuest={
                editable &&
                group.freeSeats > 0 &&
                unassignedGuests.length > 0
              }
              onOpenAssignGuest={() => setAssignTableId(group.tableId)}
              onMoveGuest={(guestId, targetTableId) => {
                focusMutationTable(targetTableId);
                void Promise.resolve(
                  onMoveGuest?.(guestId, targetTableId),
                ).finally(() => setDraggingGuestId(null));
              }}
              onToggle={() => toggleTableOpen(group.tableId)}
            />
          ))
        ) : (
          <p className="px-5 py-8 text-center text-sm text-neutral-500">
            Ninguna mesa coincide con el filtro.
          </p>
        )}
      </div>

      <AssignGuestDialog
        open={assignGroup !== null}
        tableLabel={assignGroup?.tableLabel ?? ''}
        guests={unassignedGuests}
        assigningGuestId={assigningGuestId}
        onCancel={() => setAssignTableId(null)}
        onAssign={(guestId) => {
          if (!assignGroup || !onAssignGuest) {
            return;
          }
          focusMutationTable(assignGroup.tableId);
          void Promise.resolve(
            onAssignGuest(assignGroup.tableId, guestId),
          ).finally(() => setAssignTableId(null));
        }}
      />
    </div>
    </GuestPointerDragLayer>
  );
}
