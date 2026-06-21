/** Logo Taulamic — 8 nodos coral · líneas coral · círculo central peach (Figma Make). */

export function LogoIcon({
  size,
  light = false,
}: {
  size: number;
  light?: boolean;
}) {
  const S = size;
  const N = 8;
  const cx = S / 2;
  const cy = S / 2;
  const R = S * 0.41;
  const nr = S * 0.082;
  const cr = S * 0.26;

  const nodes = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });

  const nodeFill = light ? 'rgba(255,255,255,0.9)' : '#E86B4A';
  const lineCol = light ? 'rgba(255,255,255,0.55)' : '#E86B4A';
  const centerFill = light ? 'rgba(255,255,255,0.2)' : '#FDECE8';
  const centerBord = light ? 'rgba(255,255,255,0.85)' : '#E86B4A';

  const edges: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      edges.push([i, j]);
    }
  }

  return (
    <svg
      width={S}
      height={S}
      viewBox={`0 0 ${S} ${S}`}
      fill="none"
      style={{ flexShrink: 0 }}
      aria-hidden
    >
      {edges.map(([i, j]) => (
        <line
          key={`e${i}-${j}`}
          x1={nodes[i].x}
          y1={nodes[i].y}
          x2={nodes[j].x}
          y2={nodes[j].y}
          stroke={lineCol}
          strokeWidth={S * 0.022}
          opacity={0.55}
        />
      ))}
      {nodes.map((nd, i) => (
        <line
          key={`c${i}`}
          x1={nd.x}
          y1={nd.y}
          x2={cx}
          y2={cy}
          stroke={lineCol}
          strokeWidth={S * 0.022}
          opacity={0.55}
        />
      ))}
      <circle
        cx={cx}
        cy={cy}
        r={cr}
        fill={centerFill}
        stroke={centerBord}
        strokeWidth={S * 0.03}
      />
      {nodes.map((nd, i) => (
        <circle key={i} cx={nd.x} cy={nd.y} r={nr} fill={nodeFill} />
      ))}
    </svg>
  );
}

export function TaulamicLogo({
  compact = false,
  light = false,
  vertical = false,
  iconSize,
}: {
  compact?: boolean;
  light?: boolean;
  vertical?: boolean;
  iconSize?: number;
}) {
  const textCol = light ? '#FFFFFF' : '#E86B4A';

  if (vertical) {
    const S = iconSize ?? 72;
    const fs = S < 40 ? 13 : S < 52 ? 16 : 22;
    const gap = S < 40 ? 6 : S < 52 ? 8 : 10;
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap,
        }}
      >
        <LogoIcon size={S} light={light} />
        <span
          style={{
            color: textCol,
            fontWeight: 700,
            fontSize: fs,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          taulamic
        </span>
      </div>
    );
  }

  const S = compact ? 28 : 40;
  const fs = compact ? 15 : 20;
  const gap = compact ? 8 : 10;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap,
      }}
    >
      <LogoIcon size={S} light={light} />
      <span
        style={{
          color: textCol,
          fontWeight: 700,
          fontSize: fs,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        taulamic
      </span>
    </div>
  );
}
