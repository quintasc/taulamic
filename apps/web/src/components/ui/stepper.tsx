import { Button } from './button';

export function Stepper({
  value,
  min = 1,
  max = 50,
  onChange,
  suffix,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        className="px-3 py-2"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Disminuir"
      >
        −
      </Button>
      <span className="min-w-[3rem] text-center text-lg font-semibold">
        {value}
      </span>
      <Button
        variant="secondary"
        className="px-3 py-2"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Aumentar"
      >
        +
      </Button>
      {suffix ? <span className="text-sm text-neutral-500">{suffix}</span> : null}
    </div>
  );
}
