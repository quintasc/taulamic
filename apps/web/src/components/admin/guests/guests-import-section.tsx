'use client';

import { GuestTemplateFileRow } from '@/components/admin/guests/guest-template-file-row';
import { SectionLabel, UploadZone } from '@/components/ui';

function GuestImportActionButton({
  variant,
  importing,
  disabled,
  onClick,
}: {
  variant: 'empty' | 'more';
  importing: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const btnClass =
    variant === 'empty' ? 'btn-primary py-2.5' : 'btn-secondary';
  return (
    <button
      type="button"
      className={`${btnClass} w-full whitespace-nowrap`}
      disabled={disabled}
      onClick={onClick}
    >
      {importing
        ? 'Importando…'
        : variant === 'empty'
          ? 'Importar invitados'
          : 'Importar'}
    </button>
  );
}

export function GuestsImportSection({
  variant,
  selectedFile,
  importing,
  onSelectFile,
  onImport,
  onDownloadTemplate,
  onAddManual,
}: {
  variant: 'empty' | 'more';
  selectedFile: File | null;
  importing: boolean;
  onSelectFile: (file: File | null) => void;
  onImport: () => void;
  onDownloadTemplate?: () => void;
  /** Lista vacía: alta manual sin Excel (RF-P03.1). */
  onAddManual?: () => void;
}) {
  const importDisabled = !selectedFile || importing;

  const uploadBlock = (
    <UploadZone
      title={
        variant === 'empty'
          ? 'Selecciona el Excel completado'
          : 'Subir Excel actualizado'
      }
      hint="Formato .xlsx"
      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      disabled={importing}
      buttonLabel={
        selectedFile ? selectedFile.name : 'Seleccionar archivo'
      }
      buttonTitle={selectedFile?.name}
      pickButtonSecondary={Boolean(selectedFile)}
      onClearPick={selectedFile ? () => onSelectFile(null) : undefined}
      onFile={onSelectFile}
      actionFooter={
        <GuestImportActionButton
          variant={variant}
          importing={importing}
          disabled={importDisabled}
          onClick={onImport}
        />
      }
      footerSizerLabel={
        variant === 'empty' ? 'Importar invitados' : 'Importar'
      }
      compact
    />
  );

  if (variant === 'empty') {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="card-admin">
          <SectionLabel>Paso 1 — Descarga la plantilla</SectionLabel>
          {onDownloadTemplate ? (
            <GuestTemplateFileRow
              className="mt-4"
              onDownload={onDownloadTemplate}
            />
          ) : null}
        </div>

        <div className="card-admin">
          <SectionLabel>Paso 2 — Sube tu Excel completado</SectionLabel>
          <div className="mt-4">{uploadBlock}</div>
        </div>

        {onAddManual ? (
          <>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t border-neutral-200" />
              </div>
              <p className="relative mx-auto w-fit bg-wf-1 px-3 text-xs text-neutral-500">
                o
              </p>
            </div>

            <div className="card-admin max-w-2xl text-center">
              <p className="text-sm text-neutral-700">
                ¿Lista pequeña o prefieres ir uno a uno?
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Crea tu lista a tu ritmo, sin necesidad de usar Excel.
              </p>
              <button
                type="button"
                className="btn-secondary mt-4 inline-flex items-center gap-2"
                onClick={onAddManual}
              >
                Añadir invitado
              </button>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-8 card-admin max-w-2xl">
      <SectionLabel>Importar más invitados</SectionLabel>
      <p className="mt-1 text-sm text-neutral-500">
        Puedes subir un Excel nuevo o el mismo archivo actualizado; los correos
        existentes se actualizan y los nuevos se añaden.
      </p>
      {onDownloadTemplate ? (
        <GuestTemplateFileRow
          className="mt-4 hidden lg:flex"
          buttonLabel="Descargar plantilla"
          onDownload={onDownloadTemplate}
        />
      ) : null}
      <div className="mt-4">{uploadBlock}</div>
    </div>
  );
}
