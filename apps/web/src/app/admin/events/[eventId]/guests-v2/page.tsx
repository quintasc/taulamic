'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { GuestsPanelV2 } from '@/components/admin/guests/v2/guests-panel-v2';
import type { GuestFormInput } from '@/components/admin/guests/guests-list-view';
import { Alert, EmptyState, PageHeader } from '@/components/ui';
import { guestsApi, type GuestView } from '@/lib/api';
import { useEvent } from '@/lib/event-context';
import { PILOT_GUESTS_PANEL_V2_PREVIEW_ENABLED } from '@/lib/pilot-features';
import { adminRoutes } from '@/lib/routes';

export default function GuestsV2PreviewPage() {
  const params = useParams<{ eventId: string }>();
  const { eventId } = useEvent();
  const routes = adminRoutes(params.eventId);
  const [guests, setGuests] = useState<GuestView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reloadGuests = useCallback(async () => {
    if (!eventId) {
      return;
    }
    const list = await guestsApi.list(eventId);
    setGuests(list.guests);
  }, [eventId]);

  useEffect(() => {
    if (!eventId) {
      return;
    }
    void reloadGuests()
      .catch(() => setGuests([]))
      .finally(() => setLoading(false));
  }, [eventId, reloadGuests]);

  if (!PILOT_GUESTS_PANEL_V2_PREVIEW_ENABLED) {
    return (
      <>
        <PageHeader title="Invitados v2" subtitle="Vista previa desactivada." />
        <Alert variant="info">
          La previsualización está desactivada. Activa{' '}
          <code className="text-xs">PILOT_GUESTS_PANEL_V2_PREVIEW_ENABLED</code>{' '}
          en <code className="text-xs">pilot-features.ts</code> o usa{' '}
          <Link href={routes.guests} className="font-medium text-primary-600">
            Invitados piloto
          </Link>
          .
        </Alert>
      </>
    );
  }

  async function handleAddGuest(input: GuestFormInput) {
    if (!eventId) {
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await guestsApi.create(eventId, input);
      await reloadGuests();
      setMessage(`Invitado «${input.nombre}» añadido.`);
    } catch {
      setMessage('Error al añadir el invitado.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateGuest(guestId: string, input: GuestFormInput) {
    if (!eventId) {
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await guestsApi.update(eventId, guestId, input);
      await reloadGuests();
      setMessage(`Invitado «${input.nombre}» actualizado.`);
    } catch {
      setMessage('Error al actualizar el invitado.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteGuest(guestId: string, guestName: string) {
    if (!eventId) {
      return;
    }
    const confirmed = window.confirm(
      `¿Eliminar a «${guestName}» de la lista de invitados?`,
    );
    if (!confirmed) {
      return;
    }
    setMessage(null);
    try {
      await guestsApi.remove(eventId, guestId);
      await reloadGuests();
      setMessage(`Invitado «${guestName}» eliminado.`);
    } catch {
      setMessage('Error al eliminar el invitado.');
    }
  }

  return (
    <>
      <PageHeader
        title="Invitados"
        subtitle="Vista previa del panel tabular v2 (post-piloto). No sustituye el flujo actual."
        action={
          <span className="rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-700">
            Preview v2
          </span>
        }
      />

      {message ? (
        <div className="mb-6">
          <Alert variant={message.includes('Error') ? 'error' : 'success'}>
            {message}
          </Alert>
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando invitados…</p>
      ) : guests.length ? (
        <GuestsPanelV2
          eventId={eventId!}
          guests={guests}
          saving={saving}
          onMetaChange={() => {}}
          onAddGuest={(input) => void handleAddGuest(input)}
          onUpdateGuest={(id, input) => void handleUpdateGuest(id, input)}
          onDeleteGuest={(id, name) => void handleDeleteGuest(id, name)}
        />
      ) : (
        <EmptyState
          title="Sin invitados"
          description="Importa invitados desde la vista piloto y vuelve aquí para probar el panel v2."
          action={
            <Link href={routes.guests} className="btn-primary">
              Ir a Invitados piloto
            </Link>
          }
        />
      )}
    </>
  );
}
