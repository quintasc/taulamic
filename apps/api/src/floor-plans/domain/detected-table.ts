import { TableShape } from './table-shape';

export type DetectedTable = {
  id: string;
  label: string;
  shape: TableShape;
  estimatedCapacity: number;
  confidence: number;
};
