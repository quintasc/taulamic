'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

export type CustomSelectOption = {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchesSearch(option: CustomSelectOption, query: string): boolean {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) {
    return true;
  }
  const haystack = normalizeSearch(
    [option.label, option.hint].filter(Boolean).join(' '),
  );
  return normalizedQuery
    .split(/\s+/)
    .every((token) => haystack.includes(token));
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  clearable = false,
  searchable = false,
  searchPlaceholder = 'Buscar…',
  id: idProp,
  'aria-labelledby': ariaLabelledBy,
}: {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder: string;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  id?: string;
  'aria-labelledby'?: string;
}) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value);

  const triggerLabel = selected
    ? [selected.label, selected.hint].filter(Boolean).join(' · ')
    : placeholder;

  const filteredOptions = useMemo(
    () =>
      searchable
        ? options.filter((option) => matchesSearch(option, search))
        : options,
    [options, search, searchable],
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      return;
    }
    if (searchable) {
      searchInputRef.current?.focus();
    }
  }, [isOpen, searchable]);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={ariaLabelledBy}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-left text-sm text-neutral-900 transition focus:border-primary-500 focus:bg-neutral-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          className={
            selected
              ? 'truncate font-medium text-neutral-900'
              : 'truncate font-normal text-neutral-400'
          }
        >
          {triggerLabel}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen ? (
        <div
          role="listbox"
          aria-labelledby={ariaLabelledBy}
          className="absolute left-0 z-[100] mt-1 max-h-60 w-full overflow-hidden overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-0 p-0 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {searchable ? (
            <div className="sticky top-0 z-10 border-b border-neutral-100 bg-neutral-0 p-2">
              <input
                ref={searchInputRef}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setIsOpen(false);
                  }
                }}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-primary-500 focus:bg-neutral-0 focus:ring-2 focus:ring-primary-500/20"
                aria-label={searchPlaceholder}
              />
            </div>
          ) : null}

          {clearable ? (
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                !value
                  ? 'bg-primary-500 font-semibold text-neutral-0'
                  : 'bg-neutral-0 text-neutral-800 hover:bg-primary-500 hover:text-neutral-0'
              }`}
            >
              {placeholder}
            </button>
          ) : null}

          {filteredOptions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-neutral-500">Sin resultados</p>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => {
                    if (option.disabled) {
                      return;
                    }
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    option.disabled
                      ? 'cursor-not-allowed bg-neutral-0 text-neutral-300'
                      : isSelected
                        ? 'bg-primary-500 font-semibold text-neutral-0'
                        : 'bg-neutral-0 font-medium text-neutral-800 hover:bg-primary-500 hover:text-neutral-0'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {option.hint ? (
                    <span
                      className={`ml-2 hidden shrink-0 text-[10px] font-semibold uppercase tracking-wider sm:inline-block ${
                        isSelected && !option.disabled
                          ? 'text-neutral-0/80'
                          : 'opacity-65'
                      }`}
                    >
                      {option.hint}
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
