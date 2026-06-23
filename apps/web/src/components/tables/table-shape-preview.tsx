import type { SeatTopology } from '@/lib/api';

function Seat({
  cx,
  cy,
  label,
}: {
  cx: number;
  cy: number;
  label: string;
}) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={11}
        fill="#F9F9F9"
        stroke="#E0E0E0"
        strokeWidth={1.5}
      />
      <text
        x={cx}
        y={cy + 3}
        textAnchor="middle"
        fontSize={9}
        fontWeight={700}
        fill="#4A4A4A"
        fontFamily="Inter, sans-serif"
      >
        {label}
      </text>
    </g>
  );
}

/** Vista previa mesa — sillas fuera del perímetro (Figma Make). */
export function TableShapePreview({
  shape,
  capacity,
  topology,
}: {
  shape: string;
  capacity: number;
  topology: SeatTopology;
}) {
  const cx = 122;
  const cy = 118;
  const tableR = 58;
  const seatOffset = 14;

  const seats = topology.seats;

  if (shape === 'rectangular') {
    const top = Math.ceil(capacity / 2);
    const bot = capacity - top;
    const tableW = 156;
    const tableH = 108;
    const left = cx - tableW / 2;
    const topY = cy - tableH / 2;

    return (
      <svg width={244} height={236} viewBox="0 0 244 236" aria-hidden>
        {Array.from({ length: top }, (_, i) => {
          const x =
            top === 1
              ? cx
              : left + 22 + (tableW - 44) * (i / Math.max(top - 1, 1));
          return (
            <Seat
              key={`t${i}`}
              cx={x}
              cy={cy - tableH / 2 - seatOffset}
              label={seats[i]?.label ?? `S${i + 1}`}
            />
          );
        })}
        {Array.from({ length: bot }, (_, i) => {
          const x =
            bot === 1
              ? cx
              : left + 22 + (tableW - 44) * (i / Math.max(bot - 1, 1));
          return (
            <Seat
              key={`b${i}`}
              cx={x}
              cy={cy + tableH / 2 + seatOffset}
              label={seats[top + i]?.label ?? `S${top + i + 1}`}
            />
          );
        })}
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
          fill="#8A8A8A"
          fontFamily="Inter, sans-serif"
        >
          {capacity} pax
        </text>
      </svg>
    );
  }

  if (shape === 'oval' || shape === 'ovalada') {
    const rx = 86;
    const ry = 50;
    return (
      <svg width={244} height={236} viewBox="0 0 244 236" aria-hidden>
        {seats.map((seat, i) => {
          const a = (i / capacity) * Math.PI * 2 - Math.PI / 2;
          const dist = Math.hypot(
            rx * Math.cos(a),
            ry * Math.sin(a),
          );
          const nx = (rx * Math.cos(a)) / dist;
          const ny = (ry * Math.sin(a)) / dist;
          return (
            <Seat
              key={seat.index}
              cx={cx + (dist + seatOffset) * nx}
              cy={cy + (dist + seatOffset) * ny}
              label={seat.label}
            />
          );
        })}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="#FFFFFF"
          stroke="#E0E0E0"
          strokeWidth={2}
        />
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={12}
          fill="#8A8A8A"
          fontFamily="Inter, sans-serif"
        >
          {capacity} pax
        </text>
      </svg>
    );
  }

  // redonda (default)
  return (
    <svg width={244} height={236} viewBox="0 0 244 236" aria-hidden>
      {seats.map((seat, i) => {
        const a = (i / capacity) * Math.PI * 2 - Math.PI / 2;
        return (
          <Seat
            key={seat.index}
            cx={cx + (tableR + seatOffset) * Math.cos(a)}
            cy={cy + (tableR + seatOffset) * Math.sin(a)}
            label={seat.label}
          />
        );
      })}
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
        fill="#8A8A8A"
        fontFamily="Inter, sans-serif"
      >
        {capacity} pax
      </text>
    </svg>
  );
}

/** Mapea id UI → id API de forma de mesa. */
export function apiTableShape(shape: string): string {
  if (shape === 'oval') {
    return 'ovalada';
  }
  return shape;
}
