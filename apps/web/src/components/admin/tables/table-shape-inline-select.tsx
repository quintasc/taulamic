'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { IconChevronDown } from '@/components/icons';
import {
  TABLE_SHAPE_OPTIONS,
  type TableShapeUiId,
} from '@/lib/table-form';

export function TableShapeInlineSelect({
  value,
  onChange,
}: {
  value: TableShapeUiId;
  onChange: (shape: TableShapeUiId) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedLabel =
    TABLE_SHAPE_OPTIONS.find((option) => option.id === value)?.label ?? value;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return;
    }
    function handlePointer(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }
      close();
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close();
      }
    }
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [close, open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="input-field-compact flex w-[7.5rem] items-center justify-between gap-1 capitalize"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Forma de la mesa"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{selectedLabel}</span>
        <IconChevronDown
          width={14}
          height={14}
          className={`shrink-0 text-neutral-500 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <ul
          className="absolute left-0 top-full z-20 mt-1 min-w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0 py-1 shadow-lg"
          role="listbox"
          aria-label="Formas de mesa"
        >
          {TABLE_SHAPE_OPTIONS.map((option) => {
            const selected = option.id === value;
            return (
              <li key={option.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`flex w-full px-2.5 py-1.5 text-left text-sm capitalize transition ${
                    selected
                      ? 'bg-primary-500/10 text-primary-700'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                  onClick={() => {
                    onChange(option.id);
                    close();
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
