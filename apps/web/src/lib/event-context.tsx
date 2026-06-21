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

const STORAGE_KEY = 'taulamic:eventId';

type EventContextValue = {
  eventId: string | null;
  event: EventDetail | null;
  loading: boolean;
  error: string | null;
  setEventId: (id: string) => void;
  syncEventIdFromUrl: (id: string) => void;
  refreshEvent: () => Promise<void>;
  createEvent: (name: string) => Promise<EventDetail>;
};

const EventContext = createContext<EventContextValue | null>(null);

export function EventProvider({ children }: { children: ReactNode }) {
  const [eventId, setEventIdState] = useState<string | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshEvent = useCallback(async () => {
    if (!eventId) {
      setEvent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const detail = await eventsApi.get(eventId);
      setEvent(detail);
    } catch {
      setError('No se pudo cargar el evento.');
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setEventIdState(stored);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshEvent();
  }, [refreshEvent]);

  const setEventId = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setEventIdState(id);
  }, []);

  const syncEventIdFromUrl = useCallback(
    (id: string) => {
      if (id !== eventId) {
        localStorage.setItem(STORAGE_KEY, id);
        setEventIdState(id);
      }
    },
    [eventId],
  );

  const createEvent = useCallback(
    async (name: string) => {
      const created = await eventsApi.create(name);
      setEventId(created.id);
      setEvent(created);
      return created;
    },
    [setEventId],
  );

  const value = useMemo(
    () => ({
      eventId,
      event,
      loading,
      error,
      setEventId,
      syncEventIdFromUrl,
      refreshEvent,
      createEvent,
    }),
    [
      eventId,
      event,
      loading,
      error,
      setEventId,
      syncEventIdFromUrl,
      refreshEvent,
      createEvent,
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
