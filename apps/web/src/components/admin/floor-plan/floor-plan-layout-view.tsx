'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
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
import { Alert, EmptyState, PageHeader } from '@/components/ui';
import {
  acceptGuestDragOver,
  clearGuestDrag,
  getActiveGuestDrag,
} from '@/lib/distribution-dnd';
import { wasGuestPointerDragRecent } from '@/lib/guest-pointer-drag';
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

      <div className="mt-4 max-h-48 overflow-y-auto lg:max-h-40">
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

function TableGuestsPanelSlot({
  group,
  className,
  ...panelProps
}: {
  group: DistributionTableGroup;
  className?: string;
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
  onClose: () => void;
}) {
  return (
    <div className={className}>
      <TableGuestsPanel group={group} compact {...panelProps} />
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
        onUnassignGuest,
        mutationWarning,
        mutationError,
        canAssignGuest:
          editable &&
          selectedGroup.freeSeats > 0 &&
          unassignedGuests.length > 0,
        onOpenAssignGuest: () => setAssignOpen(true),
        onClose: () => setSelectedGroup(null),
      }
    : null;

  return (
    <GuestPointerDragLayer
      onDrop={(guestId, targetTableId) => {
        if (!editable || !onMoveGuest) {
          return;
        }
        const targetGroup = tableGroups.find(
          (group) => group.tableId === targetTableId,
        );
        if (targetGroup) {
          setSelectedGroup(targetGroup);
        }
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
              <div
                className="absolute z-[2] flex items-center justify-center"
                style={{
                  left: `${tableLayout.insetX}%`,
                  right: `${tableLayout.insetX}%`,
                  top: `${tableLayout.insetY}%`,
                  bottom: `${tableLayout.insetY}%`,
                }}
              >
                <div
                  style={{
                    width: tableGridLayout.scaledWidth,
                    height: tableGridLayout.scaledHeight,
                  }}
                >
                  <div
                    className="grid gap-0.5"
                    style={{
                      width: tableGridLayout.naturalWidth,
                      height: tableGridLayout.naturalHeight,
                      gridTemplateColumns: `repeat(${tableGridLayout.columns}, minmax(0, max-content))`,
                      transform: `scale(${tableGridLayout.scale})`,
                      transformOrigin: 'top left',
                    }}
                  >
                {filteredGroups.map((group) => (
                  <TablePreviewCard
                    key={group.tableId}
                    group={group}
                    compact={compactTableMarkers}
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
                </div>
              </div>
              <FloorPlanAccessoriesOverlay
                accessoryIds={roomSetup.placedAccessories}
                tableCount={filteredGroups.length}
                canvasRefPx={layoutRefPx}
                portraitFixedSlots={isPhoneCanvas}
                roomShape={roomSetup.shape}
                portraitCanvas={canvasSize.heightPx > canvasSize.widthPx}
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
            <div className="absolute right-4 top-4 z-30 hidden w-72 max-w-xs lg:block">
              <TableGuestsPanelSlot {...guestPanelProps} />
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
        <Link href={distributionHref} className="btn-primary">
          Ir a distribución
        </Link>
      }
    />
  );
}
