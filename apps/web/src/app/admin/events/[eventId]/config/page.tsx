'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, PageHeader, PreferenceOption } from '@/components/ui';
import { eventsApi, preferencesApi } from '@/lib/api';
import {
  EVENT_NAME_INPUT_PLACEHOLDER,
  configFormInitialName,
  loadEventUiMeta,
  saveEventUiMeta,
  type EventUiMeta,
  type PreferenceControlMode,
} from '@/lib/event-ui-meta';
import { useEvent } from '@/lib/event-context';
import {
  PILOT_COLLABORATIVE_MODE_ENABLED,
  PILOT_PREFERENCE_MODE,
  resolvePreferenceModeForPilot,
} from '@/lib/pilot-features';
import { adminRoutes } from '@/lib/routes';

function saveMeta(eventId: string, meta: EventUiMeta) {
  saveEventUiMeta(eventId, meta);
}

export default function EventConfigPage() {
  const { event, eventId, refreshEvent } = useEvent();
  const routes = eventId ? adminRoutes(eventId) : null;
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [approximateGuests, setApproximateGuests] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [preferenceMode, setPreferenceMode] =
    useState<PreferenceControlMode>(PILOT_PREFERENCE_MODE);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      const meta = loadEventUiMeta(eventId);
      setName(configFormInitialName(event?.name));
      setDate(meta.date ?? '');
      setLocation(meta.location ?? '');
      setApproximateGuests(
        meta.approximateGuestCount ?? meta.tableCount ?? '',
      );
      setNotes(meta.notes ?? '');
      if (meta.preferenceMode) {
        setPreferenceMode(resolvePreferenceModeForPilot(meta.preferenceMode));
      }
    }
  }, [event?.name, eventId]);

  useEffect(() => {
    if (!eventId) {
      return;
    }
    void preferencesApi
      .get(eventId)
      .then((settings) =>
        setPreferenceMode(resolvePreferenceModeForPilot(settings.mode)),
      )
      .catch(() => undefined);
  }, [eventId]);

  async function save() {
    if (!eventId || !name.trim()) {
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const modeToSave = resolvePreferenceModeForPilot(preferenceMode);
      await eventsApi.update(eventId, name.trim());
      await preferencesApi.update(eventId, modeToSave);
      saveMeta(eventId, {
        date,
        location,
        approximateGuestCount: approximateGuests,
        notes,
        preferenceMode: modeToSave,
        configSaved: true,
      });
      await refreshEvent();
      setMessage('Configuración guardada correctamente.');
    } catch {
      setMessage('Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Configuración del evento"
        subtitle="Paso 1 del setup: nombre, volumen esperado y modo de captura de afinidades."
      />

      {message ? (
        <div className="mb-6">
          <Alert variant={message.includes('Error') ? 'error' : 'success'}>
            {message}
          </Alert>
        </div>
      ) : null}

      <div className="card-admin max-w-2xl space-y-5">
        <div>
          <label className="label-field" htmlFor="event-name">
            Nombre del evento
          </label>
          <input
            id="event-name"
            className="input-field"
            value={name}
            placeholder={EVENT_NAME_INPUT_PLACEHOLDER}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-field" htmlFor="event-date">
              Fecha
            </label>
            <input
              id="event-date"
              type="date"
              className="input-field"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div>
            <label className="label-field" htmlFor="event-guests-approx">
              Invitados aproximados
            </label>
            <input
              id="event-guests-approx"
              type="number"
              min={0}
              className="input-field"
              placeholder="Ej. 120"
              value={approximateGuests}
              onChange={(event) => setApproximateGuests(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label-field" htmlFor="event-location">
            Lugar
          </label>
          <input
            id="event-location"
            className="input-field"
            placeholder="Mas Oms, Girona"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </div>

        <div>
          <label className="label-field" htmlFor="event-notes">
            Notas
          </label>
          <textarea
            id="event-notes"
            className="input-field min-h-[100px] resize-y"
            placeholder="Notas adicionales…"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <div className="space-y-3 border-t border-neutral-200 pt-5">
          <p className="text-sm font-medium text-neutral-900">
            Modo de preferencias
          </p>
          <p className="text-xs text-neutral-500">
            Define quién podrá indicar afinidades e incompatibilidades en el
            paso de Afinidades.
            {!PILOT_COLLABORATIVE_MODE_ENABLED ? (
              <span className="mt-1 block text-neutral-600">
                Piloto julio: solo anfitrión exclusivo. El modo colaborativo
                estará disponible post-piloto.
              </span>
            ) : null}
          </p>
          <PreferenceOption
            selected={preferenceMode === 'colaborativo'}
            title="Colaborativo"
            description="Los invitados podrán enviar sus restricciones (cuando el RSVP esté operativo)."
            disabled={!PILOT_COLLABORATIVE_MODE_ENABLED}
            badge={!PILOT_COLLABORATIVE_MODE_ENABLED ? 'Post-piloto' : undefined}
            onSelect={() => setPreferenceMode('colaborativo')}
          />
          <PreferenceOption
            selected={preferenceMode === 'anfitrion_exclusivo'}
            title="Anfitrión exclusivo"
            description="Solo el organizador define afinidades y reglas en Afinidades."
            onSelect={() => setPreferenceMode('anfitrion_exclusivo')}
          />
        </div>

        <p className="text-xs text-neutral-500">
          Fecha, lugar, invitados aproximados y notas se guardan en este
          dispositivo (piloto). Nombre y modo de preferencias persisten en la
          API.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-5">
          {routes ? (
            <Link href={routes.floorPlan} className="btn-secondary">
              Ir al plano
            </Link>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="btn-primary"
            disabled={saving || !name.trim()}
            onClick={() => void save()}
          >
            {saving ? 'Guardando…' : 'Guardar configuración'}
          </button>
        </div>
      </div>
    </>
  );
}
