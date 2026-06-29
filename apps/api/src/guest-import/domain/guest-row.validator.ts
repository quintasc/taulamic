import {
  GUEST_TEMPLATE_COLUMNS,
  GUEST_TEMPLATE_DOWNLOAD_COLUMNS,
  GUEST_TEMPLATE_REQUIRED_COLUMNS,
  GUEST_TEMPLATE_SHEET_NAME,
  type GuestTemplateColumn,
} from './guest-template.schema';
import type { GuestImportRowError } from './guest-import-row-error';
import type { GuestImportRow } from './guest-import-row';
import {
  EXCEL_MARK_FIELD_HINT,
  isValidExcelMarkInput,
  normalizeSepararAcompananteForGroupCheck,
} from './excel-mark-boolean';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s()-]{9,20}$/;
const EXCEL_MARK_FIELDS = [
  'menu_especial',
  'movilidad_reducida',
  'separar_acompanante',
] as const;

export function validateGuestImportHeaders(
  headers: string[],
): GuestImportRowError[] {
  const normalized = headers.map((header) => header.trim().toLowerCase());
  const missingRequired = GUEST_TEMPLATE_REQUIRED_COLUMNS.filter(
    (column) => !normalized.includes(column),
  );

  if (missingRequired.length > 0) {
    return [
      {
        row: 1,
        field: GUEST_TEMPLATE_SHEET_NAME,
        code: 'XLS-001',
        message: `Encabezado faltante o incorrecto: ${missingRequired.join(', ')}.`,
      },
    ];
  }

  const missingDownload = GUEST_TEMPLATE_DOWNLOAD_COLUMNS.filter(
    (column) => !normalized.includes(column),
  );
  if (missingDownload.length > 0) {
    return [
      {
        row: 1,
        field: GUEST_TEMPLATE_SHEET_NAME,
        code: 'XLS-001',
        message: `Encabezado faltante o incorrecto: ${missingDownload.join(', ')}.`,
      },
    ];
  }

  return [];
}

export function validateGuestImportRows(
  rows: GuestImportRow[],
): GuestImportRowError[] {
  const errors: GuestImportRowError[] = [];

  for (const row of rows) {
    errors.push(...validateSingleRow(row));
  }

  errors.push(...validateDuplicateRows(rows));
  errors.push(...validateCompanionGroups(rows));

  return errors;
}

function validateSingleRow(row: GuestImportRow): GuestImportRowError[] {
  const errors: GuestImportRowError[] = [];
  const { values, rowNumber } = row;

  for (const column of GUEST_TEMPLATE_REQUIRED_COLUMNS) {
    if (!values[column]?.trim()) {
      errors.push({
        row: rowNumber,
        field: column,
        code: 'XLS-007',
        message: `Fila incompleta: el campo obligatorio "${column}" esta vacio.`,
      });
    }
  }

  if (values.nombre.trim().length > 120) {
    errors.push({
      row: rowNumber,
      field: 'nombre',
      code: 'XLS-007',
      message: 'El nombre supera el maximo de 120 caracteres.',
    });
  }

  if (values.correo.trim() && !EMAIL_PATTERN.test(values.correo.trim())) {
    errors.push({
      row: rowNumber,
      field: 'correo',
      code: 'XLS-002',
      message: 'Formato de correo invalido.',
    });
  }

  if (values.telefono.trim() && !isValidPhone(values.telefono)) {
    errors.push({
      row: rowNumber,
      field: 'telefono',
      code: 'XLS-003',
      message: 'Formato de telefono invalido.',
    });
  }

  for (const categoryField of ['categoria_1', 'categoria_2'] as const) {
    if (values[categoryField].trim().length > 80) {
      errors.push({
        row: rowNumber,
        field: categoryField,
        code: 'XLS-007',
        message: `${categoryField} supera el maximo de 80 caracteres.`,
      });
    }
  }

  for (const markField of EXCEL_MARK_FIELDS) {
    if (
      values[markField].trim() &&
      !isValidExcelMarkInput(values[markField])
    ) {
      errors.push({
        row: rowNumber,
        field: markField,
        code: 'XLS-005',
        message: `${markField}: ${EXCEL_MARK_FIELD_HINT}`,
      });
    }
  }

  return errors;
}

function validateDuplicateRows(rows: GuestImportRow[]): GuestImportRowError[] {
  const errors: GuestImportRowError[] = [];
  markDuplicateField(rows, 'correo', normalizeEmail, errors);
  markDuplicateField(rows, 'telefono', normalizePhone, errors);
  return errors;
}

function markDuplicateField(
  rows: GuestImportRow[],
  field: Extract<GuestTemplateColumn, 'correo' | 'telefono'>,
  normalize: (value: string) => string,
  errors: GuestImportRowError[],
): void {
  const seen = new Map<string, number>();

  for (const row of rows) {
    const normalized = normalize(row.values[field]);
    if (!normalized) {
      continue;
    }

    const firstRow = seen.get(normalized);
    if (firstRow === undefined) {
      seen.set(normalized, row.rowNumber);
      continue;
    }

    errors.push({
      row: row.rowNumber,
      field,
      code: 'XLS-004',
      message: `Duplicado detectado por ${field} (coincide con fila ${firstRow}).`,
    });
  }
}

function validateCompanionGroups(rows: GuestImportRow[]): GuestImportRowError[] {
  const errors: GuestImportRowError[] = [];
  const groups = new Map<
    string,
    Array<{ rowNumber: number; separar: string }>
  >();

  for (const row of rows) {
    const key = row.values.acompanante_key.trim();
    if (!key) {
      continue;
    }

    const members = groups.get(key) ?? [];
    members.push({
      rowNumber: row.rowNumber,
      separar: normalizeSepararAcompananteForGroupCheck(
        row.values.separar_acompanante,
      ),
    });
    groups.set(key, members);
  }

  for (const [key, members] of groups) {
    const separarValues = new Set(
      members.map((member) => member.separar).filter(Boolean),
    );

    if (separarValues.size > 1) {
      for (const member of members) {
        errors.push({
          row: member.rowNumber,
          field: 'acompanante_key',
          code: 'XLS-006',
          message: `acompanante_key "${key}" tiene valores inconsistentes de separar_acompanante.`,
        });
      }
    }
  }

  return errors;
}

function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!PHONE_PATTERN.test(trimmed)) {
    return false;
  }

  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

export function isGuestImportRowEmpty(
  values: Record<GuestTemplateColumn, string>,
): boolean {
  return GUEST_TEMPLATE_COLUMNS.every((column) => !values[column]?.trim());
}

export function cellToString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object' && 'text' in value) {
    const richText = value as { text?: string };
    return richText.text?.trim() ?? '';
  }

  return String(value).trim();
}
