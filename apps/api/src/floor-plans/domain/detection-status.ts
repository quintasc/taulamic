export const DETECTION_STATUSES = [
  'completed',
  'partial',
  'failed',
] as const;

export type DetectionStatus = (typeof DETECTION_STATUSES)[number];
