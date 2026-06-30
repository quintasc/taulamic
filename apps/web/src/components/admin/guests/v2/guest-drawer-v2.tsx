'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type {
  GuestDrawerSubmit,
  GuestFormInput,
} from '@/components/admin/guests/guest-form.types';
import {
  getGuestV2DetailMeta,
} from '@/lib/guest-v2-detail-meta';
import type { GuestView } from '@/lib/api';

type DrawerMode = 'add' | 'edit';

export function GuestDrawerV2({
  eventId,
  mode,
  guest,
  saving,
  open,
  onClose,
  onSubmit,
}: {
  eventId: string;
  mode: DrawerMode;
  guest?: GuestView | null;
  saving: boolean;
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: GuestDrawerSubmit) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [categoria, setCategoria] = useState('');
  const [dietaryAlert, setDietaryAlert] = useState(false);
  const [mobilityAlert, setMobilityAlert] = useState(false);
  const [notes, setNotes] = useState('');
  const [companionGroup, setCompanionGroup] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }
    if (mode === 'edit' && guest) {
      const detail = getGuestV2DetailMeta(eventId, guest.id);
      setNombre(guest.nombre);
      setCorreo(guest.correo ?? '');
      setTelefono(guest.telefono ?? '');
      setCategoria(guest.categories[0]?.name ?? '');
      setDietaryAlert(Boolean(detail.dietaryAlert));
      setMobilityAlert(Boolean(detail.mobilityAlert));
      setNotes(detail.notes ?? guest.observaciones ?? '');
      setCompanionGroup(detail.companionGroup ?? '');
    } else {
      setNombre('');
      setCorreo('');
      setTelefono('');
      setCategoria('');
      setDietaryAlert(false);
      setMobilityAlert(false);
      setNotes('');
      setCompanionGroup('');
    }
  }, [open, mode, guest, eventId]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[100] bg-neutral-900/30"
        aria-label="Cerrar panel"
        onClick={onClose}
      />
      <aside
        className="fixed top-0 right-0 bottom-[var(--admin-setup-bar-offset)] z-[101] flex w-full max-w-sm flex-col border-l border-neutral-200 bg-neutral-0 shadow-xl lg:max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-drawer-title"
      >
        <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 id="guest-drawer-title" className="text-lg font-semibold text-neutral-900">
            {mode === 'add' ? 'Añadir invitado' : `Editar — ${guest?.nombre ?? ''}`}
          </h2>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm text-neutral-500 hover:bg-neutral-100"
            onClick={onClose}
          >
            Cerrar
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="label-field" htmlFor="v2-nombre">
              Nombre
            </label>
            <input
              id="v2-nombre"
              className="input-field"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div>
            <label className="label-field" htmlFor="v2-correo">
              Correo
            </label>
            <input
              id="v2-correo"
              type="email"
              className="input-field"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          <div>
            <label className="label-field" htmlFor="v2-telefono">
              Teléfono
            </label>
            <input
              id="v2-telefono"
              className="input-field"
              placeholder="+34600111222"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div>
            <label className="label-field" htmlFor="v2-categoria">
              Categoría (opcional)
            </label>
            <input
              id="v2-categoria"
              className="input-field"
              placeholder="Familia novia"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
          </div>

          <fieldset className="space-y-2 rounded-xl border border-neutral-200 p-4">
            <legend className="px-1 text-xs font-medium uppercase text-neutral-500">
              Alertas logísticas (vista previa)
            </legend>
            <label className="flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={dietaryAlert}
                onChange={(e) => setDietaryAlert(e.target.checked)}
              />
              <span aria-hidden>🌾</span> Menú especial / intolerancias
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={mobilityAlert}
                onChange={(e) => setMobilityAlert(e.target.checked)}
              />
              <span aria-hidden>♿</span> Movilidad reducida
            </label>
          </fieldset>

          <div>
            <label className="label-field" htmlFor="v2-companion">
              Grupo / acompañante (post-piloto)
            </label>
            <input
              id="v2-companion"
              className="input-field"
              placeholder="Ej. mesa familiar López"
              value={companionGroup}
              onChange={(e) => setCompanionGroup(e.target.value)}
            />
          </div>
          <div>
            <label className="label-field" htmlFor="v2-notes">
              Notas internas
            </label>
            <textarea
              id="v2-notes"
              className="input-field min-h-[88px] resize-y"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-neutral-200 bg-neutral-0 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={saving || !nombre.trim() || !correo.trim() || !telefono.trim()}
            onClick={() => {
              const input: GuestFormInput = {
                nombre: nombre.trim(),
                correo: correo.trim(),
                telefono: telefono.trim(),
                categoryNames: categoria.trim() ? [categoria.trim()] : undefined,
              };
              onSubmit({
                input,
                detailMeta: {
                  dietaryAlert,
                  mobilityAlert,
                  notes: notes.trim() || undefined,
                  companionGroup: companionGroup.trim() || undefined,
                },
              });
            }}
          >
            {saving ? 'Guardando…' : mode === 'add' ? 'Añadir' : 'Guardar'}
          </button>
        </footer>
      </aside>
    </>,
    document.body,
  );
}
