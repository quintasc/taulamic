import { TableShape } from './table-shape';

export const PROXIMITY_KINDS = [
  'adyacente',
  'enfrente',
  'mismo_lateral',
] as const;

export type ProximityKind = (typeof PROXIMITY_KINDS)[number];

export type SeatRef = {
  index: number;
  label: string;
};

export type SeatProximity = {
  from: number;
  to: number;
  kind: ProximityKind;
};

export type TableSeatTopology = {
  shape: TableShape;
  capacity: number;
  seats: SeatRef[];
  proximities: SeatProximity[];
};
