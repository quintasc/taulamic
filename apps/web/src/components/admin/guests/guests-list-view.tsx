'use client';

import { useEffect, useRef, useState } from 'react';
import {
  IconMail,
  IconMoreVertical,
  IconPencil,
  IconRsvpConfirmed,
  IconRsvpDeclined,
  IconRsvpPending,
  IconTrash,
  IconUserPlus,
} from '@/components/icons';
import { Alert } from '@/components/ui';
import type { GuestView } from '@/lib/api';
import {
  RSVP_STATUS_LABEL,
  cycleGuestRsvpStatus,
  getGuestPilotMeta,
  updateGuestPilotMeta,
  type GuestRsvpStatus,
} from '@/lib/guest-ui-meta';
import {
  invitationSentBadgeClass,
  rsvpIconClass,
} from '@/lib/semantic-ui';

const POST_PILOT_ACTIONS = [
  { id: 'send-invites', label: 'Enviar invitaciones por correo' },
  { id: 'reminder', label: 'Enviar recordatorio RSVP' },
  { id: 'export', label: 'Exportar lista' },
  { id: 'bulk-category', label: 'Asignar categoría en bloque' },
] as const;

export type GuestFormInput = {
  nombre: string;
  correo: string;
  telefono: string;
  categoryNames?: string[];
};

function RsvpIcon({ status }: { status: GuestRsvpStatus }) {
  const props = {
    width: 18,
    height: 18,
    className: `shrink-0 ${rsvpIconClass(status)}`,
  };
  if (status === 'confirmed') {
    return <IconRsvpConfirmed {...props} />;
  }
  if (status === 'declined') {
    return <IconRsvpDeclined {...props} />;
  }
  return <IconRsvpPending {...props} />;
}

