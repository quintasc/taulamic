'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { SetupNavBar } from '@/components/admin/setup-nav-bar';
import type { GuestFormInput } from '@/components/admin/guests/guest-form.types';
import { GuestsImportSection } from '@/components/admin/guests/guests-import-section';
import { GuestDrawerV2 } from '@/components/admin/guests/v2/guest-drawer-v2';
import { GuestsPanelV2 } from '@/components/admin/guests/v2/guests-panel-v2';
import {
  EmptyState,
  PageHeader,
  useToast,
} from '@/components/ui';
import {
  ApiError,
  guestsApi,
  type GuestView,
  type ImportValidation,
} from '@/lib/api';
import { useEvent } from '@/lib/event-context';
import { getSetupNav } from '@/lib/setup-flow';
import { adminRoutes } from '@/lib/routes';

export default function GuestsPage() {
  const toast = useToast();
  const router = useRouter();
  const params = useParams<{ eventId: string }>();
  const { eventId } = useEvent();
  const routes = adminRoutes(params.eventId);
  const [guests, setGuests] = useState<GuestView[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualDrawerOpen, setManualDrawerOpen] = useState(false);

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
    try {
      const blob = await guestsApi.downloadTemplate(eventId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'plantilla_invitados_taulamic.xlsx';
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Plantilla Excel descargada.');
    } catch {
      toast.error('Error al descargar la plantilla.');
    }
  }

  async function handleImport() {
    if (!eventId || !selectedFile) {
      return;
    }
    setImporting(true);
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
      const result = await guestsApi.import(eventId, selectedFile);
      await reloadGuests();
      setSelectedFile(null);
      const parts = [
        `${result.created} nuevo${result.created === 1 ? '' : 's'}`,
        `${result.updated} actualizado${result.updated === 1 ? '' : 's'}`,
      ];
      let feedback = `Importación completada: ${parts.join(', ')}.`;
      if (result.rejected > 0) {
        feedback += ` ${result.rejected} fila${result.rejected === 1 ? '' : 's'} rechazada${result.rejected === 1 ? '' : 's'}.`;
      }
      toast.success(feedback);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Error al importar el Excel: ${error.message}`);
      } else {
        toast.error('Error al importar el Excel.');
      }
    } finally {
      setImporting(false);
    }
  }

  async function handleAddGuest(input: GuestFormInput) {
    if (!eventId) {
      return;
    }
    setSaving(true);
    try {
      await guestsApi.create(eventId, input);
      await reloadGuests();
      setManualDrawerOpen(false);
      toast.success(`Invitado «${input.nombre}» añadido.`);
    } catch {
      toast.error('Error al añadir el invitado. Revisa correo y teléfono.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateGuest(guestId: string, input: GuestFormInput) {
    if (!eventId) {
      return;
    }
    setSaving(true);
    try {
      await guestsApi.update(eventId, guestId, input);
      await reloadGuests();
      toast.success(`Invitado «${input.nombre}» actualizado.`);
    } catch {
      toast.error('Error al actualizar el invitado.');
    } finally {
      setSaving(false);
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
    try {
      await guestsApi.remove(eventId, guestId);
      await reloadGuests();
      toast.success(`Invitado «${guestName}» eliminado.`);
    } catch {
      toast.error('Error al eliminar el invitado.');
    }
  }

  const showImportFlow = !loading && guests.length === 0;
  const setupNav = eventId ? getSetupNav(eventId, 'guests') : null;

  return (
    <>
      <PageHeader
        title="Invitados"
        subtitle="Paso 2 del setup: importa la lista o gestiona invitados de última hora."
      />

      {showImportFlow ? (
        <>
          <GuestsImportSection
            variant="empty"
            selectedFile={selectedFile}
            importing={importing}
            onSelectFile={setSelectedFile}
            onImport={() => void handleImport()}
            onDownloadTemplate={() => void downloadTemplate()}
            onAddManual={() => setManualDrawerOpen(true)}
          />
          {eventId ? (
            <GuestDrawerV2
              eventId={eventId}
              mode="add"
              saving={saving}
              open={manualDrawerOpen}
              onClose={() => setManualDrawerOpen(false)}
              onSubmit={(input) => void handleAddGuest(input)}
            />
          ) : null}
        </>
      ) : loading ? (
        <p className="text-sm text-neutral-500">Cargando invitados…</p>
      ) : guests.length ? (
        <>
          <GuestsPanelV2
            eventId={eventId!}
            guests={guests}
            saving={saving}
            onMetaChange={() => {}}
            onAddGuest={(input) => void handleAddGuest(input)}
            onUpdateGuest={(id, input) => void handleUpdateGuest(id, input)}
            onDeleteGuest={(id, name) => void handleDeleteGuest(id, name)}
          />
          <GuestsImportSection
            variant="more"
            selectedFile={selectedFile}
            importing={importing}
            onSelectFile={setSelectedFile}
            onImport={() => void handleImport()}
          />
        </>
      ) : (
        <EmptyState
          title="Sin invitados"
          description="Importa un Excel o añade invitados manualmente."
        />
      )}

      <p className="mt-6 text-xs text-neutral-500">
        También puedes{' '}
        <Link href={routes.guestErrors} className="font-medium text-primary-500">
          revisar errores de importación
        </Link>{' '}
        si el Excel tiene filas inválidas.
      </p>

      {eventId ? (
        <SetupNavBar
          hidePrimary
          previousHref={setupNav?.previous?.href}
          previousLabel={setupNav?.previous?.previousLabel}
          nextHref={setupNav?.next?.href}
          nextLabel={setupNav?.next?.nextLabel}
          nextReady={!loading && guests.length > 0}
          nextDisabledHint="Añade al menos un invitado para continuar"
        />
      ) : null}
    </>
  );
}
