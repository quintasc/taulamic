/** Marcas amigables en plantilla Excel: vacio = no; X / Si = si (legacy: true/false). */

const TRUE_MARKS = new Set(['x', 'si', 'sí', 's', 'true', '1', 'yes']);
const FALSE_MARKS = new Set(['false', '0', 'no']);

export const EXCEL_MARK_FIELD_HINT =
  'Deja la celda vacia o escribe X o Si para marcar si.';

function normalizeExcelMarkInput(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidExcelMarkInput(value: string): boolean {
  const normalized = normalizeExcelMarkInput(value);
  if (!normalized) {
    return true;
  }

  return TRUE_MARKS.has(normalized) || FALSE_MARKS.has(normalized);
}

export function parseExcelMarkBoolean(value: string): boolean {
  const normalized = normalizeExcelMarkInput(value);
  if (!normalized || FALSE_MARKS.has(normalized)) {
    return false;
  }

  return TRUE_MARKS.has(normalized);
}

export function parseExcelMarkOptionalBoolean(value: string): boolean | null {
  const normalized = normalizeExcelMarkInput(value);
  if (!normalized) {
    return null;
  }

  if (FALSE_MARKS.has(normalized)) {
    return false;
  }

  if (TRUE_MARKS.has(normalized)) {
    return true;
  }

  return null;
}

/** Normaliza separar_acompanante para detectar inconsistencias en grupos. */
export function normalizeSepararAcompananteForGroupCheck(value: string): string {
  const normalized = normalizeExcelMarkInput(value);
  if (!normalized) {
    return '';
  }

  if (TRUE_MARKS.has(normalized)) {
    return 'yes';
  }

  if (FALSE_MARKS.has(normalized)) {
    return 'no';
  }

  return normalized;
}
