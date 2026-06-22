export function PreferenceOption({
  selected,
  title,
  description,
  onSelect,
}: {
  selected: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full cursor-pointer items-start gap-4 rounded-[10px] border-2 p-4 text-left transition ${
        selected
          ? 'border-primary-500 bg-neutral-0'
          : 'border-wf-3 bg-neutral-0 hover:border-wf-4'
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? 'border-primary-500' : 'border-neutral-300'
        }`}
      >
        {selected ? (
          <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
        ) : null}
      </span>
      <span>
        <span className="block font-semibold text-neutral-900">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-neutral-500">
          {description}
        </span>
      </span>
    </button>
  );
}
