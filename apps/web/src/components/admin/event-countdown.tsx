'use client';

import { useEffect, useState } from 'react';
import {
  getEventCountdown,
  type EventCountdownState,
} from '@/lib/event-ui-meta';

/** Patrones 5×7 (filas de 0/1) para dígitos estilo matriz de puntos. */
const DOT_PATTERNS: Record<string, readonly string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
};

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function DotMatrixDigit({ char }: { char: string }) {
  const pattern = DOT_PATTERNS[char];

  if (!pattern) {
    return null;
  }

  return (
    <div className="flex flex-col gap-[1.5px]" aria-hidden>
      {pattern.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-[1.5px]">
          {row.split('').map((cell, cellIndex) => (
            <span
              key={cellIndex}
              className={`h-[3px] w-[3px] rounded-full sm:h-1 sm:w-1 ${
                cell === '1' ? 'bg-neutral-700' : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function DotMatrixColon() {
  return (
    <div
      className="countdown-colon-pulse col-start-2 row-start-1 flex flex-col items-center justify-center gap-[9px] self-center sm:gap-[11px]"
      aria-hidden
    >
      <span className="h-[3px] w-[3px] rounded-full bg-neutral-700 sm:h-1 sm:w-1" />
      <span className="h-[3px] w-[3px] rounded-full bg-neutral-700 sm:h-1 sm:w-1" />
    </div>
  );
}

function DotMatrixClock({ hours, minutes }: { hours: number; minutes: number }) {
  const hoursStr = pad2(hours);
  const minutesStr = pad2(minutes);

  return (
    <div className="inline-grid grid-cols-[auto_auto_auto] items-end gap-x-3 sm:gap-x-4 gap-y-2">
      <div className="col-start-1 flex gap-1">
        {hoursStr.split('').map((char, index) => (
          <DotMatrixDigit key={`h-${char}-${index}`} char={char} />
        ))}
      </div>
      <DotMatrixColon />
      <div className="col-start-3 flex gap-1">
        {minutesStr.split('').map((char, index) => (
          <DotMatrixDigit key={`m-${char}-${index}`} char={char} />
        ))}
      </div>
      <span className="col-start-1 text-center text-[9px] font-medium uppercase tracking-[0.12em] text-neutral-400">
        Horas
      </span>
      <span className="col-start-3 text-center text-[9px] font-medium uppercase tracking-[0.12em] text-neutral-400">
        Minutos
      </span>
    </div>
  );
}

function DaysRemainingDisplay({ days }: { days: number }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <span className="text-5xl font-bold tabular-nums leading-none text-success-500 sm:text-[3.5rem]">
        {days}
      </span>
      <span className="text-left text-[11px] font-bold uppercase leading-tight tracking-[0.06em] text-neutral-800 sm:text-xs">
        Días
        <br />
        faltantes
      </span>
    </div>
  );
}

function CountdownBody({ state }: { state: EventCountdownState }) {
  if (state.status === 'no-date') {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-2 text-center sm:py-4">
        <p className="text-4xl font-bold tabular-nums text-neutral-300 sm:text-5xl">
          —
        </p>
        <p className="text-sm text-neutral-500">
          Indica la fecha del evento en Configuración
        </p>
      </div>
    );
  }

  if (state.status === 'past') {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-2 text-center sm:py-4">
        <p className="text-sm font-medium text-neutral-600">
          El evento ya pasó · {state.dateLabel}
        </p>
        <p className="text-xs text-neutral-500">
          {state.daysAgo === 1
            ? 'Hace 1 día'
            : `Hace ${state.daysAgo} días`}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4 sm:gap-8">
        <DaysRemainingDisplay days={state.days} />
        <div className="flex items-end">
          <DotMatrixClock hours={state.hours} minutes={state.minutes} />
        </div>
      </div>
      <div className="mt-6 h-[3px] w-full overflow-hidden rounded-sm bg-wf-3">
        <div
          className="h-full rounded-sm bg-success-500 transition-[width] duration-700 ease-out"
          style={{ width: `${state.progressPercent}%` }}
        />
      </div>
    </>
  );
}

export function EventCountdown({ eventDate }: { eventDate?: string }) {
  const [state, setState] = useState<EventCountdownState>(() =>
    getEventCountdown(eventDate),
  );

  useEffect(() => {
    function tick() {
      setState(getEventCountdown(eventDate));
    }

    tick();
    const intervalId = window.setInterval(tick, 30_000);
    return () => window.clearInterval(intervalId);
  }, [eventDate]);

  return (
    <section className="card-admin mb-6">
      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-wf-5">
        Cuenta atrás
      </p>
      <div className="mt-5">
        <CountdownBody state={state} />
      </div>
    </section>
  );
}
