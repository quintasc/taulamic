'use client';

import {
  IconChevronDown,
  IconMail,
  IconPencil,
  IconTrash,
} from '@/components/icons';
import { GuestAlertsInline } from '@/components/admin/guests/shared/guest-alerts';
import { GuestRsvpIcon } from '@/components/admin/guests/shared/guest-rsvp-icon';
import type { GuestView } from '@/lib/api';
import {
  RSVP_STATUS_LABEL,
  getGuestPilotMeta,
} from '@/lib/guest-ui-meta';
import { invitationSentBadgeClass } from '@/lib/semantic-ui';

export function GuestMobileCard({
  eventId,
  guest,
  metaVersion,
  expanded,
  selected,
  onToggleExpand,
  onToggleSelect,
  onRsvpClick,
  onToggleInvitation,
  onEdit,
  onDelete,
}: {
  eventId: string;
  guest: GuestView;
  metaVersion: number;
  expanded: boolean;
  selected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  onRsvpClick: () => void;
  onToggleInvitation: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = getGuestPilotMeta(eventId, guest.id);
  const status = meta.rsvpStatus ?? 'pending';
  const category = guest.categories[0]?.name;
  const detailsId = `guest-mobile-details-${guest.id}`;
  const rsvpTitle = meta.invitationSent
    ? `${RSVP_STATUS_LABEL[status]} — tocar para cambiar (piloto)`
    : 'Marca la invitación como enviada para registrar RSVP';

  return (
    <article
      aria-label={guest.nombre}
      aria-expanded={expanded}
      className="card-admin overflow-hidden p-0"
    >
      <div className="flex items-center gap-2 p-3">
        <input
          type="checkbox"
          className="shrink-0"
          aria-label={`Seleccionar ${guest.nombre}`}
          checked={selected}
          onChange={onToggleSelect}
        />

        <button
          type="button"
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            meta.invitationSent
              ? 'hover:bg-neutral-100'
              : 'cursor-not-allowed opacity-40'
          }`}
          title={rsvpTitle}
          aria-label={rsvpTitle}
          disabled={!meta.invitationSent}
          onClick={onRsvpClick}
        >
          <GuestRsvpIcon status={status} size={20} />
        </button>

        <button
          type="button"
          className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-neutral-900"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={onToggleExpand}
        >
          {guest.nombre}
        </button>

        <button
          type="button"
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium leading-tight transition ${invitationSentBadgeClass(meta.invitationSent ?? false)}`}
          onClick={onToggleInvitation}
        >
          {meta.invitationSent ? 'Enviada' : 'Pendiente'}
        </button>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100"
          aria-label={
            expanded
              ? `Contraer detalle de ${guest.nombre}`
              : `Expandir detalle de ${guest.nombre}`
          }
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={onToggleExpand}
        >
          <IconChevronDown
            width={18}
            height={18}
            className={`transition ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {expanded ? (
        <div
          id={detailsId}
          className="border-t border-neutral-100 px-3 pb-3 pt-2"
        >
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-neutral-500">Correo</dt>
              <dd className="min-w-0 break-all text-neutral-800">
                {guest.correo ?? '—'}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-neutral-500">Teléfono</dt>
              <dd className="min-w-0 text-neutral-800">
                {guest.telefono ?? '—'}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-neutral-500">Categoría</dt>
              <dd className="min-w-0 text-neutral-800">
                {category ?? (
                  <span className="text-neutral-400">Sin categoría</span>
                )}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-neutral-500">Alertas</dt>
              <dd className="min-w-0">
                <GuestAlertsInline
                  eventId={eventId}
                  guestId={guest.id}
                  refreshToken={metaVersion}
                />
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-neutral-500">Invitación</dt>
              <dd className="min-w-0">
                <button
                  type="button"
                  className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-medium transition ${invitationSentBadgeClass(meta.invitationSent ?? false)}`}
                  onClick={onToggleInvitation}
                >
                  <IconMail
                    width={12}
                    height={12}
                    className="mr-1.5 shrink-0 opacity-80"
                    aria-hidden
                  />
                  {meta.invitationSent
                    ? 'Invitación enviada'
                    : 'Invitación pendiente'}
                </button>
              </dd>
            </div>
          </dl>

          <div className="mt-3 flex items-center justify-end gap-1 border-t border-neutral-100 pt-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-neutral-600 hover:bg-neutral-100 hover:text-primary-600"
              aria-label={`Editar ${guest.nombre}`}
              onClick={onEdit}
            >
              <IconPencil width={18} height={18} />
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-neutral-600 hover:bg-error-500/10 hover:text-error-500"
              aria-label={`Eliminar ${guest.nombre}`}
              onClick={onDelete}
            >
              <IconTrash width={18} height={18} />
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

/** Umbral: listas más largas empiezan contraídas por defecto. */
export const GUEST_MOBILE_COLLAPSE_THRESHOLD = 8;

export function defaultMobileExpandedIds(
  guestIds: string[],
): Set<string> {
  if (guestIds.length <= GUEST_MOBILE_COLLAPSE_THRESHOLD) {
    return new Set(guestIds);
  }
  return new Set();
}
