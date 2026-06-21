export function GuestPill({ name }: { name: string }) {
  return (
    <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[13px] font-medium text-neutral-800">
      {name}
    </span>
  );
}
