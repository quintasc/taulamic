import type { GuestImportRow } from './guest-import-row';
import type { GuestPreferenceControl } from './guest';

export type GuestUpsertInput = {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  categoryNames: string[];
  observaciones: string;
  acompananteKey: string;
  separarAcompanante: boolean | null;
  preferenciaControl: GuestPreferenceControl | null;
};

export function mapImportRowToGuestInput(row: GuestImportRow): GuestUpsertInput {
  const categoryNames = [row.values.categoria_1, row.values.categoria_2]
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    nombre: row.values.nombre.trim(),
    correo: row.values.correo.trim().toLowerCase(),
    telefono: row.values.telefono.trim(),
    direccion: row.values.direccion.trim(),
    categoryNames,
    observaciones: row.values.observaciones.trim(),
    acompananteKey: row.values.acompanante_key.trim(),
    separarAcompanante: parseOptionalBoolean(row.values.separar_acompanante),
    preferenciaControl: parsePreferenceControl(row.values.preferencia_control),
  };
}

function parseOptionalBoolean(value: string): boolean | null {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  return trimmed === 'true';
}

function parsePreferenceControl(
  value: string,
): GuestPreferenceControl | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed as GuestPreferenceControl;
}

export function normalizeCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function categoryKey(name: string): string {
  return normalizeCategoryName(name).toLowerCase();
}
