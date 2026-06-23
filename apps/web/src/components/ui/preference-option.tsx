export function PreferenceOption({
  selected,
  title,
  description,
  onSelect,
  disabled = false,
  badge,
}: {
  selected: boolean;
  title: string;
  description: string;
  onSelect: () => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`flex w-full items-start gap-4 rounded-[10px] border-2 p-4 text-left transition ${
        disabled
          ? 'cursor-not-allowed border-wf-3 bg-neutral-50 opacity-70'
          : selected
            ? 'cursor-pointer border-primary-500 bg-neutral-0'
            : 'cursor-pointer border-wf-3 bg-neutral-0 hover:border-wf-4'
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected && !disabled ? 'border-primary-500' : 'border-neutral-300'
        }`}
      >
        {selected && !disabled ? (
          <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
        ) : null}
      </span>
      <span>
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-neutral-900">{title}</span>
          {badge ? (
            <span className="rounded-full bg-wf-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-wf-5">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-neutral-500">
          {description}
        </span>
      </span>
    </button>
  );
}
