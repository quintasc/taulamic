'use client';

import { useMemo, useState, useEffect, type DragEvent } from 'react';
import { IconChevronDown, IconStar } from '@/components/icons';
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

function TableVisualRepresentation({
  group,
  occupiedChairs,
  presidentialChairs,
}: {
  group: DistributionTableGroup;
  occupiedChairs: Record<string, any>;
  presidentialChairs: Set<string>;
}) {
  const capacity = group.capacity;
  const isRect = group.shapeLabel.toLowerCase().includes('rect');
  const isOval = group.shapeLabel.toLowerCase().includes('oval');

  return (
    <div className="relative h-60 w-60 flex items-center justify-center bg-neutral-50/50 rounded-full border border-neutral-200/50 shadow-inner">
      {/* Table Center Body */}
      <div className={`absolute flex items-center justify-center bg-neutral-0 border border-neutral-300 shadow-sm font-semibold text-neutral-700 text-sm z-10 ${
        isRect ? 'w-24 h-16 rounded-xl' : isOval ? 'w-24 h-16 rounded-full' : 'w-20 h-20 rounded-full'
      }`}>
        {group.tableLabel}
      </div>

      {/* Seats and Names */}
      {Array.from({ length: capacity }).map((_, idx) => {
        const chairId = `S${idx + 1}`;
        const occupant = occupiedChairs[chairId];
        const isPresidential = presidentialChairs.has(`${group.tableId}:${chairId}`);

        // Calculate angle
        const angle = (idx * 2 * Math.PI) / capacity - Math.PI / 2;
        
        // Distances from center
        const rSeat = 34; // percent
        const rName = 49; // percent

        const seatX = 50 + rSeat * Math.cos(angle);
        const seatY = 50 + rSeat * Math.sin(angle);

        const nameX = 50 + rName * Math.cos(angle);
        const nameY = 50 + rName * Math.sin(angle);

        // Align text based on angle
        const isRightSide = Math.cos(angle) > 0.1;
        const isLeftSide = Math.cos(angle) < -0.1;
        const textAlignClass = isRightSide ? 'text-left' : isLeftSide ? 'text-right' : 'text-center';

        return (
          <div key={chairId} className="absolute inset-0 pointer-events-none">
            {/* Seat node */}
            <div
              className={`absolute flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold border shadow-sm transition-all ${
                isPresidential
                  ? 'bg-amber-400 border-amber-500 text-amber-900'
                  : occupant
                  ? 'bg-primary-500 border-primary-500 text-neutral-0'
                  : 'bg-neutral-100 border-neutral-200/50 text-neutral-500'
              }`}
              style={{
                left: `${seatX}%`,
                top: `${seatY}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {chairId}
            </div>

            {/* Guest name label */}
            {occupant ? (
              <div
                className={`absolute text-[9px] font-medium px-1 py-0.5 rounded border shadow-xs max-w-[65px] truncate ${textAlignClass} ${
                  isPresidential
                    ? 'text-amber-800 bg-amber-50/90 border-amber-300/60'
                    : 'text-neutral-600 bg-neutral-0/90 border-neutral-200/60'
                }`}
                style={{
                  left: `${nameX}%`,
                  top: `${nameY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={occupant.guestName}
              >
                {occupant.guestName}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
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
  eventId,
  chairMappings,
  setChairMappings,
  presidentialChairs,
  setPresidentialChairs,
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
  onOpenAssignGuest?: (chairId?: string) => void;
  onMoveGuest?: (guestId: string, targetTableId: string) => void;
  mutationWarning?: string | null;
  mutationError?: string | null;
  eventId: string;
  chairMappings: Record<string, string>;
  setChairMappings: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  presidentialChairs: Set<string>;
  setPresidentialChairs: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const [dropActive, setDropActive] = useState(false);
  const [pointerDropActive, setPointerDropActive] = useState(false);

  const occupiedChairs = useMemo(() => {
    const guestsAtTable = group.guests.filter((g) => g.guestId);
    const capacity = group.capacity;
    const nextMappings = { ...chairMappings };
    let changed = false;
    
    const occupied: Record<string, typeof group.guests[0]> = {};
    const unassigned: typeof group.guests = [];
    
    guestsAtTable.forEach((g) => {
      const chair = nextMappings[g.guestId];
      if (chair && chair.startsWith('S')) {
        const num = Number.parseInt(chair.slice(1), 10);
        if (num >= 1 && num <= capacity && !occupied[chair]) {
          occupied[chair] = g;
          return;
        }
      }
      unassigned.push(g);
    });
    
    unassigned.forEach((g) => {
      for (let s = 1; s <= capacity; s++) {
        const chair = `S${s}`;
        if (!occupied[chair]) {
          occupied[chair] = g;
          nextMappings[g.guestId] = chair;
          changed = true;
          break;
        }
      }
    });
    
    if (changed) {
      localStorage.setItem(`taulamic:guestChairs:${eventId}`, JSON.stringify(nextMappings));
      setTimeout(() => setChairMappings(nextMappings), 0);
    }
    
    return occupied;
  }, [group.guests, group.capacity, chairMappings, eventId, setChairMappings]);

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
          <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column: Sillas List */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-500">
                Distribución de Sillas
              </h3>
              <div className="flex flex-col gap-2 max-w-md">
                {Array.from({ length: group.capacity }).map((_, idx) => {
                  const chairId = `S${idx + 1}`;
                  const occupant = occupiedChairs[chairId];
                  const presidentialKey = `${group.tableId}:${chairId}`;
                  const isPresidential = presidentialChairs.has(presidentialKey);

                  const togglePresidential = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setPresidentialChairs((prev) => {
                      const next = new Set(prev);
                      if (next.has(presidentialKey)) {
                        next.delete(presidentialKey);
                      } else {
                        next.add(presidentialKey);
                      }
                      localStorage.setItem(`taulamic:presidentialChairs:${eventId}`, JSON.stringify([...next]));
                      return next;
                    });
                  };

                  return (
                    <div
                      key={chairId}
                      data-guest-drop-chair={chairId}
                      data-guest-drop-table-id={group.tableId}
                      onDragOver={(e) => {
                        if (editable) {
                          e.preventDefault();
                        }
                      }}
                      onDrop={(e) => {
                        if (!editable) return;
                        e.preventDefault();
                        const payload = getActiveGuestDrag();
                        if (!payload) return;
                        setChairMappings((prev) => {
                          const next = { ...prev, [payload.guestId]: chairId };
                          localStorage.setItem(`taulamic:guestChairs:${eventId}`, JSON.stringify(next));
                          return next;
                        });
                        onMoveGuest?.(payload.guestId, group.tableId);
                      }}
                      className={`relative flex items-center gap-3 rounded-xl border p-2 transition ${
                        isPresidential
                          ? 'border-amber-400/60 bg-amber-50/50'
                          : occupant 
                          ? 'border-primary-500/30 bg-primary-500/5' 
                          : 'border-dashed border-neutral-200 bg-neutral-0 hover:border-primary-500/30 hover:bg-primary-500/5'
                      }`}
                    >
                      <span className={`flex h-6 w-7 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold select-none transition ${
                        isPresidential
                          ? 'bg-amber-400 border-amber-500 text-amber-900'
                          : occupant
                          ? 'bg-primary-500 border-primary-500 text-neutral-0'
                          : 'bg-neutral-100 border-neutral-200/50 text-neutral-600'
                      }`}>
                        {chairId}
                      </span>
                      <div className="flex-1 min-w-0">
                        {occupant ? (
                          <GuestPill
                            name={occupant.guestName}
                            guestId={occupant.guestId}
                            removable={editable}
                            removing={
                              unassigningGuestId === occupant.guestId ||
                              movingGuestId === occupant.guestId
                            }
                            draggable={editable}
                            dragging={draggingGuestId === occupant.guestId}
                            sourceTableId={group.tableId}
                            onDragStart={() => onDragStartGuest(occupant.guestId)}
                            onDragEnd={onDragEndGuest}
                            onRemove={onUnassignGuest}
                          />
                        ) : (
                          <div className="flex items-center">
                            {canAssignGuest ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onOpenAssignGuest?.(chairId);
                                }}
                                className="flex items-center gap-1 text-[12px] font-semibold text-primary-600 hover:text-primary-700 transition text-left"
                              >
                                <span>+</span>
                                <span className="hidden sm:inline">Añadir</span>
                              </button>
                            ) : (
                              <div className="text-[12px] font-semibold text-neutral-400 italic text-left">
                                Vacía
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Presidential star button */}
                      <button
                        type="button"
                        title={isPresidential ? 'Quitar orientación a mesa principal' : 'Orientar a mesa principal'}
                        onClick={togglePresidential}
                        className={`shrink-0 transition-colors ${
                          isPresidential
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-neutral-300 hover:text-amber-400'
                        }`}
                      >
                        <IconStar
                          width={14}
                          height={14}
                          filled={isPresidential}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Visual Representation (Desktop only) */}
            <div className="hidden lg:flex flex-col items-center justify-center border-l border-neutral-200/60 pl-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-500 mb-6 self-start">
                Vista de Mesa
              </h3>
              <TableVisualRepresentation
                group={group}
                occupiedChairs={occupiedChairs}
                presidentialChairs={presidentialChairs}
              />
            </div>
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
  eventId,
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
  eventId: string;
}) {
  const [filter, setFilter] = useState<DistributionTableFilter>('all');
  const [search, setSearch] = useState('');
  const [openTableIds, setOpenTableIds] = useState<Set<string>>(() => new Set());
  const [assignTableId, setAssignTableId] = useState<string | null>(null);
  const [draggingGuestId, setDraggingGuestId] = useState<string | null>(null);
  const [chairMappings, setChairMappings] = useState<Record<string, string>>({});
  const [targetChair, setTargetChair] = useState<string | null>(null);
  const [presidentialChairs, setPresidentialChairs] = useState<Set<string>>(() => new Set());
  const [mutationFocusTableId, setMutationFocusTableId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const raw = localStorage.getItem(`taulamic:guestChairs:${eventId}`);
    if (raw) {
      try {
        setChairMappings(JSON.parse(raw));
      } catch (e) {
        console.error(e);
      }
    }
  }, [eventId]);

  useEffect(() => {
    const raw = localStorage.getItem(`taulamic:presidentialChairs:${eventId}`);
    if (raw) {
      try {
        setPresidentialChairs(new Set(JSON.parse(raw) as string[]));
      } catch (e) {
        console.error(e);
      }
    }
  }, [eventId]);

  const handleRemoveGuest = (guestId: string) => {
    const sourceTableId = findGuestTableId(guestId);
    if (sourceTableId) {
      focusMutationTable(sourceTableId);
    }
    setChairMappings((prev) => {
      const next = { ...prev };
      delete next[guestId];
      localStorage.setItem(`taulamic:guestChairs:${eventId}`, JSON.stringify(next));
      return next;
    });
    onUnassignGuest?.(guestId);
  };

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
              onUnassignGuest={handleRemoveGuest}
              mutationWarning={
                mutationFocusTableId === group.tableId ? mutationWarning : null
              }
              mutationError={
                mutationFocusTableId === group.tableId ? mutationError : null
              }
              canAssignGuest={
                editable &&
                group.freeSeats > 0
              }
              onOpenAssignGuest={(chairId?: string) => {
                setTargetChair(chairId ?? null);
                setAssignTableId(group.tableId);
              }}
              onMoveGuest={(guestId, targetTableId) => {
                focusMutationTable(targetTableId);
                void Promise.resolve(
                  onMoveGuest?.(guestId, targetTableId),
                ).finally(() => setDraggingGuestId(null));
              }}
              onToggle={() => toggleTableOpen(group.tableId)}
              eventId={eventId}
              chairMappings={chairMappings}
              setChairMappings={setChairMappings}
              presidentialChairs={presidentialChairs}
              setPresidentialChairs={setPresidentialChairs}
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
          if (targetChair) {
            setChairMappings((prev) => {
              const next = { ...prev, [guestId]: targetChair };
              localStorage.setItem(`taulamic:guestChairs:${eventId}`, JSON.stringify(next));
              return next;
            });
          }
          focusMutationTable(assignGroup.tableId);
          void Promise.resolve(
            onAssignGuest(assignGroup.tableId, guestId),
          ).finally(() => {
            setAssignTableId(null);
            setTargetChair(null);
          });
        }}
      />
    </div>
    </GuestPointerDragLayer>
  );
}
