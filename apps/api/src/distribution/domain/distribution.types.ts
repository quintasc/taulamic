export const MOTOR_VERSION_V0_PILOT = 'v0-pilot' as const;

export type MotorVersion = typeof MOTOR_VERSION_V0_PILOT;

export const DISTRIBUTION_STATUSES = ['draft', 'confirmed'] as const;

export type DistributionStatus = (typeof DISTRIBUTION_STATUSES)[number];

export type GuestPlacement = {
  guestId: string;
  guestName: string;
  tableId: string;
  tableLabel: string;
};

export type HardRuleViolation = {
  code: string;
  message: string;
  guestIds: string[];
};

export type DistributionStats = {
  assignedCount: number;
  unassignedCount: number;
  tableCount: number;
  totalCapacity: number;
};

export type DistributionProposal = {
  id: string;
  eventId: string;
  motorVersion: MotorVersion;
  status: DistributionStatus;
  placements: GuestPlacement[];
  unassignedGuestIds: string[];
  hardRuleViolations: HardRuleViolation[];
  stats: DistributionStats;
  createdAt: string;
  confirmedAt: string | null;
};
