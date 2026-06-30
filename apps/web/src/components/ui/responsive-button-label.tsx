/**
 * Etiqueta corta en viewport reducido (`< md`).
 * El control padre (button/link) debe llevar `aria-label={full}` cuando short ≠ full.
 */
export function ResponsiveButtonLabel({
  short,
  full,
}: {
  short: string;
  full: string;
}) {
  if (short === full) {
    return <>{full}</>;
  }

  return (
    <>
      <span className="md:hidden">{short}</span>
      <span className="hidden md:inline">{full}</span>
    </>
  );
}
