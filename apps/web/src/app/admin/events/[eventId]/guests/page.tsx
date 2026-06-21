'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, EmptyState, PageHeader } from '@/components/ui';
import {
  guestsApi,
  type GuestView,
  type ImportValidation,
} from '@/lib/api';
import { useEvent } from '@/lib/event-context';
import { adminRoutes } from '@/lib/routes';

export default function GuestsPage() {
  const router = useRouter();
  const params = useParams<{ eventId: string }>();
  const { eventId } = useEvent();
  const routes = adminRoutes(params.eventId);
  const [guests, setGuests] = useState<GuestView[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      return;
    }
    void guestsApi
      .list(eventId)
      .then((response) => setGuests(response.guests))
      .catch(() => setGuests([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  async function downloadTemplate() {
    if (!eventId) {
      return;
    }
    const blob = await guestsApi.downloadTemplate(eventId);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'plantilla-invitados.xlsx';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleFile(file: File) {
    if (!eventId) {
      return;
    }
    setImporting(true);
    setMessage(null);
    try {
      const validation: ImportValidation = await guestsApi.validate(eventId, file);
      if (!validation.valid) {
        sessionStorage.setItem(
          'taulamic:importErrors',
          JSON.stringify(validation),
        );
        sessionStorage.setItem('taulamic:importFileName', file.name);
        router.push(routes.guestErrors);
        return;
      }
      await guestsApi.import(eventId, file);
      const list = await guestsApi.list(eventId);
      setGuests(list.guests);
      setMessage(`Importados ${list.total} invitados correctamente.`);
    } catch {
      setMessage('Error al importar el Excel.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Importar invitados"
        subtitle="Descarga la plantilla, complétala e impórtala al evento."
        action={
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => void downloadTemplate()}
            >
              Descargar plantilla
            </button>
            <label className="btn-primary cursor-pointer">
              {importing ? 'Importando…' : 'Importar Excel'}
              <input
                type="file"
                accept=".xlsx"
                className="hidden"
                disabled={importing}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleFile(file);
                  }
                }}
              />
            </label>
          </div>
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
        <div className="card-admin overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                <th className="pb-3 pr-4">Nombre</th>
                <th className="pb-3 pr-4">Correo</th>
                <th className="pb-3">Categoría</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="border-b border-neutral-100">
                  <td className="py-3 pr-4">{guest.nombre}</td>
                  <td className="py-3 pr-4">{guest.correo ?? '—'}</td>
                  <td className="py-3">
                    {guest.categories[0]?.name ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="Sin invitados"
          description="Importa un Excel para añadir invitados al evento."
          action={
            <label className="btn-primary cursor-pointer">
              Importar Excel
              <input
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleFile(file);
                  }
                }}
              />
            </label>
          }
        />
      )}

      <p className="mt-6 text-xs text-neutral-500">
        También puedes{' '}
        <Link href={routes.guestErrors} className="text-primary-500">
          revisar errores de importación
        </Link>{' '}
        si el Excel tiene filas inválidas.
      </p>
    </>
  );
}
