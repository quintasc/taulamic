import type { ReactNode } from 'react';
import Image from 'next/image';
import { brandConfig } from '@/theme';

const T = {
  c50: '#FDECE8',
  c400: '#E86B4A',
  n900: '#1A1A1A',
  n700: '#4A4A4A',
  n400: '#8A8A8A',
  n200: '#E8E8E8',
  n100: '#F5F5F5',
  n000: '#FFFFFF',
  blue: '#3B82F6',
  amber: '#E5A100',
};

export function IlluBoda() {
  return (
    <Image
      src={brandConfig.assets.iconBodasPng}
      alt="Bodas y celebraciones"
      width={110}
      height={110}
      style={{ width: 110, height: 'auto', display: 'block' }}
    />
  );
}

export function IlluAula() {
  return (
    <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden>
      <polygon points="60,12 100,36 60,60 20,36" fill={T.n900} opacity=".07" />
      <polygon
        points="60,12 100,36 60,60 20,36"
        stroke={T.n700}
        strokeWidth="1.8"
        fill="none"
        opacity=".35"
      />
      <rect x="97" y="36" width="3" height="20" fill={T.n700} opacity=".35" />
      <circle cx="100" cy="61" r="5" fill={T.c400} />
      <rect x="22" y="72" width="76" height="7" rx="3.5" fill={T.c50} />
      <rect x="22" y="84" width="52" height="4" rx="2" fill={T.n200} />
    </svg>
  );
}

export function IlluEmpresa() {
  return (
    <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden>
      <rect
        x="30"
        y="28"
        width="60"
        height="58"
        rx="4"
        fill={T.n100}
        stroke={T.n200}
        strokeWidth="1.5"
      />
      <polygon points="24,30 60,8 96,30" fill={T.c400} opacity=".15" />
      {(
        [
          [42, 40],
          [66, 40],
          [42, 58],
          [66, 58],
        ] as const
      ).map(([x, y], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="13"
          height="12"
          rx="2.5"
          fill={i < 2 ? T.c50 : T.n200}
        />
      ))}
    </svg>
  );
}

function Persona({
  x,
  y,
  dx,
  dy,
  hc,
  bc,
}: {
  x: number;
  y: number;
  dx: number;
  dy: number;
  hc: string;
  bc: string;
}) {
  const norm = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = dx / norm;
  const ny = dy / norm;
  const bx = x + nx * 6;
  const by = y + ny * 6;
  return (
    <g>
      <ellipse cx={bx} cy={by} rx={7} ry={6} fill={bc} opacity={0.9} />
      <circle cx={x} cy={y} r={5} fill={hc} />
    </g>
  );
}

const SKIN = [
  '#F4C5A0',
  '#E8A97E',
  '#C17B4E',
  '#F4C5A0',
  '#E8A97E',
  '#C17B4E',
  '#D4956A',
  '#F4C5A0',
];
const CLOTH = [
  T.c400,
  '#7B7FC4',
  T.n700,
  '#4A8A6F',
  T.blue,
  T.amber,
  '#C46B8A',
  T.n700,
];

export function SceneBoda() {
  const cx = 140;
  const cy = 74;
  const tR = 38;
  const sR = 56;
  return (
    <svg width="280" height="148" viewBox="0 0 280 148" fill="none" aria-hidden>
      <rect width="280" height="148" fill={T.c50} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const px = cx + sR * Math.cos(a);
        const py = cy + sR * Math.sin(a);
        return (
          <Persona
            key={i}
            x={px}
            y={py}
            dx={cx - px}
            dy={cy - py}
            hc={SKIN[i]}
            bc={CLOTH[i]}
          />
        );
      })}
      <circle
        cx={cx}
        cy={cy}
        r={tR}
        fill="white"
        stroke={T.c400}
        strokeWidth={2}
      />
      <circle
        cx={cx}
        cy={cy}
        r={tR - 6}
        fill="none"
        stroke={T.c400}
        strokeWidth={0.8}
        opacity={0.3}
        strokeDasharray="3 3"
      />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle
          key={a}
          cx={cx + 13 * Math.cos((a * Math.PI) / 180)}
          cy={cy + 13 * Math.sin((a * Math.PI) / 180)}
          r={3}
          fill={T.c400}
          opacity={0.45}
        />
      ))}
      <circle cx={cx} cy={cy} r={5} fill={T.c400} opacity={0.5} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const px = cx + (tR - 10) * Math.cos(a);
        const py = cy + (tR - 10) * Math.sin(a);
        return (
          <circle
            key={i}
            cx={px}
            cy={py}
            r={4}
            fill={T.c50}
            stroke={T.c400}
            strokeWidth={0.8}
          />
        );
      })}
    </svg>
  );
}

