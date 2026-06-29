import { useCallback, useEffect, useRef, useState } from 'react';

import { useAutoSaveIndicator } from '@/components/ui';
import { ApiError, eventsApi, preferencesApi } from '@/lib/api';
import {
  configFormInitialName,
  isApiPlaceholderEventName,
  isPastEventDate,
  loadEventUiMeta,
  saveEventUiMeta,
  type EventUiMeta,
  type PreferenceControlMode,
} from '@/lib/event-ui-meta';
import { useEvent } from '@/lib/event-context';
import {
  PILOT_PREFERENCE_MODE,
  resolvePreferenceModeForPilot,
} from '@/lib/pilot-features';
import { getSetupNav } from '@/lib/setup-flow';

function saveMeta(eventId: string, meta: EventUiMeta) {
  saveEventUiMeta(eventId, meta);
}

export function useEventConfig() {
  const { event, eventId, refreshEvent } = useEvent();
  const setupNav = eventId ? getSetupNav(eventId, 'config') : null;
  const saveIndicator = useAutoSaveIndicator();
  const {
    status: saveStatus,
    markPending,
    markSaving,
    markSaved,
    markIdle,
  } = saveIndicator;

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [approximateGuests, setApproximateGuests] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [preferenceMode, setPreferenceMode] =
    useState<PreferenceControlMode>(PILOT_PREFERENCE_MODE);
  const [hydrated, setHydrated] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const canAdvance =
    Boolean(name.trim()) && !isApiPlaceholderEventName(name.trim());

  useEffect(() => {
    if (eventId) {
      const meta = loadEventUiMeta(eventId);
      setName(configFormInitialName(event?.name));
      const loadedDate = meta.date ?? '';
      if (loadedDate && isPastEventDate(loadedDate)) {
        setDate('');
        setDateError(null);
      } else {
        setDate(loadedDate);
        setDateError(null);
      }
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

  const handleDateChange = useCallback((value: string) => {
    if (!value) {
      setDate('');
      setDateError(null);
      return;
    }
    if (isPastEventDate(value)) {
      setDateError('La fecha del evento no puede ser anterior a hoy.');
      return;
    }
    setDate(value);
    setDateError(null);
  }, []);

  const persistConfig = useCallback(async (): Promise<boolean> => {
    if (!eventId || !name.trim()) {
      return false;
    }
    if (date.trim() && isPastEventDate(date)) {
      setDateError('La fecha del evento no puede ser anterior a hoy.');
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
    if (!hydrated || !eventId || !canAdvance || dateError) {
      return;
    }
    markPending();
    const timer = window.setTimeout(() => {
      markSaving();
      void persistConfigRef.current().then((ok) => {
        if (ok) {
          markSaved();
        } else {
          markIdle();
        }
      });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [
    hydrated,
    eventId,
    canAdvance,
    name,
    date,
    dateError,
    location,
    approximateGuests,
    notes,
    preferenceMode,
    markPending,
    markSaving,
    markSaved,
    markIdle,
  ]);

  useEffect(() => {
    if (!eventId || !hydrated || canAdvance) {
      return;
    }
    const meta = loadEventUiMeta(eventId);
    if (meta.configSaved) {
      saveMeta(eventId, { ...meta, configSaved: false });
    }
  }, [canAdvance, eventId, hydrated]);

  const handleBeforeNext = useCallback(async () => {
    markSaving();
    const ok = await persistConfig();
    if (ok) {
      markSaved();
    } else {
      markIdle();
    }
    return ok;
  }, [markIdle, markSaved, markSaving, persistConfig]);

  return {
    eventId,
    setupNav,
    saveStatus,
    name,
    setName,
    date,
    dateError,
    handleDateChange,
    approximateGuests,
    setApproximateGuests,
    location,
    setLocation,
    notes,
    setNotes,
    preferenceMode,
    setPreferenceMode,
    message,
    canAdvance,
    handleBeforeNext,
  };
}
