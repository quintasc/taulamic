import { DetectedTable } from './detected-table';
import { DetectionStatus } from './detection-status';

export type DetectionResult = {
  floorPlanId: string;
  eventId: string;
  status: DetectionStatus;
  tables: DetectedTable[];
  manualFallbackAvailable: true;
  detectedAt: string;
  message?: string;
};
