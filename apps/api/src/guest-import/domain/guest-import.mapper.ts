import type { GuestImportRow } from './guest-import-row';
import {
  parseExcelMarkBoolean,
  parseExcelMarkOptionalBoolean,
} from './excel-mark-boolean';

export type GuestImportDetailMeta = {
  dietaryAlert: boolean;
  mobilityAlert: boolean;
  notes: string;
};

export type GuestUpsertInput = {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  categoryNames: string[];
  /** Notas internas del organizador (origen Excel `notas_internas`). */
  observaciones: string;
  acompananteKey: string;
  separarAcompanante: boolean | null;
  preferenciaControl: null;
};

export type GuestImportMappedRow = {
  guest: GuestUpsertInput;
  detailMeta: GuestImportDetailMeta;
};

export function mapImportRowToGuestInput(
  row: GuestImportRow,
): GuestImportMappedRow {
  const categoryNames = [row.values.categoria_1, row.values.categoria_2]
    .map((value) => value.trim())
    .filter(Boolean);

  const notasInternas = row.values.notas_internas.trim();

  return {
    guest: {
      nombre: row.values.nombre.trim(),
      correo: row.values.correo.trim().toLowerCase(),
      telefono: row.values.telefono.trim(),
      direccion: row.values.direccion.trim(),
      categoryNames,
      observaciones: notasInternas,
      acompananteKey: row.values.acompanante_key.trim(),
      separarAcompanante: parseExcelMarkOptionalBoolean(
        row.values.separar_acompanante,
      ),
      preferenciaControl: null,
    },
    detailMeta: {
      dietaryAlert: parseExcelMarkBoolean(row.values.menu_especial),
      mobilityAlert: parseExcelMarkBoolean(row.values.movilidad_reducida),
      notes: notasInternas,
    },
  };
}

export function normalizeCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function categoryKey(name: string): string {
  return normalizeCategoryName(name).toLowerCase();
}
