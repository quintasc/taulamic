'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SetupNavBar } from '@/components/admin/setup-nav-bar';
import { Alert, PageHeader, PreferenceOption } from '@/components/ui';
import { ApiError, eventsApi, preferencesApi } from '@/lib/api';
import {
  EVENT_NAME_INPUT_PLACEHOLDER,
  configFormInitialName,
  isApiPlaceholderEventName,
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
import { getSetupNav } from '@/lib/setup-flow';

function saveMeta(eventId: string, meta: EventUiMeta) {
  saveEventUiMeta(eventId, meta);
}

export default function EventConfigPage() {
  const { event, eventId, refreshEvent } = useEvent();
  const setupNav = eventId ? getSetupNav(eventId, 'config') : null;
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [approximateGuests, setApproximateGuests] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [preferenceMode, setPreferenceMode] =
    useState<PreferenceControlMode>(PILOT_PREFERENCE_MODE);
  const [hydrated, setHydrated] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canAdvance =
    Boolean(name.trim()) && !isApiPlaceholderEventName(name.trim());

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
      setHydrated(true);
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

  const persistConfig = useCallback(async (): Promise<boolean> => {
    if (!eventId || !name.trim()) {
      return false;
    }
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
      await refreshEvent({ silent: true });
      return true;
    } catch (err: unknown) {
      const detail =
        err instanceof ApiError
          ? err.body.message ?? `Error API ${err.status}`
          : err instanceof Error
            ? err.message
            : null;
      setMessage(
        detail
          ? `No se pudo guardar: ${detail}`
          : 'No se pudo guardar. Comprueba que la API esté en marcha (puerto 3000).',
      );
      return false;
    }
  }, [
    approximateGuests,
    date,
    eventId,
    location,
    name,
    notes,
    preferenceMode,
    refreshEvent,
  ]);

  const persistConfigRef = useRef(persistConfig);
  persistConfigRef.current = persistConfig;

  useEffect(() => {
    if (!hydrated || !eventId || !canAdvance) {
      return;
    }
    const timer = window.setTimeout(() => {
      void persistConfigRef.current();
    }, 500);
    return () => window.clearTimeout(timer);
  }, [
    hydrated,
    eventId,
    canAdvance,
    name,
    date,
    location,
    approximateGuests,
    notes,
    preferenceMode,
  ]);

  return (
    <>
      <PageHeader
        title="Configuración del evento"
        subtitle="Paso 1 del setup: nombre, volumen esperado y modo de captura de afinidades."
      />

      {message ? (
        <div className="mb-6">
          <Alert variant="error">{message}</Alert>
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
          Los cambios se guardan automáticamente al editar. Al pulsar Siguiente
          se guarda de nuevo antes de continuar. El nombre del evento es
          obligatorio. Fecha, lugar, invitados aproximados y notas se guardan en
          este dispositivo (piloto).
        </p>
      </div>

      {eventId ? (
        <SetupNavBar
          hidePrimary
          nextHref={setupNav?.next?.href}
          nextLabel={setupNav?.next?.nextLabel}
          nextReady={canAdvance}
          nextDisabledHint="Indica el nombre del evento para continuar"
          onBeforeNext={() => persistConfig()}
        />
      ) : null}
    </>
  );
}
