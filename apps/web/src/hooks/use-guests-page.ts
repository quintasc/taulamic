import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import type { GuestDrawerSubmit } from '@/components/admin/guests/guest-form.types';
import { useToast } from '@/components/ui';
import {
  ApiError,
  guestsApi,
  type GuestView,
  type ImportValidation,
} from '@/lib/api';
import { useEvent } from '@/lib/event-context';
import { updateGuestV2DetailMeta } from '@/lib/guest-v2-detail-meta';
import { adminRoutes } from '@/lib/routes';
import { getSetupNav } from '@/lib/setup-flow';

export function useGuestsPage() {
  const toast = useToast();
  const router = useRouter();
  const params = useParams<{ eventId: string }>();
  const { eventId } = useEvent();
  const routes = adminRoutes(params.eventId);
  const setupNav = eventId ? getSetupNav(eventId, 'guests') : null;

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

  const downloadTemplate = useCallback(async () => {
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
  }, [eventId, toast]);

  const handleImport = useCallback(async () => {
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
  }, [eventId, reloadGuests, router, routes.guestErrors, selectedFile, toast]);

  const handleAddGuest = useCallback(
    async (payload: GuestDrawerSubmit) => {
      if (!eventId) {
        return;
      }
      setSaving(true);
      try {
        const created = await guestsApi.create(eventId, payload.input);
        updateGuestV2DetailMeta(eventId, created.id, payload.detailMeta);
        await reloadGuests();
        setManualDrawerOpen(false);
        toast.success(`Invitado «${payload.input.nombre}» añadido.`);
      } catch {
        toast.error('Error al añadir el invitado. Revisa correo y teléfono.');
      } finally {
        setSaving(false);
      }
    },
    [eventId, reloadGuests, toast],
  );

  const handleUpdateGuest = useCallback(
    async (guestId: string, payload: GuestDrawerSubmit) => {
      if (!eventId) {
        return;
      }
      setSaving(true);
      try {
        await guestsApi.update(eventId, guestId, payload.input);
        updateGuestV2DetailMeta(eventId, guestId, payload.detailMeta);
        await reloadGuests();
        toast.success(`Invitado «${payload.input.nombre}» actualizado.`);
      } catch {
        toast.error('Error al actualizar el invitado.');
      } finally {
        setSaving(false);
      }
    },
    [eventId, reloadGuests, toast],
  );

  const handleDeleteGuest = useCallback(
    async (guestId: string, guestName: string) => {
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
    },
    [eventId, reloadGuests, toast],
  );

  return {
    eventId,
    routes,
    setupNav,
    guests,
    loading,
    importing,
    saving,
    selectedFile,
    setSelectedFile,
    manualDrawerOpen,
    setManualDrawerOpen,
    showImportFlow: !loading && guests.length === 0,
    downloadTemplate,
    handleImport,
    handleAddGuest,
    handleUpdateGuest,
    handleDeleteGuest,
  };
}
