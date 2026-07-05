import { useCallback, useEffect, useRef, useState } from 'react';

import { useAutoSaveIndicator } from '@/components/ui';
import { ApiError, eventsApi, preferencesApi } from '@/lib/api';
import {
  configFormInitialName,
  isApiPlaceholderEventName,
  isPastEventDate,
  loadEventUiMeta,
  notifyEventConfigStatusChanged,
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

  const [name, setNameRaw] = useState('');
  const [date, setDate] = useState('');
  const [approximateGuests, setApproximateGuestsRaw] = useState('');
  const [location, setLocationRaw] = useState('');
  const [notes, setNotesRaw] = useState('');
  const [preferenceMode, setPreferenceModeRaw] =
    useState<PreferenceControlMode>(PILOT_PREFERENCE_MODE);
  const [hydrated, setHydrated] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  // Dirty flag: only true after a real user interaction, never during hydration.
  const isDirtyRef = useRef(false);

  const setName = useCallback((v: string) => { isDirtyRef.current = true; setNameRaw(v); }, []);
  const setApproximateGuests = useCallback((v: string) => { isDirtyRef.current = true; setApproximateGuestsRaw(v); }, []);
  const setLocation = useCallback((v: string) => { isDirtyRef.current = true; setLocationRaw(v); }, []);
  const setNotes = useCallback((v: string) => { isDirtyRef.current = true; setNotesRaw(v); }, []);
  const setPreferenceMode = useCallback((v: PreferenceControlMode) => { isDirtyRef.current = true; setPreferenceModeRaw(v); }, []);

  const canAdvance =
    Boolean(name.trim()) && !isApiPlaceholderEventName(name.trim());

  useEffect(() => {
    if (eventId) {
      const meta = loadEventUiMeta(eventId);
      // Use raw setters during hydration to avoid marking dirty.
      setNameRaw(configFormInitialName(event?.name));
      const loadedDate = meta.date ?? '';
      if (loadedDate && isPastEventDate(loadedDate)) {
        setDate('');
        setDateError(null);
      } else {
        setDate(loadedDate);
        setDateError(null);
      }
      setLocationRaw(meta.location ?? '');
      setApproximateGuestsRaw(
        meta.approximateGuestCount ?? meta.tableCount ?? '',
      );
      setNotesRaw(meta.notes ?? '');
      if (meta.preferenceMode) {
        setPreferenceModeRaw(resolvePreferenceModeForPilot(meta.preferenceMode));
      }
      isDirtyRef.current = false;
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
        setPreferenceModeRaw(resolvePreferenceModeForPilot(settings.mode)),
      )
      .catch(() => undefined);
  }, [eventId]);

  const handleDateChange = useCallback((value: string) => {
    isDirtyRef.current = true;
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
      notifyEventConfigStatusChanged(eventId);
      await refreshEvent({ silent: true });
      isDirtyRef.current = false;
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

  // Track validation status via refs so the unmount hook can check them without dependency triggers
  const canAdvanceRef = useRef(canAdvance);
  canAdvanceRef.current = canAdvance;

  const dateErrorRef = useRef(dateError);
  dateErrorRef.current = dateError;

  // 1. Debounce (Background Saving) - Delay auto-save 2 seconds
  useEffect(() => {
    if (!hydrated || !eventId || !canAdvance || dateError) {
      return;
    }
    if (!isDirtyRef.current) {
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
    }, 2000);
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

  // 2. Prevent data loss on browser tab reload/close (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current && canAdvanceRef.current && !dateErrorRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 3. Safety save on navigation (Unmount Interceptor)
  useEffect(() => {
    return () => {
      if (isDirtyRef.current && canAdvanceRef.current && !dateErrorRef.current) {
        void persistConfigRef.current();
      }
    };
  }, []);

  useEffect(() => {
    if (!eventId || !hydrated) {
      return;
    }
    if (canAdvance) {
      return;
    }
    const meta = loadEventUiMeta(eventId);
    if (meta.configSaved) {
      saveMeta(eventId, { ...meta, configSaved: false });
    }
    notifyEventConfigStatusChanged(eventId);
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
