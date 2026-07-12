'use client';

import { useCallback, useMemo, useState, useEffect, type DragEvent } from 'react';
import { IconChevronDown, IconStar } from '@/components/icons';
import { GuestPill } from '@/components/admin/distribution/guest-pill';
import { GuestPointerDragLayer } from '@/components/admin/distribution/guest-pointer-drag-layer';
import { AssignGuestDialog } from '@/components/admin/distribution/assign-guest-dialog';
import {
  DistributionTablePaxEditor,
  DistributionTableShapeEditor,
} from '@/components/admin/distribution/distribution-table-meta-editor';
import {
  MoveGuestDialog,
  type MoveGuestTableOption,
} from '@/components/admin/distribution/move-guest-dialog';
import {
  buildGuestsById,
  enrichOccupiedChairs,
  SeatCircle,
  TableSeatDiagram,
} from '@/components/admin/distribution/distribution-table-seat-visual';
import { PlacementMutationFeedback } from '@/components/admin/distribution/placement-mutation-feedback';
import { MOBILE_CHEVRON_ICON_BUTTON_CLASS } from '@/components/ui/mobile-horizontal-scroll';
import {
  acceptGuestDragOver,
  clearGuestDrag,
  getActiveGuestDrag,
} from '@/lib/distribution-dnd';
import { useGuestPointerDropHighlightForTable } from '@/components/admin/distribution/use-guest-pointer-drop-highlight';
import {
  countTablesByStatus,
  DISTRIBUTION_TABLE_FILTER_OPTIONS,
  filterDistributionTableGroups,
  formatTableAffinity,
  getStatusChipLabel,
  summarizeDistributionSearch,
  type DistributionTableFilter,
  type DistributionTableGroup,
  type TableOccupancyStatus,
  type UnassignedGuestOption,
} from '@/lib/distribution-view';
import { DISTRIBUTION_COPY } from '@/lib/ui-copy';
import type { DistributionProposal, GuestView } from '@/lib/api';
import { chairIdToSeatIndex, chairMappingsFromProposal, buildOccupiedChairsForTable } from '@/lib/guest-chair-mappings';
import type { AffinityRelationInput, CompanionGroupInput } from '@/lib/table-affinity-score';
import {
  loadTableProximityPreferences,
  resolveTableProximityPreference,
  saveTableProximityPreference,
  TABLE_PROXIMITY_OPTIONS,
  type TableProximityPreference,
} from '@/lib/table-proximity-preference';
import type { TableEditDraft } from '@/lib/table-form';
import {
  filterChipClass,
  filterChipCountClass,
  tableStatusBadgeClass,
  tableStatusBarClass,
  tableStatusDotClass,
} from '@/lib/semantic-ui';

/** Ancho común desplegables: cabe «Rectangular» / «Indiferente» sin recorte. */
const DISTRIBUTION_DROPDOWN_WIDTH_CLASS = 'w-[9.25rem]';

/**
 * Mesa | PAX | Proximidad | Forma | Uso | Afinidad | expandir
 * Proporciones heredadas del layout pre-PAX (1.35 / 1 / 0.65 / 0.85 / 0.58),
 * con PAX fijo y columnas de desplegable simétricas.
 */
const TABLE_ROW_GRID_CLASS =
  'lg:grid-cols-[minmax(0,1.25fr)_3.25rem_9.25rem_9.25rem_6.5rem_minmax(0,0.58fr)_2.25rem]';

/** Más aire entre PAX, Proximidad, Forma y Uso en desktop. */
const TABLE_ROW_GAP_CLASS = 'gap-3 lg:gap-x-5';
const CAPACITY_BAR_TRACK_WIDTH_CLASS = 'w-[3.65rem]';

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
      <span className="inline-flex min-w-0 items-center gap-2.5">
        <StatusDot status={group.status} />
        <span
          className="min-w-0 truncate text-sm font-semibold text-neutral-900"
          title={group.tableLabel}
        >
          {group.tableLabel}
        </span>
      </span>
      <StatusChip group={group} />
    </div>
  );
}

