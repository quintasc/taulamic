import type { ReactNode } from 'react';

export function SelectableChip({
  selected,
  onClick,
  children,
  className = '',
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-[9px] border-2 px-3.5 py-3 text-[11px] font-medium transition ${
        selected
          ? 'border-primary-500 bg-primary-100 text-primary-600'
          : 'border-wf-3 text-neutral-700 hover:border-wf-4'
      } ${className}`.trim()}
    >
      {children}
    </button>
  );
}
