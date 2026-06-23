'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { eventsApi, type EventDetail } from '@/lib/api';

/** Clave legacy; el MVP no restaura eventos entre sesiones. */
const LEGACY_STORAGE_KEY = 'taulamic:eventId';
const SESSION_EVENT_KEY = 'taulamic:sessionEventId';

function readSessionEventId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(SESSION_EVENT_KEY);
}

function writeSessionEventId(id: string) {
  sessionStorage.setItem(SESSION_EVENT_KEY, id);
}

function clearSessionEventId() {
  sessionStorage.removeItem(SESSION_EVENT_KEY);
}

type EventContextValue = {
  eventId: string | null;
  event: EventDetail | null;
  loading: boolean;
  error: string | null;
  syncEventIdFromUrl: (id: string) => void;
  refreshEvent: (options?: { silent?: boolean }) => Promise<void>;
  createEvent: (name: string) => Promise<EventDetail>;
  clearEvent: () => void;
};

const EventContext = createContext<EventContextValue | null>(null);

export function EventProvider({ children }: { children: ReactNode }) {
  const [eventId, setEventIdState] = useState<string | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, []);

  const refreshEvent = useCallback(async (options?: { silent?: boolean }) => {
    if (!eventId) {
      setEvent(null);
      setLoading(false);
      return;
    }

    if (!options?.silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const detail = await eventsApi.get(eventId);
      setEvent(detail);
    } catch {
      setError('No se pudo cargar el evento.');
      setEvent(null);
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, [eventId]);

  useEffect(() => {
    void refreshEvent();
  }, [refreshEvent]);

  const syncEventIdFromUrl = useCallback((id: string) => {
    const sessionId = readSessionEventId();
    if (sessionId !== id) {
      setEventIdState(null);
      setEvent(null);
      setError('No se pudo cargar el evento.');
      setLoading(false);
      return;
    }
    setEventIdState(id);
  }, []);

  const clearEvent = useCallback(() => {
    clearSessionEventId();
    setEventIdState(null);
    setEvent(null);
    setError(null);
    setLoading(false);
  }, []);

  const createEvent = useCallback(async (name: string) => {
    const created = await eventsApi.create(name);
    writeSessionEventId(created.id);
    setEventIdState(created.id);
    setEvent(created);
    setError(null);
    setLoading(false);
    return created;
  }, []);

  const value = useMemo(
    () => ({
      eventId,
      event,
      loading,
      error,
      syncEventIdFromUrl,
      refreshEvent,
      createEvent,
      clearEvent,
    }),
    [
      eventId,
      event,
      loading,
      error,
      syncEventIdFromUrl,
      refreshEvent,
      createEvent,
      clearEvent,
    ],
  );

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
}

export function useEvent() {
  const ctx = useContext(EventContext);
  if (!ctx) {
    throw new Error('useEvent debe usarse dentro de EventProvider');
  }
  return ctx;
}
