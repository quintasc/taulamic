'use client';

import { IconFile } from '@/components/icons';
import { SectionLabel, UploadZone } from '@/components/ui';

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
  onSelectFile: (file: File) => void;
  onImport: () => void;
  onDownloadTemplate?: () => void;
  /** Lista vacía: alta manual sin Excel (RF-P03.1). */
  onAddManual?: () => void;
}) {
  if (variant === 'empty') {
    return (
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
            {onDownloadTemplate ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={onDownloadTemplate}
              >
                Descargar
              </button>
            ) : null}
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
              onFile={onSelectFile}
            />
          </div>
        </div>

        <button
          type="button"
          className="btn-primary w-full max-w-2xl py-3 disabled:opacity-40"
          disabled={!selectedFile || importing}
          onClick={onImport}
        >
          {importing ? 'Importando…' : 'Importar invitados'}
        </button>

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
      <div className="mt-4">
        <UploadZone
          title="Subir Excel actualizado"
          hint="Formato .xlsx"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          disabled={importing}
          buttonLabel={selectedFile ? selectedFile.name : 'Seleccionar archivo'}
          onFile={onSelectFile}
        />
      </div>
      <button
        type="button"
        className="btn-secondary mt-4"
        disabled={!selectedFile || importing}
        onClick={onImport}
      >
        {importing ? 'Importando…' : 'Importar'}
      </button>
    </div>
  );
}
