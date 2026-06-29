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

export function IconMoreVertical(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </svg>
  );
}

export function IconUserPlus(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6"
      />
    </svg>
  );
}

export function IconMail(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

export function IconRsvpPending(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
      <path strokeLinecap="round" strokeWidth={2} d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconRsvpConfirmed(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12l3 3 5-6" />
    </svg>
  );
}

export function IconRsvpDeclined(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
      <path strokeLinecap="round" strokeWidth={2} d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}

export function IconPencil(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      />
    </svg>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 6h18M8 6V4h8v2m-1 0v14a2 2 0 01-2 2H9a2 2 0 01-2-2V6h10z"
      />
    </svg>
  );
}

export function IconLock(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 11V7a5 5 0 0110 0v4M6 11h12v9H6V11z"
      />
    </svg>
  );
}

const accessoryDefaults: IconProps = {
  ...defaults,
};

/** Mesa presidencial — mesa rectangular con sillas en un lado (referencia PO). */
export function IconAccessoryPresidentialTable(props: IconProps) {
  return (
    <svg {...accessoryDefaults} {...props}>
      <rect x="1.5" y="11" width="21" height="5" rx="0.75" />
      <path d="M4 11a2.75 3 0 0 1 5.5 0M9.5 11a2.75 3 0 0 1 5.5 0M15 11a2.75 3 0 0 1 5.5 0" />
    </svg>
  );
}

/** Pista de baile — marco + nota musical. */
export function IconAccessoryDanceFloor(props: IconProps) {
  return (
    <svg {...accessoryDefaults} {...props}>
      <rect x="4" y="5" width="16" height="14" rx="1.25" />
      <circle cx="11.5" cy="14.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="M13 14.5V8" />
      <path d="M13 8c1.6-.8 2.8-.8 3.8 0" />
    </svg>
  );
}

/** Copa martini (referencia PO). */
export function MartiniGlassIconFine(props: IconProps) {
  return (
    <svg {...accessoryDefaults} {...props}>
      <path d="M4 6l8 9 8-9z" />
      <path d="M12 15v6" />
      <path d="M9.5 21h5" />
      <path d="M7 9.5h10" />
      <path d="M17 4.5l-6.5 7.5" />
      <circle cx="12" cy="9.5" r="1.25" />
    </svg>
  );
}

/** Barra bar — copa martini. */
export const IconAccessoryBar = MartiniGlassIconFine;

/** Puerta — marco, separación central y pomos. */
export function IconAccessoryDoor(props: IconProps) {
  return (
    <svg {...accessoryDefaults} {...props}>
      <rect x="5" y="4" width="14" height="16" rx="1" />
      <path d="M12 4v16" />
      <circle cx="10.25" cy="12" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="13.75" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Escenario — micrófono de cantante (referencia PO). */
export function IconAccessoryStage(props: IconProps) {
  return (
    <svg {...accessoryDefaults} viewBox="0 0 32 32" fill="currentColor" stroke="none" {...props}>
      <path d="M13.66,10.08,2.22,24.38a1,1,0,0,0,.07,1.33l4,4A1,1,0,0,0,7,30a1,1,0,0,0,.62-.22l14.3-11.44Zm1,8.63a1,1,0,0,1-1.42,0,1,1,0,0,1,0-1.42l2-2a1,1,0,0,1,1.42,1.42Z" />
      <path d="M28.31,14.9A8,8,0,0,0,17.1,3.69Z" />
      <path d="M26.9,16.31a8.08,8.08,0,0,1-2.78,1.39l-1.41-1.41-7-7L14.3,7.88A8.08,8.08,0,0,1,15.69,5.1Z" />
    </svg>
  );
}

/** Entrada principal — arco de acceso. */
export function IconAccessoryEntrance(props: IconProps) {
  return (
    <svg {...accessoryDefaults} {...props}>
      <path d="M3.5 20V10c0-3.8 4.2-7.5 8.5-7.5s8.5 3.7 8.5 7.5v10" />
      <path d="M3.5 20h17" />
    </svg>
  );
}

/** Servicio — lavabos (cartel WC). */
export function IconAccessoryRestroom(props: IconProps) {
  return (
    <svg {...accessoryDefaults} {...props}>
      <rect x="4" y="5" width="16" height="14" rx="1.5" />
      <text
        x="12"
        y="14.5"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="700"
        fill="currentColor"
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        WC
      </text>
    </svg>
  );
}

export const floorAccessoryIcons = {
  'mesa-presidencial': IconAccessoryPresidentialTable,
  /** @deprecated alias migrado desde piloto */
  'mesa-novios': IconAccessoryPresidentialTable,
  'pista-baile': IconAccessoryDanceFloor,
  'barra-bar': IconAccessoryBar,
  puerta: IconAccessoryDoor,
  servicio: IconAccessoryRestroom,
  escenario: IconAccessoryStage,
  entrada: IconAccessoryEntrance,
} as const;

export type FloorAccessoryIconId = keyof typeof floorAccessoryIcons;

export const navIcons = {
  dashboard: IconDashboard,
  config: IconSettings,
  floorPlan: IconFloorPlan,
  guests: IconUsers,
  invitations: IconMail,
  preferences: IconHeart,
  tables: IconTable,
  distribution: IconDistribution,
} as const;
