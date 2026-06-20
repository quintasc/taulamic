export type TableDetectionInput = {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
};

export type RawDetectedTableCandidate = {
  label: string;
  rawShape?: string;
  estimatedCapacity?: number;
  hasExplicitShape: boolean;
  hasExplicitCapacity: boolean;
};

export type TableDetectionPort = {
  detect(input: TableDetectionInput): Promise<RawDetectedTableCandidate[]>;
};

export const TABLE_DETECTION_PORT = Symbol('TABLE_DETECTION_PORT');