function ActionsMenu({
  align = 'right',
  variant,
  onEdit,
  onDelete,
  onClose,
}: {
  align?: 'left' | 'right';
  variant: 'toolbar' | 'row';
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
}) {
  return (
    <div
      className={`absolute z-20 mt-1 min-w-[220px] rounded-lg border border-neutral-200 bg-neutral-0 py-1 shadow-lg ${
        align === 'right' ? 'right-0' : 'left-0'
      }`}
    >
      {variant === 'row' ? (
        <>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50"
            onClick={() => {
              onEdit?.();
              onClose?.();
            }}
          >
            <IconPencil width={14} height={14} className="text-neutral-500" />
            Editar invitado
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error-500 hover:bg-error-500/5"
            onClick={() => {
              onDelete?.();
              onClose?.();
            }}
          >
            <IconTrash width={14} height={14} />
            Eliminar invitado
          </button>
          <div className="my-1 border-t border-neutral-100" />
        </>
      ) : null}
      {POST_PILOT_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled
          title="Próximamente — no operativo en piloto"
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-400"
          onClick={onClose}
        >
          <IconMail width={14} height={14} className="opacity-50" />
          {action.label}
        </button>
      ))}
      {variant === 'toolbar' ? (
        <p className="border-t border-neutral-100 px-3 py-2 text-[10px] text-neutral-400">
          Acciones masivas — post-MVP
        </p>
      ) : null}
    </div>
  );
}

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onOutside: () => void,
  active: boolean,
) {
  useEffect(() => {
    if (!active) {
      return;
    }
    function handle(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutside();
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [active, onOutside, ref]);
}

export function GuestForm({
  title,
  submitLabel,
  saving,
  initial,
  onCancel,
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  saving: boolean;
  initial?: Partial<GuestFormInput> & { categoria?: string };
  onCancel: () => void;
  onSubmit: (input: GuestFormInput) => void;
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [correo, setCorreo] = useState(initial?.correo ?? '');
  const [telefono, setTelefono] = useState(initial?.telefono ?? '');
  const [categoria, setCategoria] = useState(
    initial?.categoria ?? initial?.categoryNames?.[0] ?? '',
  );

  return (
    <div className="card-admin max-w-lg space-y-4">
      <p className="text-sm font-medium text-neutral-900">{title}</p>
      <div>
        <label className="label-field" htmlFor="guest-nombre">
          Nombre
        </label>
        <input
          id="guest-nombre"
          className="input-field"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>
      <div>
        <label className="label-field" htmlFor="guest-correo">
          Correo
        </label>
        <input
          id="guest-correo"
          type="email"
          className="input-field"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
      </div>
      <div>
        <label className="label-field" htmlFor="guest-telefono">
          Teléfono
        </label>
        <input
          id="guest-telefono"
          className="input-field"
          placeholder="+34600111222"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
      </div>
      <div>
        <label className="label-field" htmlFor="guest-categoria">
          Categoría (opcional)
        </label>
        <input
          id="guest-categoria"
          className="input-field"
          placeholder="Familia novia"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={saving || !nombre.trim() || !correo.trim() || !telefono.trim()}
          onClick={() =>
            onSubmit({
              nombre: nombre.trim(),
              correo: correo.trim(),
              telefono: telefono.trim(),
              categoryNames: categoria.trim()
                ? [categoria.trim()]
                : undefined,
            })
          }
        >
          {saving ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </div>
  );
}

export function AddGuestForm({
  saving,
  onCancel,
  onSubmit,
}: {
  saving: boolean;
  onCancel: () => void;
  onSubmit: (input: GuestFormInput) => void;
}) {
  return (
    <GuestForm
      title="Añadir invitado"
      submitLabel="Añadir"
      saving={saving}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}

export function GuestsToolbar({
  onAddClick,
  showAddForm,
}: {
  onAddClick: () => void;
  showAddForm: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        className="btn-primary inline-flex items-center gap-2"
        onClick={onAddClick}
      >
        <IconUserPlus width={16} height={16} />
        {showAddForm ? 'Ocultar formulario' : 'Añadir invitado'}
      </button>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          className="btn-secondary inline-flex items-center gap-2"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Acciones sobre invitados"
        >
          Acciones
          <IconMoreVertical width={16} height={16} />
        </button>
        {menuOpen ? (
          <ActionsMenu
            variant="toolbar"
            onClose={() => setMenuOpen(false)}
          />
        ) : null}
      </div>
    </div>
  );
}

export function GuestsListTable({
  eventId,
  guests,
  refreshToken,
  saving,
  onMetaChange,
  onUpdateGuest,
  onDeleteGuest,
}: {
  eventId: string;
  guests: GuestView[];
  refreshToken?: number;
  saving?: boolean;
  onMetaChange: () => void;
  onUpdateGuest: (guestId: string, input: GuestFormInput) => void;
  onDeleteGuest: (guestId: string, guestName: string) => void;
}) {
  const [rowMenuId, setRowMenuId] = useState<string | null>(null);
  const [editingGuest, setEditingGuest] = useState<GuestView | null>(null);
  const rowMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(rowMenuRef, () => setRowMenuId(null), rowMenuId !== null);

  function handleRsvpClick(guestId: string) {
    const meta = getGuestPilotMeta(eventId, guestId);
    if (!meta.invitationSent) {
      return;
    }
    const next = cycleGuestRsvpStatus(meta.rsvpStatus ?? 'pending');
    updateGuestPilotMeta(eventId, guestId, { rsvpStatus: next });
    onMetaChange();
  }

  function toggleInvitationSent(guestId: string) {
    const meta = getGuestPilotMeta(eventId, guestId);
    updateGuestPilotMeta(eventId, guestId, {
      invitationSent: !meta.invitationSent,
      rsvpStatus: meta.invitationSent ? 'pending' : meta.rsvpStatus,
    });
    onMetaChange();
  }

  return (
    <div className="card-admin overflow-x-auto">
      {editingGuest ? (
        <div className="mb-4">
          <GuestForm
            title={`Editar — ${editingGuest.nombre}`}
            submitLabel="Guardar cambios"
            saving={Boolean(saving)}
            initial={{
              nombre: editingGuest.nombre,
              correo: editingGuest.correo ?? '',
              telefono: editingGuest.telefono ?? '',
              categoria: editingGuest.categories[0]?.name ?? '',
            }}
            onCancel={() => setEditingGuest(null)}
            onSubmit={(input) => {
              onUpdateGuest(editingGuest.id, input);
              setEditingGuest(null);
            }}
          />
        </div>
      ) : null}

      <Alert variant="info">
        <span className="font-medium">RSVP en piloto:</span> marca «Invitación
        enviada» para activar el icono de asistencia. El organizador puede
        cambiar el estado; el envío real de correos llegará post-MVP.
      </Alert>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
            <th className="pb-3 pr-4">RSVP</th>
            <th className="pb-3 pr-4">Nombre</th>
            <th className="pb-3 pr-4">Correo</th>
            <th className="pb-3 pr-4">Categoría</th>
            <th className="pb-3 pr-2">Invitación</th>
            <th className="pb-3 w-10" />
          </tr>
        </thead>
        <tbody>
          {guests.map((guest) => {
            const meta = getGuestPilotMeta(eventId, guest.id);
            const status = meta.rsvpStatus ?? 'pending';
            const rowKey = `${guest.id}-${refreshToken ?? 0}`;
            const rsvpTitle = meta.invitationSent
              ? `${RSVP_STATUS_LABEL[status]} — clic para cambiar (piloto)`
              : 'Activa «Enviada» para registrar RSVP';

            return (
              <tr key={rowKey} className="border-b border-neutral-100">
                <td className="py-3 pr-4">
                  <button
                    type="button"
                    className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg transition ${
                      meta.invitationSent
                        ? 'hover:bg-neutral-100'
                        : 'cursor-not-allowed opacity-40'
                    }`}
                    title={rsvpTitle}
                    disabled={!meta.invitationSent}
                    onClick={() => handleRsvpClick(guest.id)}
                  >
                    <RsvpIcon status={status} />
                  </button>
                </td>
                <td className="py-3 pr-4 font-medium text-neutral-900">
                  {guest.nombre}
                </td>
                <td className="py-3 pr-4">{guest.correo ?? '—'}</td>
                <td className="py-3 pr-4">
                  {guest.categories[0]?.name ?? '—'}
                </td>
                <td className="py-3 pr-2">
                  <button
                    type="button"
                    className={`inline-flex min-h-9 items-center rounded-full border px-3 py-2 text-xs font-medium transition ${invitationSentBadgeClass(meta.invitationSent ?? false)}`}
                    onClick={() => toggleInvitationSent(guest.id)}
                  >
                    {meta.invitationSent ? 'Enviada' : 'Pendiente'}
                  </button>
                </td>
                <td className="relative py-3">
                  <button
                    type="button"
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
                    aria-label={`Acciones sobre ${guest.nombre}`}
                    onClick={() =>
                      setRowMenuId((id) => (id === guest.id ? null : guest.id))
                    }
                  >
                    <IconMoreVertical width={16} height={16} />
                  </button>
                  {rowMenuId === guest.id ? (
                    <div ref={rowMenuRef}>
                      <ActionsMenu
                        variant="row"
                        align="right"
                        onEdit={() => setEditingGuest(guest)}
                        onDelete={() => onDeleteGuest(guest.id, guest.nombre)}
                        onClose={() => setRowMenuId(null)}
                      />
                    </div>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