export function SceneAula() {
  const boardY = 18;
  const deskRows = [
    [{ x: 60 }, { x: 140 }, { x: 220 }],
    [{ x: 60 }, { x: 140 }, { x: 220 }],
  ];
  const rowY = [80, 118];
  const stuSkin = [
    '#F4C5A0',
    '#E8A97E',
    '#C17B4E',
    '#D4956A',
    '#F4C5A0',
    '#E8A97E',
  ];
  const stuCloth = ['#7B7FC4', T.c400, T.n700, '#4A8A6F', T.amber, T.blue];
  return (
    <svg width="280" height="148" viewBox="0 0 280 148" fill="none" aria-hidden>
      <rect width="280" height="148" fill="#EFF6FF" />
      <rect
        x={20}
        y={boardY}
        width={240}
        height={34}
        rx={4}
        fill="white"
        stroke={T.n200}
        strokeWidth={1.5}
      />
      <rect x={28} y={boardY + 7} width={160} height={5} rx={2} fill={T.n200} />
      <rect x={28} y={boardY + 17} width={110} height={4} rx={2} fill={T.n200} />
      <Persona x={240} y={boardY + 17} dx={-1} dy={0} hc="#E8A97E" bc={T.c400} />
      {deskRows.map((row, ri) =>
        row.map(({ x }, ci) => {
          const y = rowY[ri];
          const idx = ri * 3 + ci;
          return (
            <g key={`${ri}-${ci}`}>
              <rect
                x={x - 14}
                y={y - 6}
                width={28}
                height={20}
                rx={3}
                fill="white"
                stroke={T.n200}
                strokeWidth={1.2}
              />
              <Persona
                x={x}
                y={y - 18}
                dx={0}
                dy={1}
                hc={stuSkin[idx]}
                bc={stuCloth[idx]}
              />
            </g>
          );
        }),
      )}
    </svg>
  );
}

export function SceneEmpresa() {
  const tx = 140;
  const ty = 74;
  const tw = 120;
  const th = 52;
  const leftSide = [{ y: ty - 16 }, { y: ty + 16 }];
  const rightSide = [{ y: ty - 16 }, { y: ty + 16 }];
  const topSide = [{ x: tx - 30 }, { x: tx + 30 }];
  const botSide = [{ x: tx - 30 }, { x: tx + 30 }];
  const skinA = [
    '#F4C5A0',
    '#C17B4E',
    '#E8A97E',
    '#D4956A',
    '#F4C5A0',
    '#C17B4E',
    '#E8A97E',
    '#D4956A',
    '#F4C5A0',
  ];
  const clothA = [
    '#7B7FC4',
    T.n700,
    T.c400,
    '#4A8A6F',
    T.blue,
    T.amber,
    '#C46B8A',
    T.n700,
    T.c400,
  ];
  let pi = 0;
  return (
    <svg width="280" height="148" viewBox="0 0 280 148" fill="none" aria-hidden>
      <rect width="280" height="148" fill="#F5F0FF" />
      {leftSide.map(({ y }, i) => (
        <Persona
          key={`l${i}`}
          x={tx - tw / 2 - 16}
          y={y}
          dx={1}
          dy={0}
          hc={skinA[pi]}
          bc={clothA[pi++]}
        />
      ))}
      {rightSide.map(({ y }, i) => (
        <Persona
          key={`r${i}`}
          x={tx + tw / 2 + 16}
          y={y}
          dx={-1}
          dy={0}
          hc={skinA[pi]}
          bc={clothA[pi++]}
        />
      ))}
      {topSide.map(({ x }, i) => (
        <Persona
          key={`t${i}`}
          x={x}
          y={ty - th / 2 - 16}
          dx={0}
          dy={1}
          hc={skinA[pi]}
          bc={clothA[pi++]}
        />
      ))}
      {botSide.map(({ x }, i) => (
        <Persona
          key={`b${i}`}
          x={x}
          y={ty + th / 2 + 16}
          dx={0}
          dy={-1}
          hc={skinA[pi]}
          bc={clothA[pi++]}
        />
      ))}
      <rect
        x={20}
        y={ty - 12}
        width={16}
        height={24}
        rx={2}
        fill={T.n700}
        opacity={0.15}
      />
      <rect
        x={22}
        y={ty - 9}
        width={12}
        height={18}
        rx={1}
        fill={T.c400}
        opacity={0.35}
      />
      <rect
        x={tx - tw / 2}
        y={ty - th / 2}
        width={tw}
        height={th}
        rx={8}
        fill="white"
        stroke={T.n200}
        strokeWidth={2}
      />
      {(
        [
          { x: tx - 30, y: ty - 14 },
          { x: tx + 20, y: ty + 8 },
          { x: tx - 10, y: ty + 12 },
          { x: tx + 30, y: ty - 10 },
        ] as const
      ).map(({ x, y }, i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill={T.n200} opacity={0.7} />
      ))}
    </svg>
  );
}

export type MarketingCard = {
  title: string;
  desc: string;
  illu: ReactNode;
  scene: ReactNode;
  featured: boolean;
};

export const marketingCards: MarketingCard[] = [
  {
    title: 'BODAS Y CELEBRACIONES',
    desc: 'Organiza la distribución perfecta para el gran día. Sientas a familias y amigos donde estarán más cómodos.',
    illu: <IlluBoda />,
    scene: <SceneBoda />,
    featured: true,
  },
  {
    title: 'AULAS Y FORMACIÓN',
    desc: 'Optimiza la disposición en cursos y talleres para favorecer la colaboración entre participantes.',
    illu: <IlluAula />,
    scene: <SceneAula />,
    featured: false,
  },
  {
    title: 'EVENTOS DE EMPRESA',
    desc: 'Conecta empleados de distintos equipos y favorece la integración en cenas y team buildings.',
    illu: <IlluEmpresa />,
    scene: <SceneEmpresa />,
    featured: false,
  },
];
