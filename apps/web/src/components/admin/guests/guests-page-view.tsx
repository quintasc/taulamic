'use client';

import Link from 'next/link';

import { SetupNavBar } from '@/components/admin/setup-nav-bar';
import { GuestsImportSection } from '@/components/admin/guests/guests-import-section';
import { GuestDrawerV2 } from '@/components/admin/guests/v2/guest-drawer-v2';
import { GuestsPanelV2 } from '@/components/admin/guests/v2/guests-panel-v2';
import { EmptyState, PageHeader } from '@/components/ui';
import { useGuestsPage } from '@/hooks/use-guests-page';

export function GuestsPageView() {
  const {
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
    showImportFlow,
    downloadTemplate,
    handleImport,
    handleAddGuest,
    handleUpdateGuest,
    handleDeleteGuest,
  } = useGuestsPage();

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
              onSubmit={(payload) => void handleAddGuest(payload)}
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
            onAddGuest={(payload) => void handleAddGuest(payload)}
            onUpdateGuest={(id, payload) => void handleUpdateGuest(id, payload)}
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
