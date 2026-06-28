'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  IconFile,
  IconMail,
  IconMoreVertical,
  IconPencil,
  IconRsvpConfirmed,
  IconRsvpDeclined,
  IconRsvpPending,
  IconTrash,
  IconUserPlus,
} from '@/components/icons';
import type { GuestDrawerSubmit } from '@/components/admin/guests/guest-form.types';
import type { GuestView } from '@/lib/api';
import { getGuestV2DetailMeta } from '@/lib/guest-v2-detail-meta';
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
import { GuestDrawerV2 } from './guest-drawer-v2';
import { GuestsBulkBarV2 } from './guests-bulk-bar-v2';

type FilterChip =
  | 'all'
  | 'pending-rsvp'
  | 'confirmed'
  | 'declined'
  | 'dietary'
  | 'mobility'
  | 'no-category';

const POST_PILOT_ROW_ACTIONS = [
  { id: 'send-invite', label: 'Enviar invitación' },
  { id: 'reminder', label: 'Recordatorio RSVP' },
] as const;

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

const ROW_MENU_EST_HEIGHT = 220;

type RowMenuState = {
  guest: GuestView;
  left: number;
  top: number;
  bottom: number;
  openUp: boolean;
  trigger: HTMLElement;
};

function useDismissRowMenu(
  menuRef: React.RefObject<HTMLElement | null>,
  rowMenu: RowMenuState | null,
  onClose: () => void,
) {
  useEffect(() => {
    if (!rowMenu) {
      return;
    }
    const activeMenu = rowMenu;
    function handlePointer(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) {
        return;
      }
      if (activeMenu.trigger.contains(target)) {
        return;
      }
      onClose();
    }
    function handleScroll() {
      onClose();
    }
    document.addEventListener('mousedown', handlePointer);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [menuRef, onClose, rowMenu]);
}

function RowActionsMenu({
  onEdit,
  onDelete,
  onClose,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div className="min-w-[200px] rounded-lg border border-neutral-200 bg-neutral-0 py-1 shadow-lg">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50"
        onClick={() => {
          onEdit();
          onClose();
        }}
      >
        <IconPencil width={14} height={14} className="text-neutral-500" />
        Editar invitado
      </button>
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error-500 hover:bg-error-500/5"
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        <IconTrash width={14} height={14} />
        Eliminar invitado
      </button>
      <div className="my-1 border-t border-neutral-100" />
      {POST_PILOT_ROW_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled
          title="Próximamente — no operativo en piloto"
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-neutral-400"
        >
          <IconMail width={14} height={14} className="opacity-50" />
          {action.label}
        </button>
      ))}
    </div>
  );
}

