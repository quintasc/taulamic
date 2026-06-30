'use client';

import { useId, useRef, type ReactNode } from 'react';
import { IconClose, IconUpload } from '@/components/icons';

export function UploadZone({
  title,
  hint,
  accept,
  disabled,
  onFile,
  buttonLabel = 'Subir plano',
  actionClassName = '',
  actionFooter,
  /** Si true, el botón de fichero pasa a secundario (p. ej. tras elegir Excel). */
  pickButtonSecondary = false,
  /** Quita la selección actual (cruz dentro del botón de fichero). */
  onClearPick,
  /** Texto del pie para calcular ancho compartido con el botón de fichero. */
  footerSizerLabel,
}: {
  title: string;
  hint: string;
  accept: string;
  disabled?: boolean;
  onFile: (file: File) => void;
  buttonLabel?: string;
  actionClassName?: string;
  /** Botón debajo de la zona de arrastre, alineado al de selección. */
  actionFooter?: ReactNode;
  pickButtonSecondary?: boolean;
  onClearPick?: () => void;
  footerSizerLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const hasFooter = actionFooter !== undefined;
  const sizerFooterLabel = footerSizerLabel ?? 'Importar invitados';

  function pick(fileList: FileList | null) {
    const file = fileList?.[0];
    if (file) {
      onFile(file);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  const fileInput = (
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      accept={accept}
      className="hidden"
      disabled={disabled}
      onClick={(event) => {
        (event.target as HTMLInputElement).value = '';
      }}
      onChange={(event) => pick(event.target.files)}
    />
  );

  const pickBtnClass = pickButtonSecondary ? 'btn-secondary' : 'btn-primary';
  const showClearInPick = pickButtonSecondary && onClearPick;

  const pickControl = showClearInPick ? (
    <div
      className={`${pickBtnClass} inline-flex w-full min-w-0 items-center gap-1.5 px-4 py-2.5 ${
        disabled ? 'pointer-events-none opacity-60' : ''
      }`}
    >
      <label
        htmlFor={inputId}
        className="min-w-0 flex-1 cursor-pointer truncate text-center"
      >
        {buttonLabel}
      </label>
      <button
        type="button"
        className="inline-flex shrink-0 items-center justify-center rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-40"
        aria-label="Quitar archivo seleccionado"
        disabled={disabled}
        onClick={() => onClearPick?.()}
      >
        <IconClose width={16} height={16} />
      </button>
    </div>
  ) : (
    <label
      htmlFor={inputId}
      className={`${pickBtnClass} inline-flex w-full min-w-0 cursor-pointer justify-center ${
        disabled ? 'pointer-events-none opacity-60' : ''
      }`}
    >
      <span className="truncate">{buttonLabel}</span>
    </label>
  );

  const dropZone = (
    <div
      className={`upload-zone w-full ${
        disabled ? 'pointer-events-none opacity-60' : ''
      }`}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (!disabled) {
          pick(event.dataTransfer.files);
        }
      }}
    >
      <label htmlFor={inputId} className="block cursor-pointer">
        <span className="mx-auto mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-500">
          <IconUpload width={28} height={28} strokeWidth={1.5} />
        </span>
        <p className="text-base font-semibold text-neutral-900">{title}</p>
        <p className="mt-1 text-sm text-neutral-500">{hint}</p>
      </label>
      <div className={`mt-6 ${hasFooter ? '' : actionClassName}`.trim()}>
        {pickControl}
      </div>
    </div>
  );

  const pickSizer = showClearInPick ? (
    <span
      className={`${pickBtnClass} inline-flex w-full items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2.5`}
    >
      {buttonLabel}
      <span className="inline-flex w-6 shrink-0" aria-hidden />
    </span>
  ) : (
    <span
      className={`${pickBtnClass} inline-flex w-full justify-center whitespace-nowrap px-5 py-2.5`}
    >
      {buttonLabel}
    </span>
  );

  if (!hasFooter) {
    return (
      <>
        {dropZone}
        {fileInput}
      </>
    );
  }

  return (
    <div className="mx-auto w-max max-w-full">
      {/* Ancho = máximo entre etiquetas de ambos botones (apilado invisible). */}
      <div className="grid [grid-template-areas:'stack']">
        <div
          className="invisible [grid-area:stack] flex flex-col items-stretch gap-3 px-8"
          aria-hidden
        >
          {pickSizer}
          <span className="btn-primary inline-flex w-full justify-center whitespace-nowrap px-5 py-2.5">
            {sizerFooterLabel}
          </span>
        </div>
        <div className="flex flex-col gap-3 [grid-area:stack]">
          {dropZone}
          <div className="px-8">{actionFooter}</div>
        </div>
      </div>
      {fileInput}
    </div>
  );
}
