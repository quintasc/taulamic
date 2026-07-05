'use client';

import { useId, useRef, type ReactNode } from 'react';
import { IconClose, IconUpload } from '@/components/icons';

const MOBILE_FILE_NAME_VISIBLE_CHARS = 20;

function truncateMobileFileName(name: string): string {
  if (name.length <= MOBILE_FILE_NAME_VISIBLE_CHARS) {
    return name;
  }
  return `${name.slice(0, MOBILE_FILE_NAME_VISIBLE_CHARS)}...`;
}

export function UploadZone({
  title,
  hint,
  accept,
  disabled,
  onFile,
  buttonLabel = 'Subir plano',
  buttonTitle,
  actionClassName = '',
  actionFooter,
  /** Si true, el botón de fichero pasa a secundario (p. ej. tras elegir Excel). */
  pickButtonSecondary = false,
  /** Quita la selección actual (cruz dentro del botón de fichero). */
  onClearPick,
  /** Texto del pie para calcular ancho compartido con el botón de fichero. */
  footerSizerLabel,
  compact = false,
}: {
  title: string;
  hint: string;
  accept: string;
  disabled?: boolean;
  onFile: (file: File) => void;
  buttonLabel?: string;
  buttonTitle?: string;
  actionClassName?: string;
  /** Botón debajo de la zona de arrastre, alineado al de selección. */
  actionFooter?: ReactNode;
  pickButtonSecondary?: boolean;
  onClearPick?: () => void;
  footerSizerLabel?: string;
  compact?: boolean;
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
  const pickTitle = buttonTitle ?? buttonLabel;
  const mobileButtonLabel = truncateMobileFileName(buttonLabel);

  const pickControl = showClearInPick ? (
    <div
      className={`${pickBtnClass} inline-flex w-full min-w-0 max-w-full items-center gap-2 overflow-hidden px-3 py-2.5 ${
        disabled ? 'pointer-events-none opacity-60' : ''
      }`}
    >
      <label
        htmlFor={inputId}
        className="block min-w-0 flex-1 cursor-pointer overflow-hidden truncate text-center"
        title={pickTitle}
      >
        <span className="sm:hidden">{mobileButtonLabel}</span>
        <span className="hidden sm:inline">{buttonLabel}</span>
      </label>
      <button
        type="button"
        className="inline-flex shrink-0 items-center justify-center rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-40"
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
      className={`upload-zone min-w-0 w-full ${
        compact ? 'px-4 py-6 sm:px-6 sm:py-8' : ''
      } ${
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
        <span
          className={`mx-auto flex shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-500 ${
            compact ? 'mb-3 h-11 w-11' : 'mb-4 h-14 w-14'
          }`}
        >
          <IconUpload
            width={compact ? 22 : 28}
            height={compact ? 22 : 28}
            strokeWidth={1.5}
          />
        </span>
        <p className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-neutral-900`}>
          {title}
        </p>
        <p className={`${compact ? 'mt-0.5 text-xs' : 'mt-1 text-sm'} text-neutral-500`}>
          {hint}
        </p>
      </label>
      <div
        className={`${compact ? 'mt-4' : 'mt-6'} ${
          hasFooter ? '' : actionClassName
        }`.trim()}
      >
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

  if (compact) {
    return (
      <div className="mx-auto w-full max-w-full min-w-0">
        <div className="flex w-full min-w-0 flex-col gap-3">
          {dropZone}
          <div className="mx-auto w-full max-w-[17rem]">{actionFooter}</div>
        </div>
        {fileInput}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-full">
      {/* Ancho = máximo entre etiquetas de ambos botones (apilado invisible). */}
      <div className="grid [grid-template-areas:'stack']">
        <div
          className="invisible mx-auto flex w-full max-w-[17rem] flex-col items-stretch gap-3 px-0 [grid-area:stack] sm:px-8"
          aria-hidden
        >
          {pickSizer}
          <span className="btn-primary inline-flex w-full justify-center whitespace-nowrap px-5 py-2.5">
            {sizerFooterLabel}
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-3 [grid-area:stack]">
          {dropZone}
          <div className="mx-auto w-full max-w-[17rem] px-0 sm:px-8">
            {actionFooter}
          </div>
        </div>
      </div>
      {fileInput}
    </div>
  );
}
