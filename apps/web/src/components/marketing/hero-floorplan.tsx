const TABLES = [
  { x: 88, y: 88, r: 36, hi: false, n: 1 },
  { x: 220, y: 88, r: 36, hi: false, n: 2 },
  { x: 88, y: 216, r: 36, hi: false, n: 3 },
  { x: 220, y: 216, r: 36, hi: false, n: 4 },
  { x: 154, y: 152, r: 28, hi: true, n: 5 },
] as const;

function seatCoords(
  x: number,
  y: number,
  radius: number,
  seatCount: number,
): Array<{ cx: number; cy: number }> {
  const dist = radius + 12;
  return Array.from({ length: seatCount }, (_, index) => {
    const angle = (index / seatCount) * Math.PI * 2;
    return {
      cx: Math.round(x + dist * Math.cos(angle)),
      cy: Math.round(y + dist * Math.sin(angle)),
    };
  });
}

/** Coordenadas precomputadas para evitar mismatch de hidratación (float SSR vs cliente). */
const HERO_TABLES = TABLES.map((table) => ({
  ...table,
  seats: seatCoords(table.x, table.y, table.r, table.hi ? 6 : 8),
}));

/** Ilustración hero — port fiel de `HeroFloorplan` en Figma Make (App.tsx). */
export function HeroFloorplan() {
  return (
    <div className="relative mx-auto h-[330px] w-full max-w-[370px]">
      <svg
        aria-hidden
        className="block h-[310px] w-full"
        viewBox="0 0 310 310"
      >
        <rect
          x="8"
          y="8"
          width="294"
          height="294"
          rx="18"
          fill="#F5F5F5"
          stroke="#E8E8E8"
          strokeWidth="1.5"
        />
        {HERO_TABLES.flatMap((table) => [
          ...table.seats.map((seat, index) => (
            <circle
              key={`${table.n}-seat-${index}`}
              cx={seat.cx}
              cy={seat.cy}
              r="5"
              fill={table.hi ? '#E86B4A' : '#E8E8E8'}
            />
          )),
          <g key={`${table.n}-table`}>
            <circle
              cx={table.x}
              cy={table.y}
              r={table.r}
              fill={table.hi ? '#FDECE8' : '#FFFFFF'}
              stroke={table.hi ? '#E86B4A' : '#E8E8E8'}
              strokeWidth={table.hi ? 2 : 1.5}
            />
            <text
              x={table.x}
              y={table.y + 4}
              textAnchor="middle"
              fontSize="11"
              fill={table.hi ? '#E86B4A' : '#8A8A8A'}
              fontWeight="600"
              fontFamily="Inter, sans-serif"
            >
              {table.n}
            </text>
          </g>,
        ])}
      </svg>

      <div className="absolute bottom-2 right-0 min-w-36 rounded-xl border border-neutral-200 bg-neutral-0 px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.1)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-neutral-500">
          Afinidad media
        </p>
        <p className="text-2xl font-bold leading-none text-neutral-900">94%</p>
        <div className="mt-2 h-1 rounded-sm bg-neutral-200">
          <div className="h-full w-[94%] rounded-sm bg-primary-500" />
        </div>
      </div>
    </div>
  );
}
