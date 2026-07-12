/**
 * Etiqueta compacta para diagramas: nombre + primer apellido (2.ª palabra).
 * Nunca devuelve fragmentos de una sola letra.
 */
export function formatDiagramGuestName(fullName: string, maxChars = 28): string {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return '';
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    const firstAndFirstSurname = `${parts[0]} ${parts[1]}`;
    if (firstAndFirstSurname.length <= maxChars) {
      return firstAndFirstSurname;
    }
  }

  const firstName = parts[0] ?? trimmed;
  if (firstName.length <= maxChars) {
    return firstName;
  }

  if (firstName.length > maxChars) {
    return `${firstName.slice(0, Math.max(2, maxChars - 1))}…`;
  }

  return firstName;
}

export function diagramLabelWidth(capacity: number): number {
  if (capacity <= 6) {
    return 100;
  }
  if (capacity <= 8) {
    return 88;
  }
  if (capacity <= 10) {
    return 76;
  }
  return 64;
}

/** Recorta la caja de etiqueta para que no salga del viewBox del diagrama. */
export function clampDiagramNameLabelBox<T extends { x: number; width: number }>(
  box: T,
  viewMinX: number,
  viewMaxX: number,
): T {
  let x = box.x;
  if (x < viewMinX) {
    x = viewMinX;
  }
  if (x + box.width > viewMaxX) {
    x = Math.max(viewMinX, viewMaxX - box.width);
  }
  return { ...box, x };
}
