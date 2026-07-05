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
  const routeEventId = params.eventId;
  const { eventId } = useEvent();
  const routes = adminRoutes(routeEventId);
  const setupNav = routeEventId ? getSetupNav(routeEventId, 'guests') : null;

  const [guests, setGuests] = useState<GuestView[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualDrawerOpen, setManualDrawerOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    ids: string[];
    singleName?: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteResetToken, setDeleteResetToken] = useState(0);

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
      const list = await guestsApi.list(eventId);
      for (const guest of list.guests) {
        const correo = guest.correo?.trim().toLowerCase();
        if (!correo) {
          continue;
        }
        const detailMeta = result.detailMetaByCorreo?.[correo];
        if (detailMeta) {
          updateGuestV2DetailMeta(eventId, guest.id, detailMeta);
        }
      }
      setGuests(list.guests);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, reloadGuests, router, routes.guestErrors, selectedFile, toast]);

  const handleAddGuest = useCallback(
    async (payload: GuestDrawerSubmit) => {
      if (!eventId) {
        return;
      }
      setSaving(true);
      try {
        const created = await guestsApi.create(eventId, {
          ...payload.input,
          observaciones: payload.detailMeta.notes,
        });
        updateGuestV2DetailMeta(eventId, created.id, payload.detailMeta);
        await reloadGuests();
        setManualDrawerOpen(false);
        toast.success(`Invitado «${payload.input.nombre}» añadido.`);
      } catch (err: unknown) {
        throw err;
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
        await guestsApi.update(eventId, guestId, {
          ...payload.input,
          observaciones: payload.detailMeta.notes,
        });
        updateGuestV2DetailMeta(eventId, guestId, payload.detailMeta);
        await reloadGuests();
        toast.success(`Invitado «${payload.input.nombre}» actualizado.`);
      } catch (err: unknown) {
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [eventId, reloadGuests, toast],
  );

  const handleDeleteGuest = useCallback((guestId: string, guestName: string) => {
    setPendingDelete({ ids: [guestId], singleName: guestName });
  }, []);

  const handleBulkDeleteGuests = useCallback((guestIds: string[]) => {
    if (guestIds.length === 0) {
      return;
    }
    setPendingDelete({ ids: guestIds });
  }, []);

  const cancelDeleteGuest = useCallback(() => {
    if (!deleting) {
      setPendingDelete(null);
    }
  }, [deleting]);

  const confirmDeleteGuest = useCallback(async () => {
    if (!eventId || !pendingDelete) {
      return;
    }
    setDeleting(true);
    try {
      for (const guestId of pendingDelete.ids) {
        await guestsApi.remove(eventId, guestId);
      }
      await reloadGuests();
      const count = pendingDelete.ids.length;
      if (count === 1 && pendingDelete.singleName) {
        toast.success(`Invitado «${pendingDelete.singleName}» eliminado.`);
      } else {
        toast.success(
          `${count} invitado${count === 1 ? '' : 's'} eliminado${count === 1 ? '' : 's'}.`,
        );
      }
      setPendingDelete(null);
      setDeleteResetToken((token) => token + 1);
    } catch {
      toast.error('Error al eliminar los invitados seleccionados.');
    } finally {
      setDeleting(false);
    }
  }, [eventId, pendingDelete, reloadGuests, toast]);

  return {
    eventId,
    routeEventId,
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
    handleBulkDeleteGuests,
    pendingDelete,
    deleting,
    deleteResetToken,
    confirmDeleteGuest,
    cancelDeleteGuest,
  };
}