function CapacityBar({ group }: { group: DistributionTableGroup }) {
  const isOverCapacity = group.assignedCount > group.capacity;
  const fillPercent =
    group.capacity > 0
      ? Math.min(100, (group.assignedCount / group.capacity) * 100)
      : 0;
  const barClass = tableStatusBarClass(group.status);
  const usageClass = isOverCapacity ? 'text-error-500' : 'text-neutral-700';
  const usageBadgeClass = isOverCapacity
    ? 'rounded border border-error-500/30 bg-error-500/10 px-1 py-px'
    : '';
  const usageTitle = isOverCapacity
    ? 'Sobrecapacidad elástica activa en esta mesa'
    : undefined;

  return (
    <div className="inline-flex w-fit items-center gap-1.5">
      <div className={`h-2 ${CAPACITY_BAR_TRACK_WIDTH_CLASS} overflow-hidden rounded-full bg-wf-2`}>
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
      <span
        className={`inline-flex w-fit shrink-0 text-[11px] font-semibold tabular-nums ${usageClass} ${usageBadgeClass}`}
        title={usageTitle}
      >
        {group.assignedCount}/{group.capacity}
      </span>
    </div>
  );
}

function TableProximitySelect({
  value,
  editable,
  onChange,
}: {
  value: TableProximityPreference;
  editable: boolean;
  onChange: (value: TableProximityPreference) => void;
}) {
  return (
    <select
      className={`input-field ${DISTRIBUTION_DROPDOWN_WIDTH_CLASS} min-w-0 py-1 pl-2 pr-6 text-xs`}
      value={value}
      disabled={!editable}
      aria-label="Preferencia de proximidad en la mesa"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onChange={(event) =>
        onChange(event.target.value as TableProximityPreference)
      }
    >
      {TABLE_PROXIMITY_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function AffinityCell({ group }: { group: DistributionTableGroup }) {
  const label = formatTableAffinity(group);
  if (label === '—') {
    const title =
      group.assignedCount > 0
        ? 'Sin criterios de compatibilidad aplicables en esta mesa'
        : 'Mesa vacía';
    return (
      <span className="text-neutral-400" title={title}>
        —
      </span>
    );
  }
  return (
    <span
      className="block min-w-0 truncate text-xs font-semibold tabular-nums text-neutral-700"
      title={`${DISTRIBUTION_COPY.tableAffinityColumnTitle}. ${group.tableAffinity?.detail ?? ''}`}
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

function buildMoveTableOptions(
  tableGroups: DistributionTableGroup[],
  chairMappings: Record<string, string>,
  sourceTableId: string,
): MoveGuestTableOption[] {
  return tableGroups
    .filter(
      (group) => group.tableId === sourceTableId || group.freeSeats > 0,
    )
    .map((group) => {
      const effectiveSeatCapacity = Math.max(group.capacity, group.assignedCount);
      return {
        tableId: group.tableId,
        tableLabel: group.tableLabel,
        capacity: effectiveSeatCapacity,
        freeSeats: group.freeSeats,
        occupiedSeats: buildOccupiedChairsForTable(
          effectiveSeatCapacity,
          group.guests.filter((guest) => guest.guestId),
          chairMappings,
        ),
      };
    });
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
  onOpenMoveGuest,
  onMoveGuest,
  onUpdateGuestSeat,
  mutationWarning = null,
  mutationError = null,
  eventId,
  chairMappings,
  setChairMappings,
  presidentialChairs,
  setPresidentialChairs,
  guestsById,
  affinityRelations,
  companionGroups,
  tableProximity,
  onTableProximityChange,
  allTables,
  savingTableId,
  onUpdateTable,
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
  onOpenMoveGuest?: (guestId: string, chairId: string) => void;
  onMoveGuest?: (
    guestId: string,
    targetTableId: string,
    seatIndex?: number,
  ) => void | Promise<void>;
  onUpdateGuestSeat?: (guestId: string, seatIndex: number) => void | Promise<void>;
  mutationWarning?: string | null;
  mutationError?: string | null;
  eventId: string;
  chairMappings: Record<string, string>;
  setChairMappings: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  presidentialChairs: Set<string>;
  setPresidentialChairs: React.Dispatch<React.SetStateAction<Set<string>>>;
  guestsById: Map<string, { nombre: string; categoryName?: string }>;
  affinityRelations: AffinityRelationInput[];
  companionGroups: CompanionGroupInput[];
  tableProximity: TableProximityPreference;
  onTableProximityChange: (value: TableProximityPreference) => void;
  allTables: Array<{ id: string; label: string }>;
  savingTableId: string | null;
  onUpdateTable?: (tableId: string, draft: TableEditDraft) => Promise<boolean>;
}) {
  const [dropActive, setDropActive] = useState(false);
  const [pointerDropActive, setPointerDropActive] = useState(false);
  const renderSeatCapacity = Math.max(group.capacity, group.assignedCount);

  const occupiedChairs = useMemo(
    () =>
      buildOccupiedChairsForTable(
        renderSeatCapacity,
        group.guests.filter((guest) => guest.guestId),
        chairMappings,
      ),
    [renderSeatCapacity, group.guests, chairMappings],
  );

  const occupiedSeats = useMemo(
    () => enrichOccupiedChairs(occupiedChairs, guestsById),
    [occupiedChairs, guestsById],
  );

  useGuestPointerDropHighlightForTable(group.tableId, setPointerDropActive);

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

  function handleRowToggle(event: React.MouseEvent | React.KeyboardEvent) {
    if (
      (event.target as HTMLElement).closest(
        '[data-table-proximity-control], [data-table-meta-control]',
      )
    ) {
      return;
    }
    onToggle();
  }

  const tableMetaProps = {
    tableId: group.tableId,
    tableLabel: group.tableLabel,
    tableShape: group.tableShape,
    capacity: group.capacity,
    assignedCount: group.assignedCount,
    allTables,
    editable,
    saving: savingTableId === group.tableId,
    onSave: onUpdateTable ?? (async () => false),
  };

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
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        className={`grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-start px-5 py-4 text-left transition hover:bg-neutral-50 lg:items-center ${TABLE_ROW_GAP_CLASS} ${TABLE_ROW_GRID_CLASS}`}
        onClick={handleRowToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleRowToggle(event);
          }
        }}
      >
        <TableMesaCell group={group} />

        <span className="hidden justify-center lg:flex" data-table-meta-control>
          <DistributionTablePaxEditor {...tableMetaProps} />
        </span>

        <div
          className={`hidden lg:block ${DISTRIBUTION_DROPDOWN_WIDTH_CLASS}`}
          data-table-proximity-control
        >
          <TableProximitySelect
            value={tableProximity}
            editable={editable}
            onChange={onTableProximityChange}
          />
        </div>

        <span
          className={`hidden lg:block ${DISTRIBUTION_DROPDOWN_WIDTH_CLASS}`}
        >
          <DistributionTableShapeEditor
            {...tableMetaProps}
            dropdownWidthClass={DISTRIBUTION_DROPDOWN_WIDTH_CLASS}
          />
        </span>

        <span className="hidden min-w-0 max-w-[6.5rem] lg:block">
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
      </div>

      <div className="px-5 pb-3 lg:hidden">
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5" data-table-meta-control>
            <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">
              PAX
            </span>
            <DistributionTablePaxEditor {...tableMetaProps} />
          </div>
          <div className={DISTRIBUTION_DROPDOWN_WIDTH_CLASS} data-table-proximity-control>
            <TableProximitySelect
              value={tableProximity}
              editable={editable}
              onChange={onTableProximityChange}
            />
          </div>
          <div className={DISTRIBUTION_DROPDOWN_WIDTH_CLASS} data-table-meta-control>
            <DistributionTableShapeEditor
              {...tableMetaProps}
              dropdownWidthClass={DISTRIBUTION_DROPDOWN_WIDTH_CLASS}
            />
          </div>
          <div className="min-w-[6.5rem] flex-1">
            <CapacityBar group={group} />
          </div>
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
          <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-6">
            {/* Left Column: Sillas List */}
            <div className="min-w-0 space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-500">
                Distribución de Sillas
              </h3>
              <div className="flex w-full min-w-0 flex-col gap-1.5">
                {Array.from({ length: renderSeatCapacity }).map((_, idx) => {
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
                        clearGuestDrag();
                        if (!payload) return;
                        const seatIndex = chairIdToSeatIndex(chairId);
                        if (seatIndex === null) return;

                        if (payload.sourceTableId === group.tableId) {
                          onUpdateGuestSeat?.(payload.guestId, seatIndex);
                          return;
                        }

                        onMoveGuest?.(payload.guestId, group.tableId, seatIndex);
                      }}
                      className={`relative flex items-center gap-2 rounded-lg border px-2 py-1.5 transition ${
                        isPresidential
                          ? 'border-amber-400/60 bg-amber-50/50'
                          : occupant
                            ? 'border-primary-500/25 bg-primary-500/5'
                            : 'border-dashed border-neutral-200 bg-neutral-0 hover:border-primary-500/30 hover:bg-primary-500/5'
                      }`}
                    >
                      <SeatCircle
                        chairId={chairId}
                        occupant={occupiedSeats[chairId]}
                        presidential={isPresidential}
                        className="h-5 w-6 shrink-0 text-[9px]"
                      />
                      <div className="min-w-0 flex-1">
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
                            onMove={
                              editable
                                ? () =>
                                    onOpenMoveGuest?.(
                                      occupant.guestId,
                                      chairId,
                                    )
                                : undefined
                            }
                            variant="row"
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
            <div className="hidden min-w-0 flex-col items-center justify-start border-neutral-200/60 lg:flex lg:border-l lg:pl-4">
              <h3 className="mb-3 self-start text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-500">
                Vista de Mesa
              </h3>
              <div className="flex w-full max-w-[360px] justify-center">
              <TableSeatDiagram
                capacity={renderSeatCapacity}
                tableLabel={group.tableLabel}
                tableShape={group.tableShape}
                occupiedChairs={occupiedSeats}
                presidentialChairs={presidentialChairs}
                tableId={group.tableId}
                guestsById={guestsById}
                affinityRelations={affinityRelations}
                companionGroups={companionGroups}
              />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DistributionTableList({
  tableGroups,
  proposal = null,
  editable = false,
  unassigningGuestId = null,
  assigningGuestId = null,
  movingGuestId = null,
  unassignedGuests = [],
  onUnassignGuest,
  onAssignGuest,
  onMoveGuest,
  onUpdateGuestSeat,
  mutationWarning = null,
  mutationError = null,
  eventId,
  guests = [],
  affinityRelations = [],
  companionGroups = [],
  allTables = [],
  savingTableId = null,
  onUpdateTable,
}: {
  tableGroups: DistributionTableGroup[];
  proposal?: DistributionProposal | null;
  editable?: boolean;
  unassigningGuestId?: string | null;
  assigningGuestId?: string | null;
  movingGuestId?: string | null;
  unassignedGuests?: UnassignedGuestOption[];
  onUnassignGuest?: (guestId: string) => void;
  onAssignGuest?: (
    tableId: string,
    guestId: string,
    seatIndex?: number,
  ) => void | Promise<void>;
  onMoveGuest?: (
    guestId: string,
    targetTableId: string,
    seatIndex?: number,
  ) => void | Promise<void>;
  onUpdateGuestSeat?: (guestId: string, seatIndex: number) => void | Promise<void>;
  mutationWarning?: string | null;
  mutationError?: string | null;
  eventId: string;
  guests?: GuestView[];
  affinityRelations?: AffinityRelationInput[];
  companionGroups?: CompanionGroupInput[];
  allTables?: Array<{ id: string; label: string }>;
  savingTableId?: string | null;
  onUpdateTable?: (tableId: string, draft: TableEditDraft) => Promise<boolean>;
}) {
  const guestsById = useMemo(() => buildGuestsById(guests), [guests]);
  const [tableProximityByTableId, setTableProximityByTableId] = useState<
    Record<string, TableProximityPreference>
  >({});

  const [filter, setFilter] = useState<DistributionTableFilter>('all');
  const [search, setSearch] = useState('');
  const [openTableIds, setOpenTableIds] = useState<Set<string>>(() => new Set());
  const [assignTableId, setAssignTableId] = useState<string | null>(null);
  const [draggingGuestId, setDraggingGuestId] = useState<string | null>(null);
  const proposalChairMappings = useMemo(
    () => (proposal ? chairMappingsFromProposal(proposal) : {}),
    [proposal],
  );
  const [chairOverrides, setChairOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    setChairOverrides({});
  }, [proposal?.id]);

  const chairMappings = useMemo(
    () => ({ ...proposalChairMappings, ...chairOverrides }),
    [proposalChairMappings, chairOverrides],
  );

  const setChairMappings = useCallback(
    (
      value:
        | Record<string, string>
        | ((prev: Record<string, string>) => Record<string, string>),
    ) => {
      setChairOverrides((prev) =>
        typeof value === 'function'
          ? value({ ...proposalChairMappings, ...prev })
          : value,
      );
    },
    [proposalChairMappings],
  );

  const [targetChair, setTargetChair] = useState<string | null>(null);
  const [moveGuest, setMoveGuest] = useState<{
    guestId: string;
    guestName: string;
    sourceTableId: string;
    sourceChairId: string | null;
  } | null>(null);
  const [presidentialChairs, setPresidentialChairs] = useState<Set<string>>(
    () => new Set(),
  );
  const [mutationFocusTableId, setMutationFocusTableId] = useState<
    string | null
  >(null);

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

  useEffect(() => {
    setTableProximityByTableId(loadTableProximityPreferences(eventId));
  }, [eventId]);

  function handleTableProximityChange(
    tableId: string,
    preference: TableProximityPreference,
  ) {
    saveTableProximityPreference(eventId, tableId, preference);
    setTableProximityByTableId((current) => ({
      ...current,
      [tableId]: preference,
    }));
  }

  const handleRemoveGuest = (guestId: string) => {
    const sourceTableId = findGuestTableId(guestId);
    if (sourceTableId) {
      focusMutationTable(sourceTableId);
    }
    setChairMappings((prev) => {
      const next = { ...prev };
      delete next[guestId];
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

  const moveTableOptions = useMemo(() => {
    if (!moveGuest) {
      return [];
    }
    return buildMoveTableOptions(
      tableGroups,
      chairMappings,
      moveGuest.sourceTableId,
    );
  }, [chairMappings, moveGuest, tableGroups]);

  const searchMatchedGroups = useMemo(
    () => filterDistributionTableGroups(tableGroups, 'all', search),
    [tableGroups, search],
  );

  const statusCounts = useMemo(
    () => countTablesByStatus(searchMatchedGroups),
    [searchMatchedGroups],
  );

  const searchSummary = useMemo(
    () => summarizeDistributionSearch(searchMatchedGroups, search),
    [searchMatchedGroups, search],
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
          {DISTRIBUTION_TABLE_FILTER_OPTIONS.map((option) => {
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
            placeholder="Buscar mesa, invitado o categoría…"
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
              {searchSummary ? (
                <>
                  {searchSummary.matchingTables}{' '}
                  {searchSummary.matchingTables === 1 ? 'mesa' : 'mesas'}
                  {' · '}
                  {searchSummary.matchingGuests}{' '}
                  {searchSummary.matchingGuests === 1
                    ? 'invitado'
                    : 'invitados'}
                </>
              ) : (
                <>
                  {tableGroups.length}{' '}
                  {tableGroups.length === 1 ? 'mesa' : 'mesas'}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="card-admin overflow-hidden p-0">
        <div
          className={`hidden border-b border-neutral-200 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-wf-5 lg:grid lg:items-center ${TABLE_ROW_GAP_CLASS} ${TABLE_ROW_GRID_CLASS}`}
        >
          <span>Mesa</span>
          <span className="text-center">PAX</span>
          <span>Proximidad</span>
          <span>Forma</span>
          <span>Uso</span>
          <span className="text-right">Afinidad</span>
          <span className="flex justify-end">
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
              onOpenMoveGuest={(guestId, chairId) => {
                const guest = group.guests.find((item) => item.guestId === guestId);
                setMoveGuest({
                  guestId,
                  guestName: guest?.guestName ?? 'Invitado',
                  sourceTableId: group.tableId,
                  sourceChairId: chairId,
                });
              }}
              onMoveGuest={(guestId, targetTableId, seatIndex) => {
                focusMutationTable(targetTableId);
                void Promise.resolve(
                  onMoveGuest?.(guestId, targetTableId, seatIndex),
                ).finally(() => setDraggingGuestId(null));
              }}
              onUpdateGuestSeat={(guestId, seatIndex) => {
                const sourceTableId = findGuestTableId(guestId);
                if (sourceTableId) {
                  focusMutationTable(sourceTableId);
                }
                void Promise.resolve(
                  onUpdateGuestSeat?.(guestId, seatIndex),
                ).finally(() => setDraggingGuestId(null));
              }}
              onToggle={() => toggleTableOpen(group.tableId)}
              eventId={eventId}
              chairMappings={chairMappings}
              setChairMappings={setChairMappings}
              presidentialChairs={presidentialChairs}
              setPresidentialChairs={setPresidentialChairs}
              guestsById={guestsById}
              affinityRelations={affinityRelations}
              companionGroups={companionGroups}
              tableProximity={resolveTableProximityPreference(
                tableProximityByTableId,
                group.tableId,
              )}
              onTableProximityChange={(value) =>
                handleTableProximityChange(group.tableId, value)
              }
              allTables={allTables}
              savingTableId={savingTableId}
              onUpdateTable={onUpdateTable}
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
          const seatIndex = targetChair
            ? chairIdToSeatIndex(targetChair) ?? undefined
            : undefined;
          focusMutationTable(assignGroup.tableId);
          void Promise.resolve(
            onAssignGuest(assignGroup.tableId, guestId, seatIndex),
          ).finally(() => {
            setAssignTableId(null);
            setTargetChair(null);
          });
        }}
      />

      <MoveGuestDialog
        open={moveGuest !== null}
        guestId={moveGuest?.guestId ?? ''}
        guestName={moveGuest?.guestName ?? ''}
        sourceTableId={moveGuest?.sourceTableId ?? ''}
        sourceChairId={moveGuest?.sourceChairId ?? null}
        tables={moveTableOptions}
        movingGuestId={movingGuestId}
        onCancel={() => setMoveGuest(null)}
        onConfirm={(targetTableId, seatIndex) => {
          if (!moveGuest) {
            return;
          }
          focusMutationTable(targetTableId);
          const mutation =
            targetTableId === moveGuest.sourceTableId
              ? onUpdateGuestSeat?.(moveGuest.guestId, seatIndex)
              : onMoveGuest?.(moveGuest.guestId, targetTableId, seatIndex);
          void Promise.resolve(mutation).finally(() => setMoveGuest(null));
        }}
      />
    </div>
    </GuestPointerDragLayer>
  );
}
