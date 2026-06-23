export type RoomShape = 'rectangular' | 'round' | 'oval';

export type RoomSetup = {
  shape: RoomShape;
  widthM: number;
  lengthM: number;
  radiusM: number;
  placedAccessories: string[];
  updatedAt: string;
};

export const MIN_ROOM_DIMENSION_M = 3;
export const MAX_ROOM_DIMENSION_M = 200;
