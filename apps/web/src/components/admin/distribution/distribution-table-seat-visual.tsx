'use client';

import { useMemo } from 'react';
import { getCategoryColor, type CategoryColor } from '@/lib/category-colors';
import {
  TABLE_DIAGRAM,
  diagramEdgePoint,
  getDiagramNameLabelBox,
  getDiagramSeatPositions,
} from '@/lib/distribution-table-diagram-layout';
import {
  clampDiagramNameLabelBox,
  diagramLabelWidth,
  formatDiagramGuestName,
} from '@/lib/guest-display-name';
import {
  computeTableSeatRelations,
  type SeatOccupant,
} from '@/lib/distribution-seat-visual';
import type { AffinityRelationInput, CompanionGroupInput } from '@/lib/table-affinity-score';

const RELATION_COLOR = {
  afinidad: '#10b981',
  incompatibilidad: '#f43f5e',
} as const;

const RELATION_LINE_DASH = '5 4';

export function SeatCircle({
  chairId,
  occupant,
  presidential = false,
  className = '',
  style,
  colorLookup,
}: {
  chairId: string;
  occupant?: SeatOccupant;
  presidential?: boolean;
  className?: string;
  style?: React.CSSProperties;
  colorLookup?: ReadonlyMap<string, CategoryColor>;
}) {
  const colors = getCategoryColor(occupant?.categoryName, {
    presidential,
    empty: !occupant,
    colorLookup,
  });

  const tooltip = occupant
    ? occupant.categoryName?.trim() || 'Sin categoría'
    : `Silla ${chairId} vacía`;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border text-[10px] font-bold shadow-sm ${className}`}
      style={{
        backgroundColor: colors.fill,
        borderColor: colors.border,
        color: colors.text,
        ...style,
      }}
      title={tooltip}
    >
      {chairId}
    </span>
  );
}

function SvgLinkIcon({
  x,
  y,
  size,
  color,
  type,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  type: 'afinidad' | 'incompatibilidad';
}) {
  const scale = size / 24;
  return (
    <g transform={`translate(${x - size / 2}, ${y - size / 2}) scale(${scale})`}>
      <circle cx={12} cy={12} r={13} fill="#ffffff" stroke="#e5e5e5" strokeWidth={0.5} />
      {type === 'afinidad' ? (
        <>
          <path
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
            fill="none"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
            fill="none"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="M18.8 4a5 5 0 0 0-7.07 0l-1.72 1.71"
            fill="none"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.1 20a5 5 0 0 0 7.07 0l1.71-1.71"
            fill="none"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="m2 2 20 20"
            fill="none"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </g>
  );
}

function TableBody({
  shape,
  capacity,
  tableLabel,
}: {
  shape: string;
  capacity: number;
  tableLabel: string;
}) {
  const normalized = shape.trim().toLowerCase();
  const { cx, cy, tableR } = TABLE_DIAGRAM;

  if (normalized.includes('rect')) {
    const tableW = 156;
    const tableH = 108;
    const left = cx - tableW / 2;
    const topY = cy - tableH / 2;
    return (
      <>
        <rect
          x={left}
          y={topY}
          width={tableW}
          height={tableH}
          rx={6}
          fill="#FFFFFF"
          stroke="#E0E0E0"
          strokeWidth={2}
        />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={12}
          fill="#525252"
          fontFamily="Inter, sans-serif"
          fontWeight={600}
        >
          {tableLabel}
        </text>
      </>
    );
  }

  if (normalized.includes('oval')) {
    return (
      <>
        <ellipse
          cx={cx}
          cy={cy}
          rx={86}
          ry={50}
          fill="#FFFFFF"
          stroke="#E0E0E0"
          strokeWidth={2}
        />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={12}
          fill="#525252"
          fontFamily="Inter, sans-serif"
          fontWeight={600}
        >
          {tableLabel}
        </text>
      </>
    );
  }

  return (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={tableR}
        fill="#FFFFFF"
        stroke="#E0E0E0"
        strokeWidth={2}
      />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize={12}
        fill="#525252"
        fontFamily="Inter, sans-serif"
        fontWeight={600}
      >
        {tableLabel}
      </text>
    </>
  );
}

export function TableSeatDiagram({
  capacity,
  tableLabel,
  tableShape,
  occupiedChairs,
  presidentialChairs,
  tableId,
  guestsById,
  affinityRelations,
  companionGroups,
  colorLookup,
}: {
  capacity: number;
  tableLabel: string;
  tableShape: string;
  occupiedChairs: Record<string, SeatOccupant | undefined>;
  presidentialChairs: Set<string>;
  tableId: string;
  guestsById: Map<string, { nombre: string; categoryName?: string }>;
  affinityRelations: AffinityRelationInput[];
  companionGroups: CompanionGroupInput[];
  colorLookup?: ReadonlyMap<string, CategoryColor>;
}) {
  const seatPositions = useMemo(
    () => getDiagramSeatPositions(tableShape, capacity),
    [tableShape, capacity],
  );

  const positionByLabel = useMemo(
    () => new Map(seatPositions.map((seat) => [seat.label, seat])),
    [seatPositions],
  );

  const relations = useMemo(
    () =>
      computeTableSeatRelations({
        occupiedChairs,
        guestsById,
        affinityRelations,
        companionGroups,
        tableShape,
        capacity,
      }),
    [
      occupiedChairs,
      guestsById,
      affinityRelations,
      companionGroups,
      tableShape,
      capacity,
    ],
  );

  const { viewBox, width, height, seatRadius } = TABLE_DIAGRAM;
  const labelWidth = diagramLabelWidth(capacity);
  const viewParts = viewBox.split(/\s+/).map(Number);
  const viewMinX = viewParts[0] ?? -72;
  const viewWidth = viewParts[2] ?? 388;
  const viewMaxX = viewMinX + viewWidth;

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      className="mx-auto max-w-full overflow-visible"
      role="img"
      aria-label={`Vista de mesa ${tableLabel}`}
    >
      <TableBody shape={tableShape} capacity={capacity} tableLabel={tableLabel} />

      {relations.map((relation) => {
        const posA = positionByLabel.get(relation.chairA);
        const posB = positionByLabel.get(relation.chairB);
        if (!posA || !posB) {
          return null;
        }

        const pointA = { x: posA.seatX, y: posA.seatY };
        const pointB = { x: posB.seatX, y: posB.seatY };
        const start = diagramEdgePoint(pointA, pointB, seatRadius + 1);
        const end = diagramEdgePoint(pointB, pointA, seatRadius + 1);
        const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
        const stroke = RELATION_COLOR[relation.type];
        const key = `${relation.chairA}-${relation.chairB}-${relation.type}`;

        if (relation.adjacent) {
          return (
            <SvgLinkIcon
              key={key}
              type={relation.type}
              x={mid.x}
              y={mid.y}
              size={16}
              color={stroke}
            />
          );
        }

        return (
          <g key={key}>
            <line
              x1={start.x}
              y1={start.y}
              x2={mid.x}
              y2={mid.y}
              stroke={stroke}
              strokeWidth={2}
              strokeDasharray={RELATION_LINE_DASH}
              strokeLinecap="round"
            />
            <SvgLinkIcon
              type={relation.type}
              x={mid.x}
              y={mid.y}
              size={16}
              color={stroke}
            />
            <line
              x1={mid.x}
              y1={mid.y}
              x2={end.x}
              y2={end.y}
              stroke={stroke}
              strokeWidth={2}
              strokeDasharray={RELATION_LINE_DASH}
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {seatPositions.map((seat) => {
        const occupant = occupiedChairs[seat.label];
        const isPresidential = presidentialChairs.has(`${tableId}:${seat.label}`);
        const colors = getCategoryColor(occupant?.categoryName, {
          presidential: isPresidential,
          empty: !occupant,
          colorLookup,
        });
        const tooltip = occupant
          ? occupant.categoryName?.trim() || 'Sin categoría'
          : `Silla ${seat.label} vacía`;

        return (
          <g key={seat.label}>
            <circle
              cx={seat.seatX}
              cy={seat.seatY}
              r={seatRadius}
              fill={colors.fill}
              stroke={colors.border}
              strokeWidth={1.5}
            >
              <title>{tooltip}</title>
            </circle>
            <text
              x={seat.seatX}
              y={seat.seatY + 3}
              textAnchor="middle"
              fontSize={9}
              fontWeight={700}
              fill={colors.text}
              fontFamily="Inter, sans-serif"
              pointerEvents="none"
            >
              {seat.label}
            </text>

            {occupant ? (
              (() => {
                const labelBox = clampDiagramNameLabelBox(
                  getDiagramNameLabelBox(seat, labelWidth),
                  viewMinX,
                  viewMaxX,
                );
                const displayName = formatDiagramGuestName(occupant.guestName);
                return (
                  <foreignObject
                    x={labelBox.x}
                    y={labelBox.y}
                    width={labelBox.width}
                    height={labelBox.height}
                    overflow="visible"
                  >
                    <div
                      title={occupant.guestName}
                      style={{
                        width: '100%',
                        display: 'block',
                        fontSize: 9,
                        fontWeight: 600,
                        color: '#525252',
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: 1.2,
                        textAlign: labelBox.align,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {displayName}
                    </div>
                  </foreignObject>
                );
              })()
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function enrichOccupiedChairs(
  occupiedChairs: Record<string, { guestId: string; guestName: string } | undefined>,
  guestsById: Map<string, { nombre: string; categoryName?: string }>,
): Record<string, SeatOccupant | undefined> {
  const enriched: Record<string, SeatOccupant | undefined> = {};
  for (const [chairId, occupant] of Object.entries(occupiedChairs)) {
    if (!occupant) {
      enriched[chairId] = undefined;
      continue;
    }
    enriched[chairId] = {
      guestId: occupant.guestId,
      guestName: occupant.guestName,
      categoryName: guestsById.get(occupant.guestId)?.categoryName,
    };
  }
  return enriched;
}

export function buildGuestsById(
  guests: Array<{ id: string; nombre: string; categories?: Array<{ name: string }> }>,
): Map<string, { nombre: string; categoryName?: string }> {
  return new Map(
    guests.map((guest) => [
      guest.id,
      {
        nombre: guest.nombre,
        categoryName: guest.categories?.[0]?.name,
      },
    ]),
  );
}
