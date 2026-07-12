'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { IconStar } from '@/components/icons';
import { GuestPill } from '@/components/admin/distribution/guest-pill';
import { GuestPointerDragLayer } from '@/components/admin/distribution/guest-pointer-drag-layer';
import { useGuestPointerDropHighlight } from '@/components/admin/distribution/use-guest-pointer-drop-highlight';
import { AssignGuestDialog } from '@/components/admin/distribution/assign-guest-dialog';
import { PlacementMutationFeedback } from '@/components/admin/distribution/placement-mutation-feedback';
import { FloorPlanAccessoriesOverlay } from '@/components/admin/floor-plan/floor-plan-accessories-overlay';
import { RoomShapeDisplay } from '@/components/admin/floor-plan/room-shape-display';
import {
  useRoomCanvasBounds,
  useLayoutCanvasTier,
  canvasTierUsesPortraitLayout,
  canvasTierEdgePaddingPx,
} from '@/components/admin/floor-plan/use-room-canvas-max-px';
import { Alert, ConfirmDialog, EmptyState, PageHeader } from '@/components/ui';
import {
  acceptGuestDragOver,
  clearGuestDrag,
  getActiveGuestDrag,
} from '@/lib/distribution-dnd';
import { wasGuestPointerDragRecent } from '@/lib/guest-pointer-drag';
import {
  chairIdToSeatIndex,
  chairMappingsFromProposal,
  buildOccupiedChairsForTable,
} from '@/lib/guest-chair-mappings';
import type { DistributionProposal } from '@/lib/api';
import {
  filterChipClass,
  filterChipCountClass,
  tableStatusDotClass,
} from '@/lib/semantic-ui';
import {
  formatRoomDimensions,
  computeTableGridLayout,
  computeTableLayoutInsets,
  roomPixelSizeFit,
  type FloorPlanSetup,
} from '@/lib/floor-plan-setup';
import {
  countTablesByStatus,
  filterDistributionTableGroups,
  getStatusChipLabel,
  type DistributionTableFilter,
  type DistributionTableGroup,
  type TableOccupancyStatus,
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

const OCCUPANCY_LEGEND: Array<{ status: TableOccupancyStatus; label: string }> =
  [
    { status: 'full', label: 'Llena' },
    { status: 'in-use', label: 'En uso' },
    { status: 'empty', label: 'Vacía' },
  ];

function tableMarkerTooltip(group: DistributionTableGroup): string {
  return `${group.tableLabel} · ${group.shapeLabel} · ${group.assignedCount}/${group.capacity} · ${getStatusChipLabel(group)}`;
}

const TABLE_MARKER_SLOT_CLASS =
  'flex h-11 w-12 shrink-0 items-center justify-center';
const TABLE_MARKER_SLOT_COMPACT_CLASS =
  'flex h-9 w-10 shrink-0 items-center justify-center';

function tableMarkerShapeClass(shapeLabel: string, compact: boolean): string {
  if (compact) {
    switch (shapeLabel) {
      case 'Redonda':
        return 'h-9 w-9 rounded-full';
      case 'Ovalada':
        return 'h-7 w-10 rounded-full';
      case 'Rectangular':
      default:
        return 'h-8 w-10 rounded-md';
    }
  }
  switch (shapeLabel) {
    case 'Redonda':
      return 'h-11 w-11 rounded-full';
    case 'Ovalada':
      return 'h-9 w-12 rounded-full';
    case 'Rectangular':
    default:
      return 'h-9 w-11 rounded-md';
  }
}

function tableMarkerAppearanceClass(
  status: TableOccupancyStatus,
  compact: boolean,
): string {
  const border = compact ? 'border-2' : 'border';
  switch (status) {
    case 'full':
      return `${border} border-success-500 bg-success-500/15 text-success-700`;
    case 'in-use':
      return `${border} border-warning-500 bg-warning-500/15 text-warning-700`;
    case 'empty':
      return `${border} border-neutral-500 bg-white text-neutral-700 shadow-sm`;
  }
}

function FloorPlanOccupancyLegend() {
  return (
    <div
      className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5"
      aria-label="Leyenda de ocupación de mesas"
    >
      {OCCUPANCY_LEGEND.map((item) => (
        <span
          key={item.status}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-600"
        >
          <span
            className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${tableStatusDotClass(item.status)}`}
            aria-hidden
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function TablePreviewCard({
  group,
  selected,
  compact = false,
  dropActive = false,
  onSelect,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  group: DistributionTableGroup;
  selected: boolean;
  compact?: boolean;
  dropActive?: boolean;
  onSelect: () => void;
  onDragOver?: (event: DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (event: DragEvent) => void;
}) {
  const tooltip = tableMarkerTooltip(group);
  const shapeClass = tableMarkerShapeClass(group.shapeLabel, compact);
  const ringClass = compact
    ? selected
      ? 'ring-2 ring-primary-500'
      : dropActive
        ? 'ring-2 ring-primary-500 brightness-105'
        : ''
    : selected
      ? 'ring-2 ring-primary-500 ring-offset-2'
      : dropActive
        ? 'ring-2 ring-primary-500 ring-offset-1 brightness-105'
        : '';

  return (
    <div className={compact ? TABLE_MARKER_SLOT_COMPACT_CLASS : TABLE_MARKER_SLOT_CLASS}>
      <button
        type="button"
        aria-pressed={selected}
        aria-label={tooltip}
        title={tooltip}
        onClick={() => {
          if (wasGuestPointerDragRecent()) {
            return;
          }
          onSelect();
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        data-guest-drop-table={group.tableId}
        data-guest-drop-free-seats={group.freeSeats}
        className={`flex items-center justify-center px-0.5 transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${shapeClass} ${tableMarkerAppearanceClass(group.status, compact)} ${ringClass}`}
      >
        <span
          className={`max-w-full truncate font-bold leading-none ${compact ? 'text-[10px]' : 'text-[11px]'}`}
        >
          {group.tableLabel}
        </span>
      </button>
    </div>
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
  eventId,
  chairMappings,
  setChairMappings,
  handleGuestDroppedOnChair,
  tableGroups,
  onHeaderPointerDown,
  presidentialChairs,
  setPresidentialChairs,
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
  onOpenAssignGuest?: (chairId?: string) => void;
  mutationWarning?: string | null;
  mutationError?: string | null;
  eventId: string;
  chairMappings: Record<string, string>;
  setChairMappings: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleGuestDroppedOnChair: (guestId: string, sourceTableId: string, targetTableId: string, targetChair: string) => void;
  tableGroups: DistributionTableGroup[];
  onHeaderPointerDown?: (e: React.PointerEvent) => void;
  presidentialChairs: Set<string>;
  setPresidentialChairs: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
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
  return (
    <div
      className={`card-admin shadow-lg ${compact ? 'border-primary-500/30 bg-neutral-0' : ''}`}
    >
      <div 
        className={`flex items-start justify-between gap-3 p-1 rounded-lg ${onHeaderPointerDown ? 'cursor-grab active:cursor-grabbing select-none hover:bg-neutral-50/50 transition-colors' : ''}`}
        onPointerDown={onHeaderPointerDown}
      >
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.08em] text-wf-5 flex items-center gap-1.5">
            {onHeaderPointerDown && (
              <svg className="h-3.5 w-3.5 text-neutral-400 shrink-0 select-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
              </svg>
            )}
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
          className="shrink-0 text-xs font-medium text-neutral-500 hover:text-neutral-700 p-1"
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()} // Stop drag when clicking Close
        >
          Cerrar
        </button>
      </div>

      <PlacementMutationFeedback
        warning={mutationWarning}
        error={mutationError}
        compact
      />

      <div className="mt-4 max-h-72 overflow-y-auto space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-500">
          Distribución de Sillas
        </h3>
        <div className="flex flex-col gap-2">
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
                  if (!payload) return;
                  handleGuestDroppedOnChair(payload.guestId, payload.sourceTableId, group.tableId, chairId);
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
                      onDragStart={() => onDragStartGuest?.(occupant.guestId)}
                      onDragEnd={onDragEndGuest}
                      onRemove={onUnassignGuest}
                      variant="row"
                    />
                  ) : (
                    <div className="flex items-center">
                      {canAssignGuest ? (
                        <button
                          type="button"
                          onClick={() => onOpenAssignGuest?.(chairId)}
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
    </div>
  );
}

function TableGuestsPanelSlot({
  group,
  className,
  onHeaderPointerDown,
  ...panelProps
}: React.ComponentProps<typeof TableGuestsPanel> & {
  className?: string;
  onHeaderPointerDown?: (e: React.PointerEvent) => void;
}) {
  return (
    <div className={className}>
      <TableGuestsPanel group={group} compact onHeaderPointerDown={onHeaderPointerDown} {...panelProps} />
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
  eventId,
  proposal = null,
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
  onUpdateGuestSeat,
  mutationError = null,
  mutationWarning = null,
}: {
  eventId: string;
  proposal?: DistributionProposal | null;
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
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});
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
  const [panelOffset, setPanelOffset] = useState({ x: 0, y: 0 });
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [targetChair, setTargetChair] = useState<string | null>(null);
  const [presidentialChairs, setPresidentialChairs] = useState<Set<string>>(() => new Set());
  const panelDragStart = useRef<{ x: number; y: number } | null>(null);

  const handleRemoveGuest = (guestId: string) => {
    setChairMappings((prev) => {
      const next = { ...prev };
      delete next[guestId];
      return next;
    });
    if (onUnassignGuest) {
      onUnassignGuest(guestId);
    }
  };

  useEffect(() => {
    setPanelOffset({ x: 0, y: 0 });
  }, [selectedGroup?.tableId]);

  const handlePanelHeaderPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select')) {
      return;
    }
    
    const startX = e.clientX - panelOffset.x;
    const startY = e.clientY - panelOffset.y;
    
    panelDragStart.current = { x: startX, y: startY };
    
    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!panelDragStart.current) return;
      let newX = moveEvent.clientX - panelDragStart.current.x;
      let newY = moveEvent.clientY - panelDragStart.current.y;

      // Clamp to keep panel inside the canvas card
      if (canvasCardRef.current) {
        const card = canvasCardRef.current.getBoundingClientRect();
        // Panel is positioned right-4 top-4 (16px from right, 16px from top).
        // The default (offset=0) corresponds to right:16px, top:16px.
        // Max leftward drag: panel right edge can go at most to card left edge.
        // Panel width ≈ 384px (w-96). We allow it to go right up to the left card edge.
        const panelWidth = 384;
        const minX = -(card.width - panelWidth - 32); // allows dragging to left edge
        const maxX = card.width - 32; // allows dragging further right beyond default
        const minY = -16; // no higher than original top position
        const maxY = card.height - 80; // keep at least 80px of card visible below
        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));
      }

      setPanelOffset({ x: newX, y: newY });
    };
    
    const handlePointerUp = () => {
      panelDragStart.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  useEffect(() => {
    const key = `taulamic:customLayoutPositions:${eventId}`;
    const rawData = localStorage.getItem(key);
    if (rawData) {
      try {
        setCustomPositions(JSON.parse(rawData));
      } catch (e) {
        console.error(e);
      }
    }
  }, [roomSetup.shape, eventId]);

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

  const wasDraggingTableRef = useRef(false);

  const handlePointerDownEntity = (
    event: React.PointerEvent,
    entityId: string,
    initialPos: { x: number; y: number }
  ) => {
    if (!editable) {
      return;
    }
    
    const handle = event.currentTarget as HTMLElement;
    const startX = event.clientX;
    const startY = event.clientY;
    let hasDragged = false;
    
    const container = canvasHostRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    
    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      if (!hasDragged && Math.hypot(dx, dy) < 5) {
        return;
      }
      
      if (!hasDragged) {
        hasDragged = true;
        try {
          handle.setPointerCapture(event.pointerId);
        } catch (err) {
          console.error(err);
        }
      }
      
      const dxPct = (dx / rect.width) * 100;
      const dyPct = (dy / rect.height) * 100;
      
      const nextX = Math.max(0, Math.min(100, initialPos.x + dxPct));
      const nextY = Math.max(0, Math.min(100, initialPos.y + dyPct));
      
      setCustomPositions((prev) => ({
        ...prev,
        [entityId]: { x: nextX, y: nextY },
      }));
    };
    
    const onPointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      
      if (hasDragged) {
        if (handle.hasPointerCapture(upEvent.pointerId)) {
          try {
            handle.releasePointerCapture(upEvent.pointerId);
          } catch (err) {}
        }
        
        // Suppress selecting/clicking right after a drag
        wasDraggingTableRef.current = true;
        setTimeout(() => {
          wasDraggingTableRef.current = false;
        }, 100);

        setCustomPositions((prev) => {
          const next = { ...prev };
          localStorage.setItem(`taulamic:customLayoutPositions:${eventId}`, JSON.stringify(next));
          return next;
        });
      }
    };
    
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleGuestDroppedOnChair = (
    guestId: string,
    sourceTableId: string,
    targetTableId: string,
    targetChair: string,
  ) => {
    const seatIndex = chairIdToSeatIndex(targetChair);
    if (seatIndex === null) {
      setDraggingGuestId(null);
      return;
    }

    if (sourceTableId === targetTableId) {
      if (onUpdateGuestSeat) {
        void Promise.resolve(onUpdateGuestSeat(guestId, seatIndex)).finally(
          () => setDraggingGuestId(null),
        );
      } else {
        setDraggingGuestId(null);
      }
      return;
    }

    if (onMoveGuest) {
      void Promise.resolve(
        onMoveGuest(guestId, targetTableId, seatIndex),
      ).finally(() => setDraggingGuestId(null));
      return;
    }

    if (onAssignGuest) {
      void Promise.resolve(
        onAssignGuest(targetTableId, guestId, seatIndex),
      ).finally(() => setDraggingGuestId(null));
      return;
    }

    setDraggingGuestId(null);
  };

  const getDefaultTablePosition = (i: number) => {
    const { columns, scale, compact } = tableGridLayout;
    const { widthPx: W_canvas, heightPx: H_canvas } = canvasSize;
    if (W_canvas <= 0 || H_canvas <= 0) {
      return { x: 50, y: 50 };
    }
    
    const W_zone = 100 - 2 * tableLayout.insetX;
    const H_zone = 100 - 2 * tableLayout.insetY;
    const W_grid = tableGridLayout.scaledWidth;
    const H_grid = tableGridLayout.scaledHeight;
    
    const gridLeftPx = (W_canvas * (tableLayout.insetX / 100)) + ((W_canvas * (W_zone / 100)) - W_grid) / 2;
    const gridTopPx = (H_canvas * (tableLayout.insetY / 100)) + ((H_canvas * (H_zone / 100)) - H_grid) / 2;
    
    const w_slot = compact ? 40 : 48;
    const h_slot = compact ? 36 : 44;
    
    const col = i % columns;
    const row = Math.floor(i / columns);
    
    const slotLeftPx = col * (w_slot + 2) * scale;
    const slotTopPx = row * (h_slot + 2) * scale;
    
    const centerX = gridLeftPx + slotLeftPx + (w_slot * scale) / 2;
    const centerY = gridTopPx + slotTopPx + (h_slot * scale) / 2;
    
    return {
      x: (centerX / W_canvas) * 100,
      y: (centerY / H_canvas) * 100,
    };
  };
  const canvasCardRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const canvasTier = useLayoutCanvasTier();
  const portraitLayout = canvasTierUsesPortraitLayout(canvasTier);
  const canvasBounds = useRoomCanvasBounds(
    canvasHostRef,
    canvasTier,
    roomSetup,
    portraitLayout,
    canvasCardRef,
  );
  const isPhoneCanvas = canvasTier === 'phone';

  const canvasSize = useMemo(
    () =>
      roomPixelSizeFit(roomSetup, canvasBounds, {
        portraitLayout,
        edgePaddingPx: canvasTierEdgePaddingPx(canvasTier),
      }),
    [canvasBounds, portraitLayout, canvasTier, roomSetup],
  );

  const layoutRefPx = Math.max(canvasSize.widthPx, canvasSize.heightPx);
  const [dropTargetTableId, setDropTargetTableId] = useState<string | null>(
    null,
  );
  useGuestPointerDropHighlight(setDropTargetTableId);

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

  const tableLayout = useMemo(
    () => computeTableLayoutInsets(filteredGroups.length, layoutRefPx),
    [filteredGroups.length, layoutRefPx],
  );
  const tableGridLayout = useMemo(() => {
    const { widthPx, heightPx } = canvasSize;
    const zoneWidthPx = ((100 - tableLayout.insetX * 2) / 100) * widthPx;
    const zoneHeightPx = ((100 - tableLayout.insetY * 2) / 100) * heightPx;
    return computeTableGridLayout(
      filteredGroups.length,
      zoneWidthPx,
      zoneHeightPx,
    );
  }, [canvasSize, filteredGroups.length, tableLayout]);
  const compactTableMarkers = tableGridLayout.compact;

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

  const guestPanelProps = selectedGroup
    ? {
        group: selectedGroup,
        editable,
        unassigningGuestId,
        movingGuestId,
        draggingGuestId,
        onDragStartGuest: setDraggingGuestId,
        onDragEndGuest: () => setDraggingGuestId(null),
        onUnassignGuest: handleRemoveGuest,
        mutationWarning,
        mutationError,
        canAssignGuest:
          editable &&
          selectedGroup.freeSeats > 0,
        onOpenAssignGuest: (chairId?: string) => {
          setTargetChair(chairId ?? null);
          setAssignOpen(true);
        },
        onClose: () => setSelectedGroup(null),
        eventId,
        chairMappings,
        setChairMappings,
        handleGuestDroppedOnChair,
        tableGroups,
        presidentialChairs,
        setPresidentialChairs,
      }
    : null;

  return (
    <GuestPointerDragLayer
      onDrop={(guestId, targetTableId, chair) => {
        if (!editable) return;
        if (chair) {
          const sourceTableId = tableGroups.find((g) => g.guests.some((gst) => gst.guestId === guestId))?.tableId ?? '';
          handleGuestDroppedOnChair(guestId, sourceTableId, targetTableId, chair);
        } else {
          if (onMoveGuest) {
            void Promise.resolve(onMoveGuest(guestId, targetTableId)).finally(
              () => setDraggingGuestId(null),
            );
          }
        }
      }}
      onDragStart={() => {
        const payload = getActiveGuestDrag();
        if (payload) {
          setDraggingGuestId(payload.guestId);
        }
      }}
      onDragEnd={() => setDraggingGuestId(null)}
    >
      <PageHeader
        title="Plano del salón"
        subtitle="Pulsa una mesa para ver los invitados asignados."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary whitespace-nowrap"
              disabled={!editable || Object.keys(customPositions).length === 0}
              onClick={() => setResetDialogOpen(true)}
            >
              Restablecer posiciones
            </button>
          </div>
        }
      />

      <div className="mb-6">
        <Alert variant="info">
          {editable
            ? 'Pulsa una mesa para ver invitados. Arrastra un pill a otra mesa para moverlo.'
            : 'Pulsa una mesa en el plano para ver sus invitados.'}
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

      <div className="flex min-h-0 flex-col">
        <div
          ref={canvasCardRef}
          className="card-admin relative flex flex-col overflow-visible border-2 border-dashed border-neutral-200 bg-neutral-50/50 !p-3 sm:!p-4"
        >
          <div
            ref={canvasHostRef}
            className="w-full"
            style={{ minHeight: canvasSize.heightPx }}
          >
            <RoomShapeDisplay
              setup={roomSetup}
              widthPx={canvasSize.widthPx}
              heightPx={canvasSize.heightPx}
              className="max-w-none"
            >
              {filteredGroups.map((group, idx) => {
                const customPos = customPositions[group.tableId];
                const pos = customPos ?? getDefaultTablePosition(idx);
                
                return (
                  <div
                    key={group.tableId}
                    className={`absolute z-[2] -translate-x-1/2 -translate-y-1/2 ${
                      editable ? 'cursor-move touch-none select-none' : ''
                    }`}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                    }}
                    onPointerDown={(e) => {
                      handlePointerDownEntity(e, group.tableId, pos);
                    }}
                  >
                    <TablePreviewCard
                      group={group}
                      compact={compactTableMarkers}
                      selected={selectedGroup?.tableId === group.tableId}
                      dropActive={dropTargetTableId === group.tableId}
                      onSelect={() => {
                        if (wasDraggingTableRef.current) {
                          return;
                        }
                        setSelectedGroup((current) =>
                          current?.tableId === group.tableId ? null : group,
                        );
                      }}
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
                  </div>
                );
              })}

              <FloorPlanAccessoriesOverlay
                accessoryIds={roomSetup.placedAccessories}
                tableCount={filteredGroups.length}
                canvasRefPx={layoutRefPx}
                portraitFixedSlots={isPhoneCanvas}
                roomShape={roomSetup.shape}
                portraitCanvas={canvasSize.heightPx > canvasSize.widthPx}
                customPositions={customPositions}
                onPointerDownAccessory={(e, id, initialPos) => handlePointerDownEntity(e, id, initialPos)}
                editable={editable}
              />
            </RoomShapeDisplay>
          </div>

          {guestPanelProps ? (
            <TableGuestsPanelSlot
              {...guestPanelProps}
              className="mt-4 w-full lg:hidden"
            />
          ) : null}
          {filteredGroups.length === 0 ? (
            <p className="mt-4 text-center text-sm text-neutral-500">
              Ninguna mesa coincide con los filtros
            </p>
          ) : null}

          <FloorPlanOccupancyLegend />

          {guestPanelProps ? (
            <div 
              style={{ transform: `translate(${panelOffset.x}px, ${panelOffset.y}px)` }}
              className="absolute right-4 top-4 z-[60] hidden w-96 max-w-sm lg:block select-none"
            >
              <TableGuestsPanelSlot 
                {...guestPanelProps} 
                onHeaderPointerDown={handlePanelHeaderPointerDown}
              />
            </div>
          ) : null}
        </div>
        <p className="mt-3 text-center text-sm font-medium text-neutral-600">
          {formatRoomDimensions(roomSetup)}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link href={distributionHref} className="btn-secondary whitespace-nowrap">
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
          if (targetChair) {
            setChairMappings((prev) => {
              const next = { ...prev, [guestId]: targetChair };
              localStorage.setItem(`taulamic:guestChairs:${eventId}`, JSON.stringify(next));
              return next;
            });
          }
          void Promise.resolve(
            onAssignGuest(selectedGroup.tableId, guestId),
          ).finally(() => {
            setAssignOpen(false);
            setTargetChair(null);
          });
        }}
      />
      <ConfirmDialog
        open={resetDialogOpen}
        title="Restablecer posiciones"
        description="¿Restablecer todas las mesas y accesorios a sus posiciones por defecto?"
        confirmLabel="Restablecer"
        cancelLabel="Cancelar"
        destructive
        onConfirm={() => {
          localStorage.removeItem(`taulamic:customLayoutPositions:${eventId}`);
          setCustomPositions({});
          setResetDialogOpen(false);
        }}
        onCancel={() => setResetDialogOpen(false)}
      />
    </GuestPointerDragLayer>
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
        <Link href={distributionHref} className="btn-primary whitespace-nowrap">
          Ir a distribución
        </Link>
      }
    />
  );
}
