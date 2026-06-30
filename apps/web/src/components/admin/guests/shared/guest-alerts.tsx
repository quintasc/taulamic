'use client';

import { getGuestV2DetailMeta } from '@/lib/guest-v2-detail-meta';

type GuestAlertItem = { icon: string; label: string };

function buildGuestAlertItems(
  eventId: string,
  guestId: string,
): GuestAlertItem[] {
  const detail = getGuestV2DetailMeta(eventId, guestId);
  const items: GuestAlertItem[] = [];
  if (detail.dietaryAlert) {
    items.push({ icon: '🌾', label: 'Menú especial' });
  }
  if (detail.mobilityAlert) {
    items.push({ icon: '♿', label: 'Movilidad reducida' });
  }
  return items;
}

/** Iconos compactos para fila de tabla (desktop). */
export function GuestAlertsIcons({
  eventId,
  guestId,
  refreshToken,
}: {
  eventId: string;
  guestId: string;
  refreshToken: number;
}) {
  void refreshToken;
  const items = buildGuestAlertItems(eventId, guestId);
  if (!items.length) {
    return <span className="text-neutral-400">—</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-base">
      {items.map((item) => (
        <span key={item.label} title={item.label} aria-label={item.label}>
          {item.icon}
        </span>
      ))}
    </span>
  );
}

/** Iconos + etiqueta para panel expandible (móvil). */
export function GuestAlertsInline({
  eventId,
  guestId,
  refreshToken,
}: {
  eventId: string;
  guestId: string;
  refreshToken: number;
}) {
  void refreshToken;
  const items = buildGuestAlertItems(eventId, guestId);
  if (!items.length) {
    return <span className="text-neutral-400">Sin alertas</span>;
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1 text-sm text-neutral-700"
        >
          <span aria-hidden>{item.icon}</span>
          {item.label}
        </span>
      ))}
    </span>
  );
}
