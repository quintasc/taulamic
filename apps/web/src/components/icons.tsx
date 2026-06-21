import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const defaults: IconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export function IconDashboard(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function IconFloorPlan(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M4 6l6-3 6 3 6-3v14l-6 3-6-3-6 3V6z" />
      <path d="M10 3v14M16 6v14" />
    </svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconHeart(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function IconTable(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <ellipse cx="12" cy="10.5" rx="9" ry="4.5" />
      <path d="M4.5 15v6M19.5 15v6M8 15v6M16 15v6" />
    </svg>
  );
}

export function IconDistribution(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M8 6h8M7.5 7.5 10.5 16.5M16.5 7.5 13.5 16.5" />
    </svg>
  );
}

export function IconUpload(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M12 16V4M12 4l4 4M12 4 8 8" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function IconFile(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h8" />
    </svg>
  );
}

export function IconGraduation(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M22 10 12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
    </svg>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 8h.01M9 12h.01M9 16h.01M15 8h.01M15 12h.01M15 16h.01" />
    </svg>
  );
}

export function IconMap(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M4 6l6-3 6 3 6-3v14l-6 3-6-3-6 3V6z" />
      <path d="M10 3v14M16 6v14" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconRefresh(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconSparkles(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <path d="M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3z" />
      <path d="M5 14l.8 2.4L8 17l-2.2.9L5 20l-.8-2.1L2 17l2.2-.9L5 14z" />
    </svg>
  );
}

export function IconMonitor(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

export function IconSmartphone(props: IconProps) {
  return (
    <svg {...defaults} {...props}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  );
}

export function IconShapeRound({
  active,
  ...props
}: IconProps & { active?: boolean }) {
  const stroke = active ? '#E86B4A' : '#8A8A8A';
  const fill = active ? 'rgba(232,107,74,0.1)' : '#FFFFFF';
  return (
    <svg width={32} height={32} viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="8" fill={fill} stroke={stroke} strokeWidth={2} />
    </svg>
  );
}

export function IconShapeRect({
  active,
  ...props
}: IconProps & { active?: boolean }) {
  const stroke = active ? '#E86B4A' : '#8A8A8A';
  const fill = active ? 'rgba(232,107,74,0.1)' : '#FFFFFF';
  return (
    <svg width={32} height={32} viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="5"
        y="7"
        width="14"
        height="10"
        rx="2"
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
      />
    </svg>
  );
}

export function IconShapeOval({
  active,
  ...props
}: IconProps & { active?: boolean }) {
  const stroke = active ? '#E86B4A' : '#8A8A8A';
  const fill = active ? 'rgba(232,107,74,0.1)' : '#FFFFFF';
  return (
    <svg width={32} height={32} viewBox="0 0 24 24" fill="none" {...props}>
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="6"
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
      />
    </svg>
  );
}

export const navIcons = {
  dashboard: IconDashboard,
  config: IconSettings,
  floorPlan: IconFloorPlan,
  guests: IconUsers,
  preferences: IconHeart,
  tables: IconTable,
  distribution: IconDistribution,
} as const;
