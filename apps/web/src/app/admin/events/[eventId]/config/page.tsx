'use client';

import { useEffect, useState } from 'react';
import { Alert, PageHeader } from '@/components/ui';
import { eventsApi } from '@/lib/api';
import {
  loadEventUiMeta,
  saveEventUiMeta,
  type EventUiMeta,
} from '@/lib/event-ui-meta';
import { useEvent } from '@/lib/event-context';

function saveMeta(eventId: string, meta: EventUiMeta) {
  saveEventUiMeta(eventId, meta);
}

export default function EventConfigPage() {
  const { event, eventId, refreshEvent } = useEvent();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [tableCount, setTableCount] = useState('0');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (event?.name) {
      setName(event.name);
    }
    if (eventId) {
      const meta = loadEventUiMeta(eventId);
      setDate(meta.date ?? '');
      setLocation(meta.location ?? '');
      setTableCount(
        meta.tableCount ??
          String(event?.capacitySummary.tableCount ?? 0),
      );
      setNotes(meta.notes ?? '');
    }
  }, [event?.name, event?.capacitySummary.tableCount, eventId]);

  async function save() {
    if (!eventId || !name.trim()) {
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await eventsApi.update(eventId, name.trim());
      saveMeta(eventId, { date, location, tableCount, notes });
      await refreshEvent();
      setMessage('Evento guardado correctamente.');
    } catch {
      setMessage('Error al guardar el evento.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Configuración del evento"
        subtitle="Define los datos básicos del evento."
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
            <label className="label-field" htmlFor="event-tables">
              Nº de mesas
            </label>
            <input
              id="event-tables"
              type="number"
              min={0}
              className="input-field"
              value={tableCount}
              onChange={(event) => setTableCount(event.target.value)}
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

        <p className="text-xs text-neutral-500">
          Fecha, lugar y notas se guardan en este dispositivo (piloto). Solo el
          nombre persiste en la API.
        </p>

        <div className="flex justify-end border-t border-neutral-200 pt-5">
          <button
            type="button"
            className="btn-primary"
            disabled={saving || !name.trim()}
            onClick={() => void save()}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </>
  );
}
