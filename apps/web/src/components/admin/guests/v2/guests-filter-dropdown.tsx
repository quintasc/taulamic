'use client';

import { useCallback, useEffect, useState } from 'react';
import { IconChevronDown } from '@/components/icons';
import {
  GUEST_FILTER_CHIPS,
  type GuestFilterChip,
  guestFilterLabel,
} from './guests-filter-chips';

export function GuestsFilterDropdown({
  value,
  onChange,
}: {
  value: GuestFilterChip;
  onChange: (filter: GuestFilterChip) => void;
}) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close, open]);

  const activeLabel = guestFilterLabel(value);

  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        className="input-field inline-flex w-full items-center justify-between gap-2 text-left text-sm"
        aria-expanded={open}
        aria-controls="guests-filter-menu"
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">
          Filtros
          {value !== 'all' ? (
            <span className="ml-1 font-medium text-primary-600">
              · {activeLabel}
            </span>
          ) : null}
        </span>
        <IconChevronDown
          width={16}
          height={16}
          className={`shrink-0 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Cerrar filtros"
            onClick={close}
          />
          <ul
            id="guests-filter-menu"
            role="listbox"
            aria-label="Filtrar invitados"
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-0 py-1 shadow-lg"
          >
            {GUEST_FILTER_CHIPS.map((chip) => (
              <li key={chip.id} role="option" aria-selected={value === chip.id}>
                <button
                  type="button"
                  className={`block w-full px-3.5 py-2.5 text-left text-sm transition ${
                    value === chip.id
                      ? 'bg-primary-500/10 font-medium text-primary-700'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                  onClick={() => {
                    onChange(chip.id);
                    close();
                  }}
                >
                  {chip.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
