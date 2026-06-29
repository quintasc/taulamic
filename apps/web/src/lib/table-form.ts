export const TABLE_CAPACITY_MIN = 1;
export const TABLE_CAPACITY_MAX = 50;

export const TABLE_SHAPE_OPTIONS = [
  { id: 'redonda', label: 'Redonda', apiShape: 'redonda' },
  { id: 'rectangular', label: 'Rectangular', apiShape: 'rectangular' },
  { id: 'oval', label: 'Óvalo', apiShape: 'ovalada' },
] as const;

export type TableShapeUiId = (typeof TABLE_SHAPE_OPTIONS)[number]['id'];

export function uiTableShape(apiShape: string): TableShapeUiId {
  if (apiShape === 'ovalada') {
    return 'oval';
  }
  const match = TABLE_SHAPE_OPTIONS.find((option) => option.apiShape === apiShape);
  return match?.id ?? 'redonda';
}

export function apiShapeFromUi(uiShape: string): string {
  const match = TABLE_SHAPE_OPTIONS.find((option) => option.id === uiShape);
  return match?.apiShape ?? uiShape;
}

export type TableEditDraft = {
  label: string;
  shape: TableShapeUiId;
  capacity: number;
};

export function validateTableLabel(
  tableId: string,
  label: string,
  tables: { id: string; label: string }[],
): string | null {
  const trimmed = label.trim();
  if (!trimmed) {
    return 'La etiqueta no puede estar vacía.';
  }
  if (
    tables.some(
      (item) => item.id !== tableId && item.label.trim() === trimmed,
    )
  ) {
    return 'Ya existe otra mesa con esa etiqueta.';
  }
  return null;
}

export function validateTableCapacity(capacity: number): string | null {
  if (
    !Number.isFinite(capacity) ||
    !Number.isInteger(capacity) ||
    capacity < TABLE_CAPACITY_MIN ||
    capacity > TABLE_CAPACITY_MAX
  ) {
    return `La capacidad debe estar entre ${TABLE_CAPACITY_MIN} y ${TABLE_CAPACITY_MAX} personas.`;
  }
  return null;
}

export function getTableAssignedGuestCount(
  placements: { tableId: string }[] | undefined,
  tableId: string,
): number {
  if (!placements?.length) {
    return 0;
  }
  return placements.filter((placement) => placement.tableId === tableId).length;
}

/** Impide bajar plazas por debajo de invitados ya asignados en distribución. */
export function validateTableCapacityForAssigned(
  capacity: number,
  assignedGuestCount: number,
): string | null {
  if (
    !Number.isFinite(capacity) ||
    assignedGuestCount <= 0 ||
    capacity >= assignedGuestCount
  ) {
    return null;
  }
  const guestLabel =
    assignedGuestCount === 1 ? 'invitado asignado' : 'invitados asignados';
  return `Hay ${assignedGuestCount} ${guestLabel}. Para reducir plazas, muévelos o déjalos sin mesa en Distribución.`;
}

export function validateTableDraft(
  tableId: string,
  draft: TableEditDraft,
  tables: { id: string; label: string }[],
  assignedGuestCount = 0,
): string | null {
  return (
    validateTableLabel(tableId, draft.label, tables) ??
    validateTableCapacity(draft.capacity) ??
    validateTableCapacityForAssigned(draft.capacity, assignedGuestCount)
  );
}

export function splitTableEditErrors(
  tableId: string,
  draft: TableEditDraft,
  tables: { id: string; label: string }[],
  editError: string | null,
): { labelError: string | null; capacityError: string | null } {
  if (!editError) {
    return { labelError: null, capacityError: null };
  }
  if (validateTableLabel(tableId, draft.label, tables) !== null) {
    return { labelError: editError, capacityError: null };
  }
  return { labelError: null, capacityError: editError };
}

export function tableDraftEquals(a: TableEditDraft, b: TableEditDraft): boolean {
  return (
    a.label.trim() === b.label.trim() &&
    a.shape === b.shape &&
    a.capacity === b.capacity
  );
}

export function tableMatchesDraft(
  table: { label: string; shape: string; capacity: number },
  draft: TableEditDraft,
): boolean {
  return (
    table.label.trim() === draft.label.trim() &&
    uiTableShape(table.shape) === draft.shape &&
    table.capacity === draft.capacity
  );
}

export function draftFromTable(table: {
  label: string;
  shape: string;
  capacity: number;
}): TableEditDraft {
  return {
    label: table.label,
    shape: uiTableShape(table.shape),
    capacity: table.capacity,
  };
}
