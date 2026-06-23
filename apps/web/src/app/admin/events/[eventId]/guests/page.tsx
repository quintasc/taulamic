'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconFile } from '@/components/icons';
import {
  Alert,
  EmptyState,
  PageHeader,
  SectionLabel,
  UploadZone,
} from '@/components/ui';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    anchor.download = 'plantilla_invitados_taulamic.xlsx';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    if (!eventId || !selectedFile) {
      return;
    }
    setImporting(true);
    setMessage(null);
    try {
      const validation: ImportValidation = await guestsApi.validate(
        eventId,
        selectedFile,
      );
      if (!validation.valid) {
        sessionStorage.setItem(
          'taulamic:importErrors',
          JSON.stringify(validation),
        );
        sessionStorage.setItem('taulamic:importFileName', selectedFile.name);
        router.push(routes.guestErrors);
        return;
      }
      await guestsApi.import(eventId, selectedFile);
      const list = await guestsApi.list(eventId);
      setGuests(list.guests);
      setSelectedFile(null);
      setMessage(`Importados ${list.total} invitados correctamente.`);
    } catch {
      setMessage('Error al importar el Excel.');
    } finally {
      setImporting(false);
    }
  }

  const showImportFlow = !loading && guests.length === 0;

  return (
    <>
      <PageHeader
        title="Importar invitados"
        subtitle="Descarga la plantilla, rellénala y súbela. El modo colaborativo o anfitrión exclusivo se configura en Preferencias, no en el Excel."
      />

      {message ? (
        <div className="mb-6">
          <Alert variant={message.includes('Error') ? 'error' : 'success'}>
            {message}
          </Alert>
        </div>
      ) : null}

      {showImportFlow ? (
        <div className="max-w-2xl space-y-6">
          <div className="card-admin">
            <SectionLabel>Paso 1 — Descarga la plantilla</SectionLabel>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-100/50 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-0 text-neutral-600">
                  <IconFile width={20} height={20} />
                </span>
                <span className="text-sm font-medium text-neutral-900">
                  plantilla_invitados_taulamic.xlsx
                </span>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => void downloadTemplate()}
              >
                Descargar
              </button>
            </div>
          </div>

          <div className="card-admin">
            <SectionLabel>Paso 2 — Sube tu Excel completado</SectionLabel>
            <div className="mt-4">
              <UploadZone
                title="Haz clic o arrastra el archivo"
                hint="Formato .xlsx"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                disabled={importing}
                buttonLabel={selectedFile ? selectedFile.name : 'Seleccionar archivo'}
                onFile={(file) => setSelectedFile(file)}
              />
            </div>
          </div>

          <button
            type="button"
            className="btn-primary w-full max-w-2xl py-3 disabled:opacity-40"
            disabled={!selectedFile || importing}
            onClick={() => void handleImport()}
          >
            {importing ? 'Importando…' : 'Importar invitados'}
          </button>
        </div>
      ) : loading ? (
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
        />
      )}

      <p className="mt-6 text-xs text-neutral-500">
        También puedes{' '}
        <Link href={routes.guestErrors} className="font-medium text-primary-500">
          revisar errores de importación
        </Link>{' '}
        si el Excel tiene filas inválidas.
      </p>
    </>
  );
}
