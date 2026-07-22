'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

const MONTH_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
});

const DISPLAY_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function isBeforeDay(a: Date, b: Date): boolean {
  return toIsoDate(a) < toIsoDate(b);
}

function isSameDay(a: Date, b: Date): boolean {
  return toIsoDate(a) === toIsoDate(b);
}

/** Lunes = 0 … Domingo = 6 */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function DatePicker({
  id: idProp,
  value,
  min,
  onChange,
  disabled = false,
  placeholder = 'dd/mm/aaaa',
}: {
  id?: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const selected = useMemo(() => parseIsoDate(value), [value]);
  const minDate = useMemo(() => (min ? parseIsoDate(min) : null), [min]);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(selected ?? today),
  );

  useEffect(() => {
    if (selected) {
      setVisibleMonth(startOfMonth(selected));
    }
  }, [selected]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  const days = useMemo(() => {
    const first = startOfMonth(visibleMonth);
    const offset = mondayIndex(first);
    const cells: Array<Date | null> = [];
    for (let i = 0; i < offset; i += 1) {
      cells.push(null);
    }
    const daysInMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0,
    ).getDate();
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(
        new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day),
      );
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  }, [visibleMonth]);

  const displayValue = selected ? DISPLAY_FORMATTER.format(selected) : '';
  const monthLabel = MONTH_FORMATTER.format(visibleMonth);

  const canGoPrev =
    !minDate ||
    toIsoDate(visibleMonth) > toIsoDate(startOfMonth(minDate));

  const selectDay = (day: Date) => {
    if (minDate && isBeforeDay(day, minDate)) {
      return;
    }
    onChange(toIsoDate(day));
    setIsOpen(false);
  };

  const clearValue = () => {
    onChange('');
    setIsOpen(false);
  };

  const selectToday = () => {
    if (minDate && isBeforeDay(today, minDate)) {
      return;
    }
    onChange(toIsoDate(today));
    setVisibleMonth(startOfMonth(today));
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative min-w-0 w-full">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="input-field flex min-w-0 items-center justify-between gap-2 text-left"
      >
        <span
          className={
            displayValue
              ? 'truncate text-neutral-900'
              : 'truncate text-neutral-500'
          }
        >
          {displayValue || placeholder}
        </span>
        <svg
          className="h-4 w-4 shrink-0 text-neutral-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label="Elegir fecha"
          className="absolute left-0 right-0 z-[100] mt-1 w-full max-w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-0 p-3 shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Mes anterior"
              disabled={!canGoPrev}
              onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <p className="min-w-0 truncate text-center text-sm font-semibold capitalize text-neutral-900">
              {monthLabel}
            </p>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-700 transition hover:bg-neutral-100"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {WEEKDAY_LABELS.map((label) => (
              <span
                key={label}
                className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-neutral-500"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, index) => {
              if (!day) {
                return <span key={`empty-${index}`} className="h-9" />;
              }
              const iso = toIsoDate(day);
              const disabledDay = Boolean(minDate && isBeforeDay(day, minDate));
              const isSelected = selected ? isSameDay(day, selected) : false;
              const isToday = isSameDay(day, today);

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabledDay}
                  onClick={() => selectDay(day)}
                  className={[
                    'h-9 rounded-lg text-sm transition',
                    disabledDay
                      ? 'cursor-not-allowed text-neutral-300'
                      : 'text-neutral-900 hover:bg-primary-100',
                    isSelected
                      ? 'bg-primary-500 font-semibold text-neutral-0 hover:bg-primary-500'
                      : '',
                    !isSelected && isToday ? 'ring-1 ring-primary-500/40' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-2">
            <button
              type="button"
              onClick={clearValue}
              className="rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={selectToday}
              disabled={Boolean(minDate && isBeforeDay(today, minDate))}
              className="rounded-lg px-2 py-1.5 text-sm font-medium text-primary-600 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Hoy
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
