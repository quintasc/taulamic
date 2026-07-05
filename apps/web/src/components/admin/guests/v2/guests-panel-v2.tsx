'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  IconFile,
  IconMail,
  IconMoreVertical,
  IconPencil,
  IconTrash,
  IconUserPlus,
} from '@/components/icons';
import { GuestTemplateFileRow } from '@/components/admin/guests/guest-template-file-row';
import { GuestAlertsIcons } from '@/components/admin/guests/shared/guest-alerts';
import { GuestRsvpIcon } from '@/components/admin/guests/shared/guest-rsvp-icon';
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
} from '@/lib/semantic-ui';
import { GuestMobileCard, defaultMobileExpandedIds } from './guest-mobile-card';
import { GuestDrawerV2 } from './guest-drawer-v2';
import { GuestsBulkSelectionToolbar } from './guests-bulk-selection-toolbar';
import {
  GUEST_FILTER_CHIPS,
  type GuestFilterChip,
} from './guests-filter-chips';
import { GuestsFilterDropdown } from './guests-filter-dropdown';
import { SectionLabel } from '@/components/ui';

const POST_PILOT_ROW_ACTIONS = [
  { id: 'send-invite', label: 'Enviar invitación' },
  { id: 'reminder', label: 'Recordatorio RSVP' },
] as const;

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
    function handleScroll(event: Event) {
      const target = event.target;
      if (target instanceof Node && menuRef.current?.contains(target)) {
        return;
      }
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

function RowMoreActionsButton({
  guestName,
  expanded,
  onClick,
}: {
  guestName: string;
  expanded: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
      aria-label={`Más acciones sobre ${guestName}`}
      title="Más acciones"
      aria-expanded={expanded}
      onClick={onClick}
    >
      <IconMoreVertical width={16} height={16} />
    </button>
  );
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
    <div className="max-h-[min(70vh,20rem)] min-w-[200px] overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-0 py-1 shadow-lg">
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

export function GuestsPanelV2({
  eventId,
  guests,
  saving,
  onMetaChange,
  onDownloadTemplate,
  onAddGuest,
  onUpdateGuest,
  onDeleteGuest,
  onBulkDeleteGuest,
  deleteResetToken = 0,
  deleting = false,
}: {
  eventId: string;
  guests: GuestView[];
  saving: boolean;
  onMetaChange: () => void;
  onDownloadTemplate?: () => void;
  onAddGuest: (payload: GuestDrawerSubmit) => void;
  onUpdateGuest: (guestId: string, payload: GuestDrawerSubmit) => void;
  onDeleteGuest: (guestId: string, guestName: string) => void;
  onBulkDeleteGuest: (guestIds: string[]) => void;
  deleteResetToken?: number;
  deleting?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<GuestFilterChip>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [metaVersion, setMetaVersion] = useState(0);
  const [rowMenu, setRowMenu] = useState<RowMenuState | null>(null);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit' | null>(null);
  const [editingGuest, setEditingGuest] = useState<GuestView | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const closeRowMenu = useCallback(() => setRowMenu(null), []);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [deleteResetToken]);

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

  const filteredGuestIdsKey = useMemo(
    () => filteredGuests.map((guest) => guest.id).join(','),
    [filteredGuests],
  );

  useEffect(() => {
    const ids = filteredGuestIdsKey
      ? filteredGuestIdsKey.split(',')
      : [];
    setExpandedIds(defaultMobileExpandedIds(ids));
  }, [filter, search, filteredGuestIdsKey]);

  const allVisibleExpanded =
    filteredGuests.length > 0 &&
    filteredGuests.every((guest) => expandedIds.has(guest.id));

  function toggleGuestExpanded(guestId: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(guestId)) {
        next.delete(guestId);
      } else {
        next.add(guestId);
      }
      return next;
    });
  }

  function expandAllVisible() {
    setExpandedIds(new Set(filteredGuests.map((guest) => guest.id)));
  }

  function collapseAllVisible() {
    setExpandedIds(new Set());
  }

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

  async function handleDrawerSubmit(payload: GuestDrawerSubmit) {
    if (drawerMode === 'add') {
      await onAddGuest(payload);
      return;
    }
    if (drawerMode === 'edit' && editingGuest) {
      await onUpdateGuest(editingGuest.id, payload);
      bumpMeta();
    }
  }

  const filterChips = GUEST_FILTER_CHIPS;

  const visibleSelectedCount = filteredGuests.filter((g) =>
    selectedIds.has(g.id),
  ).length;

  return (
    <>
      {onDownloadTemplate ? (
        <div className="card-admin mb-4 lg:hidden">
          <SectionLabel>Plantilla Excel</SectionLabel>
          <GuestTemplateFileRow
            className="mt-4"
            onDownload={onDownloadTemplate}
          />
        </div>
      ) : null}

      <div className="mb-4 space-y-3 lg:hidden">
        <input
          type="search"
          className="input-field w-full"
          placeholder="Buscar invitados…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar invitados por nombre, correo, teléfono o categoría"
        />
        <div className="flex items-center gap-2">
          <GuestsFilterDropdown value={filter} onChange={setFilter} />
          <button
            type="button"
            className="btn-primary inline-flex h-11 shrink-0 items-center gap-1.5 px-3"
            aria-label="Añadir invitado"
            onClick={openAddDrawer}
          >
            <IconUserPlus width={16} height={16} />
            <span className="sr-only">Añadir invitado</span>
          </button>
        </div>
      </div>

      <div className="mb-4 hidden flex-wrap items-center justify-between gap-3 lg:flex">
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
            placeholder="Buscar invitados…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar invitados por nombre, correo, teléfono o categoría"
          />
        </div>
      </div>

      <div className="mb-4 hidden flex-wrap gap-2 lg:flex">
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

      <GuestsBulkSelectionToolbar
        totalSelectedCount={selectedIds.size}
        visibleSelectedCount={visibleSelectedCount}
        deleting={deleting}
        onClear={() => setSelectedIds(new Set())}
        onDelete={() => onBulkDeleteGuest(Array.from(selectedIds))}
      />

      <p className="mb-4 text-sm text-neutral-600">
        Mostrando{' '}
        <span className="font-medium text-neutral-900">
          {filteredGuests.length}
        </span>{' '}
        de {guests.length} invitado{guests.length === 1 ? '' : 's'}
        {filter !== 'all' ? ' (filtro activo)' : ''}
      </p>

      {filteredGuests.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 lg:hidden">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="guests-select-all-mobile"
              aria-label="Seleccionar todos los visibles"
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
            />
            <label
              htmlFor="guests-select-all-mobile"
              className="text-sm text-neutral-700"
            >
              Seleccionar todos los visibles
            </label>
          </div>
          {filteredGuests.length > 1 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-40"
                disabled={allVisibleExpanded}
                onClick={expandAllVisible}
              >
                Expandir todos
              </button>
              <button
                type="button"
                className="text-xs font-medium text-neutral-600 hover:text-neutral-800 disabled:opacity-40"
                disabled={expandedIds.size === 0}
                onClick={collapseAllVisible}
              >
                Contraer todos
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3 lg:hidden">
        {filteredGuests.map((guest) => (
          <GuestMobileCard
            key={guest.id}
            eventId={eventId}
            guest={guest}
            metaVersion={metaVersion}
            expanded={expandedIds.has(guest.id)}
            selected={selectedIds.has(guest.id)}
            onToggleExpand={() => toggleGuestExpanded(guest.id)}
            onToggleSelect={() => toggleSelect(guest.id)}
            onRsvpClick={() => handleRsvpClick(guest.id)}
            onToggleInvitation={() => toggleInvitationSent(guest.id)}
            onEdit={() => openEditDrawer(guest)}
            onDelete={() => onDeleteGuest(guest.id, guest.nombre)}
          />
        ))}
        {!filteredGuests.length ? (
          <p className="py-8 text-center text-sm text-neutral-500">
            Ningún invitado coincide con la búsqueda o el filtro.
          </p>
        ) : null}
      </div>

      <div className="card-admin hidden overflow-x-auto pb-2 lg:block">
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
                      <GuestRsvpIcon status={status} />
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
                    <GuestAlertsIcons
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
                    <RowMoreActionsButton
                      guestName={guest.nombre}
                      expanded={rowMenu?.guest.id === guest.id}
                      onClick={(event) => toggleRowMenu(guest, event)}
                    />
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
