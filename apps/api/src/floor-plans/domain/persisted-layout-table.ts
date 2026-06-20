import { TableOrigin } from './table-origin';
import { TableShape } from './table-shape';

export type LayoutTableAudit = {
  wasAutoDetected: boolean;
  wasManuallyCorrected: boolean;
  detectionConfidence?: number;
};

export type PersistedLayoutTable = {
  id: string;
  label: string;
  shape: TableShape;
  estimatedCapacity: number;
  origin: TableOrigin;
  audit: LayoutTableAudit;
};