function RowActionsMenuPortal({
  rowMenu,
  onEdit,
  onDelete,
  onClose,
}: {
  rowMenu: RowMenuState;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  useDismissRowMenu(menuRef, rowMenu, onClose);

  if (typeof document === 'undefined') {
    return null;
  }

  const style: React.CSSProperties = {
    left: rowMenu.left,
    transform: 'translateX(-100%)',
    ...(rowMenu.openUp
      ? { bottom: window.innerHeight - rowMenu.top + 4 }
      : { top: rowMenu.bottom + 4 }),
  };

  return createPortal(
    <div ref={menuRef} className="fixed z-50" style={style}>
      <RowActionsMenu onEdit={onEdit} onDelete={onDelete} onClose={onClose} />
    </div>,
    document.body,
  );
}

function GuestAlerts({
  eventId,
  guestId,
  refreshToken,
}: {
  eventId: string;
  guestId: string;
  refreshToken: number;
}) {
  const detail = getGuestV2DetailMeta(eventId, guestId);
  void refreshToken;
  const items: { icon: string; label: string }[] = [];
  if (detail.dietaryAlert) {
    items.push({ icon: '🌾', label: 'Menú Especial' });
  }
  if (detail.mobilityAlert) {
    items.push({ icon: '♿', label: 'Movilidad' });
  }
  if (!items.length) {
    return <span className="text-neutral-400">—</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-base">
      {items.map((item) => (
        <span
          key={item.label}
          title={item.label}
          aria-label={item.label}
        >
          {item.icon}
        </span>
      ))}
    </span>
  );
}

export function GuestsPanelV2({
  eventId,
  guests,
  saving,
  onMetaChange,
  onDownloadTemplate,
  onAddGuest,
  onUpdateGuest,
  onDeleteGuest,
}: {
  eventId: string;
  guests: GuestView[];
  saving: boolean;
  onMetaChange: () => void;
  onDownloadTemplate?: () => void;
  onAddGuest: (payload: GuestDrawerSubmit) => void;
  onUpdateGuest: (guestId: string, payload: GuestDrawerSubmit) => void;
  onDeleteGuest: (guestId: string, guestName: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterChip>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [metaVersion, setMetaVersion] = useState(0);
  const [rowMenu, setRowMenu] = useState<RowMenuState | null>(null);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit' | null>(null);
  const [editingGuest, setEditingGuest] = useState<GuestView | null>(null);

  const closeRowMenu = useCallback(() => setRowMenu(null), []);

  function openRowMenu(guest: GuestView, button: HTMLButtonElement) {
    const rect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < ROW_MENU_EST_HEIGHT;
    setRowMenu({
      guest,
      left: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      openUp,
      trigger: button,
    });
  }

  function toggleRowMenu(
    guest: GuestView,
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    const button = event.currentTarget;
    if (rowMenu?.guest.id === guest.id) {
      closeRowMenu();
      return;
    }
    openRowMenu(guest, button);
  }

  const filteredGuests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return guests.filter((guest) => {
      const meta = getGuestPilotMeta(eventId, guest.id);
      const detail = getGuestV2DetailMeta(eventId, guest.id);
      const status = meta.rsvpStatus ?? 'pending';
      const category = guest.categories[0]?.name ?? '';

      if (filter === 'pending-rsvp' && status !== 'pending') {
        return false;
      }
      if (filter === 'confirmed' && status !== 'confirmed') {
        return false;
      }
      if (filter === 'declined' && status !== 'declined') {
        return false;
      }
      if (filter === 'dietary' && !detail.dietaryAlert) {
        return false;
      }
      if (filter === 'mobility' && !detail.mobilityAlert) {
        return false;
      }
      if (filter === 'no-category' && category) {
        return false;
      }

      if (!query) {
        return true;
      }
      const haystack = [
        guest.nombre,
        guest.correo ?? '',
        guest.telefono ?? '',
        category,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [guests, eventId, search, filter, metaVersion]);

  const allVisibleSelected =
    filteredGuests.length > 0 &&
    filteredGuests.every((g) => selectedIds.has(g.id));

  function bumpMeta() {
    setMetaVersion((v) => v + 1);
    onMetaChange();
  }

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredGuests.forEach((g) => next.delete(g.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredGuests.forEach((g) => next.add(g.id));
        return next;
      });
    }
  }

  function toggleSelect(guestId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(guestId)) {
        next.delete(guestId);
      } else {
        next.add(guestId);
      }
      return next;
    });
  }

  function handleRsvpClick(guestId: string) {
    const meta = getGuestPilotMeta(eventId, guestId);
    if (!meta.invitationSent) {
      return;
    }
    const next = cycleGuestRsvpStatus(meta.rsvpStatus ?? 'pending');
    updateGuestPilotMeta(eventId, guestId, { rsvpStatus: next });
    bumpMeta();
  }

  function toggleInvitationSent(guestId: string) {
    const meta = getGuestPilotMeta(eventId, guestId);
    updateGuestPilotMeta(eventId, guestId, {
      invitationSent: !meta.invitationSent,
      rsvpStatus: meta.invitationSent ? 'pending' : meta.rsvpStatus,
    });
    bumpMeta();
  }

  function openAddDrawer() {
    setEditingGuest(null);
    setDrawerMode('add');
  }

  function openEditDrawer(guest: GuestView) {
    setEditingGuest(guest);
    setDrawerMode('edit');
  }

  function closeDrawer() {
    setDrawerMode(null);
    setEditingGuest(null);
  }

  function handleDrawerSubmit(payload: GuestDrawerSubmit) {
    if (drawerMode === 'add') {
      onAddGuest(payload);
      closeDrawer();
      return;
    }
    if (drawerMode === 'edit' && editingGuest) {
      onUpdateGuest(editingGuest.id, payload);
      bumpMeta();
      closeDrawer();
    }
  }

  const filterChips: { id: FilterChip; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'confirmed', label: 'Confirmados' },
    { id: 'pending-rsvp', label: 'Pendientes de confirmar' },
    { id: 'declined', label: 'Invitación rechazada' },
    { id: 'dietary', label: 'Menú especial' },
    { id: 'mobility', label: 'Movilidad reducida' },
    { id: 'no-category', label: 'Sin categoría' },
  ];

  const visibleSelectedCount = filteredGuests.filter((g) =>
    selectedIds.has(g.id),
  ).length;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn-primary inline-flex items-center gap-2"
            onClick={openAddDrawer}
          >
            <IconUserPlus width={16} height={16} />
            Añadir invitado
          </button>
          {onDownloadTemplate ? (
            <button
              type="button"
              className="btn-secondary inline-flex items-center gap-2"
              onClick={onDownloadTemplate}
            >
              <IconFile width={16} height={16} />
              Descargar plantilla
            </button>
          ) : null}
        </div>
        <div className="w-full max-w-xs sm:w-auto sm:min-w-[220px]">
          <input
            type="search"
            className="input-field"
            placeholder="Buscar nombre, correo o teléfono…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar invitados"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filterChips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              filter === chip.id
                ? 'border-primary-500 bg-primary-500/10 text-primary-700'
                : 'border-neutral-200 bg-neutral-0 text-neutral-600 hover:border-neutral-300'
            }`}
            onClick={() => setFilter(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-neutral-600">
        Mostrando{' '}
        <span className="font-medium text-neutral-900">
          {filteredGuests.length}
        </span>{' '}
        de {guests.length} invitado{guests.length === 1 ? '' : 's'}
        {filter !== 'all' ? ' (filtro activo)' : ''}
        {visibleSelectedCount > 0 ? (
          <>
            {' · '}
            <span className="font-medium text-neutral-900">
              {visibleSelectedCount}
            </span>{' '}
            seleccionado{visibleSelectedCount === 1 ? '' : 's'}
            {visibleSelectedCount !== selectedIds.size
              ? ` (${selectedIds.size} en total)`
              : ''}
          </>
        ) : null}
      </p>

      <div className="card-admin overflow-x-auto pb-2">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              <th className="w-10 pb-3 pr-2">
                <input
                  type="checkbox"
                  aria-label="Seleccionar todos los visibles"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="pb-3 pr-3 w-12">RSVP</th>
              <th className="pb-3 pr-4">Nombre</th>
              <th className="pb-3 pr-4">Correo</th>
              <th className="pb-3 pr-4">Teléfono</th>
              <th className="pb-3 pr-4">Categoría</th>
              <th className="pb-3 pr-4">Alertas</th>
              <th className="pb-3 pr-3">Invitación</th>
              <th className="pb-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map((guest) => {
              const meta = getGuestPilotMeta(eventId, guest.id);
              const status = meta.rsvpStatus ?? 'pending';
              const category = guest.categories[0]?.name;
              const rowKey = `${guest.id}-${metaVersion}`;
              const rsvpTitle = meta.invitationSent
                ? `${RSVP_STATUS_LABEL[status]} — clic para cambiar (piloto)`
                : 'Activa «Enviada» para registrar RSVP';

              return (
                <tr
                  key={rowKey}
                  className="border-b border-neutral-100 hover:bg-neutral-50/80"
                >
                  <td className="py-3 pr-2">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar ${guest.nombre}`}
                      checked={selectedIds.has(guest.id)}
                      onChange={() => toggleSelect(guest.id)}
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <button
                      type="button"
                      className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg transition ${
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
                  <td className="py-3 pr-4 text-neutral-700">
                    {guest.correo ?? '—'}
                  </td>
                  <td className="py-3 pr-4 text-neutral-700">
                    {guest.telefono ?? '—'}
                  </td>
                  <td className="py-3 pr-4 text-neutral-800">
                    {category ?? (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <GuestAlerts
                      eventId={eventId}
                      guestId={guest.id}
                      refreshToken={metaVersion}
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <button
                      type="button"
                      className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-medium transition ${invitationSentBadgeClass(meta.invitationSent ?? false)}`}
                      onClick={() => toggleInvitationSent(guest.id)}
                    >
                      {meta.invitationSent ? 'Enviada' : 'Pendiente'}
                    </button>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
                      aria-label={`Más acciones sobre ${guest.nombre}`}
                      aria-expanded={rowMenu?.guest.id === guest.id}
                      onClick={(event) => toggleRowMenu(guest, event)}
                    >
                      <IconMoreVertical width={16} height={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!filteredGuests.length ? (
          <p className="py-8 text-center text-sm text-neutral-500">
            Ningún invitado coincide con la búsqueda o el filtro.
          </p>
        ) : null}
      </div>

      {rowMenu ? (
        <RowActionsMenuPortal
          rowMenu={rowMenu}
          onEdit={() => openEditDrawer(rowMenu.guest)}
          onDelete={() => onDeleteGuest(rowMenu.guest.id, rowMenu.guest.nombre)}
          onClose={closeRowMenu}
        />
      ) : null}

      <GuestsBulkBarV2
        selectedCount={visibleSelectedCount}
        totalSelectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
      />

      <GuestDrawerV2
        eventId={eventId}
        mode={drawerMode === 'edit' ? 'edit' : 'add'}
        guest={editingGuest}
        saving={saving}
        open={drawerMode !== null}
        onClose={closeDrawer}
        onSubmit={handleDrawerSubmit}
      />
    </>
  );
}
