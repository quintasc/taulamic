export type CategoryColor = {
  fill: string;
  border: string;
  text: string;
};

const CATEGORY_PALETTE: CategoryColor[] = [
  { fill: '#3b82f6', border: '#2563eb', text: '#ffffff' },
  { fill: '#8b5cf6', border: '#7c3aed', text: '#ffffff' },
  { fill: '#14b8a6', border: '#0d9488', text: '#ffffff' },
  { fill: '#f59e0b', border: '#d97706', text: '#1f2937' },
  { fill: '#ec4899', border: '#db2777', text: '#ffffff' },
  { fill: '#6366f1', border: '#4f46e5', text: '#ffffff' },
  { fill: '#84cc16', border: '#65a30d', text: '#1f2937' },
  { fill: '#06b6d4', border: '#0891b2', text: '#ffffff' },
];

const EMPTY_SEAT: CategoryColor = {
  fill: '#f5f5f5',
  border: '#e5e5e5',
  text: '#737373',
};

const PRESIDENTIAL_SEAT: CategoryColor = {
  fill: '#fbbf24',
  border: '#f59e0b',
  text: '#78350f',
};

function hashCategoryName(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

export function getCategoryColor(
  categoryName: string | undefined | null,
  options?: { presidential?: boolean; empty?: boolean },
): CategoryColor {
  if (options?.presidential) {
    return PRESIDENTIAL_SEAT;
  }
  if (options?.empty) {
    return EMPTY_SEAT;
  }
  if (!categoryName?.trim()) {
    return {
      fill: '#a3a3a3',
      border: '#737373',
      text: '#ffffff',
    };
  }
  return CATEGORY_PALETTE[hashCategoryName(categoryName.trim()) % CATEGORY_PALETTE.length];
}
