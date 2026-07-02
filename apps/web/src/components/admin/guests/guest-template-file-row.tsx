'use client';

import { IconFile } from '@/components/icons';

const TEMPLATE_FILENAME = 'plantilla_invitados_taulamic.xlsx';

export function GuestTemplateFileRow({
  onDownload,
  buttonLabel = 'Descargar',
  className = '',
}: {
  onDownload: () => void;
  buttonLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 rounded-xl border border-neutral-200 bg-neutral-100/50 p-4 text-center sm:flex-row sm:justify-between sm:text-left ${className}`.trim()}
    >
      <div className="flex w-full min-w-0 items-center justify-center gap-3 sm:w-auto sm:justify-start">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200/80 bg-neutral-0 text-neutral-600">
          <IconFile width={20} height={20} />
        </span>
        <span
          className="min-w-0 max-w-[12rem] truncate text-sm font-medium text-neutral-900 sm:max-w-none"
          title={TEMPLATE_FILENAME}
        >
          {TEMPLATE_FILENAME}
        </span>
      </div>
      <button
        type="button"
        className="btn-secondary shrink-0"
        onClick={onDownload}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
