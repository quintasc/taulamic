import { IconUpload } from '@/components/icons';

export function UploadZone({
  title,
  hint,
  accept,
  disabled,
  onFile,
  buttonLabel = 'Subir plano',
}: {
  title: string;
  hint: string;
  accept: string;
  disabled?: boolean;
  onFile: (file: File) => void;
  buttonLabel?: string;
}) {
  function pick(fileList: FileList | null) {
    const file = fileList?.[0];
    if (file) {
      onFile(file);
    }
  }

  return (
    <label
      className={`upload-zone cursor-pointer ${disabled ? 'pointer-events-none opacity-60' : ''}`}
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
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-500">
        <IconUpload width={28} height={28} strokeWidth={1.5} />
      </span>
      <p className="text-base font-semibold text-neutral-900">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{hint}</p>
      <span className="btn-primary mt-6">{buttonLabel}</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(event) => pick(event.target.files)}
      />
    </label>
  );
}
