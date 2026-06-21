import { TABLE_SHAPES, TableShape } from './table-shape';

export type TableShapeCatalogEntry = {
  shape: TableShape;
  label: string;
  description: string;
  minCapacity: number;
  maxCapacity: number;
};

export const TABLE_SHAPE_CATALOG: TableShapeCatalogEntry[] = [
  {
    shape: 'redonda',
    label: 'Redonda',
    description:
      'Asientos en circulo. Vecindad: adyacente en el arco, enfrente en el diametro opuesto (capacidad par).',
    minCapacity: 2,
    maxCapacity: 50,
  },
  {
    shape: 'rectangular',
    label: 'Rectangular',
    description:
      'Asientos en dos lados largos enfrentados. Vecindad: adyacente en el mismo lado, enfrente al otro lado.',
    minCapacity: 2,
    maxCapacity: 50,
  },
  {
    shape: 'imperial',
    label: 'Imperial',
    description:
      'Disposicion en U. Vecindad a lo largo de la U, enfrente en la apertura entre extremos opuestos.',
    minCapacity: 6,
    maxCapacity: 50,
  },
  {
    shape: 'ovalada',
    label: 'Ovalada',
    description:
      'Similar a redonda con arco alargado. Mismas reglas de proximidad circulares que la mesa redonda.',
    minCapacity: 2,
    maxCapacity: 50,
  },
];

export function listTableShapeCatalog(): TableShapeCatalogEntry[] {
  return TABLE_SHAPE_CATALOG.filter((entry) =>
    (TABLE_SHAPES as readonly string[]).includes(entry.shape),
  );
}
