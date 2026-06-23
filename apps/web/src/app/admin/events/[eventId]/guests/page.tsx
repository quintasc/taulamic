'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { IconFile } from '@/components/icons';
import {
  AddGuestForm,
  GuestsListTable,
  GuestsToolbar,
} from '@/components/admin/guests/guests-list-view';
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
import { PILOT_GUESTS_PANEL_V2_PREVIEW_ENABLED } from '@/lib/pilot-features';

export default function GuestsPage() {
  const router = useRouter();
  const params = useParams<{ eventId: string }>();
  const { eventId } = useEvent();
  const routes = adminRoutes(params.eventId);
  const [guests, setGuests] = useState<GuestView[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [savingGuest, setSavingGuest] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [metaVersion, setMetaVersion] = useState(0);

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
      await reloadGuests();
      setSelectedFile(null);
      setMessage(`Importados correctamente.`);
    } catch {
      setMessage('Error al importar el Excel.');
    } finally {
      setImporting(false);
    }
  }

  async function handleAddGuest(input: {
    nombre: string;
    correo: string;
    telefono: string;
    categoryNames?: string[];
  }) {
    if (!eventId) {
      return;
    }
    setAdding(true);
    setMessage(null);
    try {
      await guestsApi.create(eventId, input);
      await reloadGuests();
      setShowAddForm(false);
      setMessage(`Invitado «${input.nombre}» añadido.`);
    } catch {
      setMessage('Error al añadir el invitado. Revisa correo y teléfono.');
    } finally {
      setAdding(false);
    }
  }

  async function handleUpdateGuest(
    guestId: string,
    input: {
      nombre: string;
      correo: string;
      telefono: string;
      categoryNames?: string[];
    },
  ) {
    if (!eventId) {
      return;
    }
    setSavingGuest(true);
    setMessage(null);
    try {
      await guestsApi.update(eventId, guestId, input);
      await reloadGuests();
      setMessage(`Invitado «${input.nombre}» actualizado.`);
    } catch {
      setMessage('Error al actualizar el invitado.');
    } finally {
      setSavingGuest(false);
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

  const showImportFlow = !loading && guests.length === 0;

  return (
    <>
      <PageHeader
        title="Invitados"
        subtitle="Paso 3 del setup: importa la lista o añade invitados de última hora manualmente."
      />

      {message ? (
        <div className="mb-6">
          <Alert variant={message.includes('Error') ? 'error' : 'success'}>
            {message}
          </Alert>
        </div>
      ) : null}

      {PILOT_GUESTS_PANEL_V2_PREVIEW_ENABLED && !loading && guests.length > 0 ? (
        <div className="mb-6">
          <Alert variant="info">
            Hay una{' '}
            <Link
              href={routes.guestsV2Preview}
              className="font-medium text-primary-600 underline"
            >
              vista previa del panel Invitados v2
            </Link>{' '}
            (tabla, drawer y acciones masivas). El flujo piloto actual no cambia.
          </Alert>
        </div>
      ) : null}

      {!loading ? (
        <GuestsToolbar
          showAddForm={showAddForm}
          onAddClick={() => setShowAddForm((open) => !open)}
        />
      ) : null}

      {showAddForm ? (
        <div className="mb-6">
          <AddGuestForm
            saving={adding}
            onCancel={() => setShowAddForm(false)}
            onSubmit={(input) => void handleAddGuest(input)}
          />
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

          <p className="text-sm text-neutral-500">
            ¿Solo un +1? Usa{' '}
            <button
              type="button"
              className="font-medium text-primary-600"
              onClick={() => setShowAddForm(true)}
            >
              Añadir invitado
            </button>{' '}
            arriba.
          </p>
        </div>
      ) : loading ? (
        <p className="text-sm text-neutral-500">Cargando invitados…</p>
      ) : guests.length ? (
        <GuestsListTable
          eventId={eventId!}
          guests={guests}
          refreshToken={metaVersion}
          saving={savingGuest}
          onMetaChange={() => setMetaVersion((v) => v + 1)}
          onUpdateGuest={(guestId, input) => void handleUpdateGuest(guestId, input)}
          onDeleteGuest={(guestId, name) => void handleDeleteGuest(guestId, name)}
        />
      ) : (
        <EmptyState
          title="Sin invitados"
          description="Importa un Excel o añade invitados manualmente."
        />
      )}

      {!showImportFlow && guests.length > 0 ? (
        <div className="mt-6 card-admin max-w-2xl">
          <SectionLabel>Importar más invitados</SectionLabel>
          <div className="mt-4">
            <UploadZone
              title="Subir Excel actualizado"
              hint="Formato .xlsx"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              disabled={importing}
              buttonLabel={selectedFile ? selectedFile.name : 'Seleccionar archivo'}
              onFile={(file) => setSelectedFile(file)}
            />
          </div>
          <button
            type="button"
            className="btn-secondary mt-4"
            disabled={!selectedFile || importing}
            onClick={() => void handleImport()}
          >
            {importing ? 'Importando…' : 'Importar'}
          </button>
        </div>
      ) : null}

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
