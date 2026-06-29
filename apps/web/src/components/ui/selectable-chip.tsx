import type { ReactNode } from 'react';

import { selectionChipClass } from '@/lib/semantic-ui';

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
      className={`flex flex-col items-center gap-2 rounded-[9px] px-3.5 py-3 text-[11px] font-medium transition ${selectionChipClass(selected)} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
