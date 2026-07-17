export type CategoryColor = {
  fill: string;
  border: string;
  text: string;
};

/**
 * Paleta de categorías bien separadas en tono (evitar azules/índigos casi iguales).
 * Suficiente para un piloto típico (~6–12 etiquetas) sin colisiones visuales.
 */
const CATEGORY_PALETTE: CategoryColor[] = [
  { fill: '#2563eb', border: '#1d4ed8', text: '#ffffff' }, // azul
  { fill: '#dc2626', border: '#b91c1c', text: '#ffffff' }, // rojo
  { fill: '#059669', border: '#047857', text: '#ffffff' }, // verde
  { fill: '#d97706', border: '#b45309', text: '#ffffff' }, // ámbar
  { fill: '#7c3aed', border: '#6d28d9', text: '#ffffff' }, // violeta
  { fill: '#db2777', border: '#be185d', text: '#ffffff' }, // rosa
  { fill: '#0d9488', border: '#0f766e', text: '#ffffff' }, // teal
  { fill: '#ca8a04', border: '#a16207', text: '#1f2937' }, // mostaza
  { fill: '#ea580c', border: '#c2410c', text: '#ffffff' }, // naranja
  { fill: '#4f46e5', border: '#4338ca', text: '#ffffff' }, // índigo
  { fill: '#65a30d', border: '#4d7c0f', text: '#ffffff' }, // lima
  { fill: '#0891b2', border: '#0e7490', text: '#ffffff' }, // cian
  { fill: '#9333ea', border: '#7e22ce', text: '#ffffff' }, // púrpura
  { fill: '#e11d48', border: '#be123c', text: '#ffffff' }, // rose
  { fill: '#15803d', border: '#166534', text: '#ffffff' }, // verde bosque
  { fill: '#1e40af', border: '#1e3a8a', text: '#ffffff' }, // azul oscuro
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

const UNCATEGORIZED: CategoryColor = {
  fill: '#a3a3a3',
  border: '#737373',
  text: '#ffffff',
};

export function normalizeCategoryColorKey(
  categoryName: string | undefined | null,
): string {
  return categoryName?.trim() ?? '';
}

/** Lista única ordenada (estable entre pantallas / PDF). */
export function uniqueSortedCategoryNames(
  categoryNames: readonly (string | undefined | null)[],
): string[] {
  const unique = new Set<string>();
  for (const name of categoryNames) {
    const key = normalizeCategoryColorKey(name);
    if (key) {
      unique.add(key);
    }
  }
  return [...unique].sort((left, right) =>
    left.localeCompare(right, 'es', { sensitivity: 'base' }),
  );
}

/**
 * Asigna un color distinto a cada categoría del evento (por índice ordenado).
 * Evita colisiones del hash cuando dos nombres caen en el mismo slot de paleta.
 */
export function buildCategoryColorLookup(
  categoryNames: readonly (string | undefined | null)[],
): ReadonlyMap<string, CategoryColor> {
  const sorted = uniqueSortedCategoryNames(categoryNames);
  const lookup = new Map<string, CategoryColor>();
  sorted.forEach((name, index) => {
    lookup.set(name, CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]);
  });
  return lookup;
}

export function getCategoryColor(
  categoryName: string | undefined | null,
  options?: {
    presidential?: boolean;
    empty?: boolean;
    /** Mapa del evento: garantiza colores distintos entre categorías conocidas. */
    colorLookup?: ReadonlyMap<string, CategoryColor>;
  },
): CategoryColor {
  if (options?.presidential) {
    return PRESIDENTIAL_SEAT;
  }
  if (options?.empty) {
    return EMPTY_SEAT;
  }
  const key = normalizeCategoryColorKey(categoryName);
  if (!key) {
    return UNCATEGORIZED;
  }
  const fromLookup = options?.colorLookup?.get(key);
  if (fromLookup) {
    return fromLookup;
  }
  // Fallback si no hay lookup (p. ej. categoría suelta): hash sobre paleta ampliada.
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) | 0;
  }
  return CATEGORY_PALETTE[Math.abs(hash) % CATEGORY_PALETTE.length];
}
