import { TableOrigin } from './table-origin';
import { TableShape } from './table-shape';

export type EditableLayoutTable = {
  id: string;
  label: string;
  shape: TableShape;
  estimatedCapacity: number;
  confidence?: number;
  origin: TableOrigin;
};
