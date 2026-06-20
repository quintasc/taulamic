import { PersistedLayoutTable } from './persisted-layout-table';
import { LayoutConfigurationOrigin } from './table-origin';

export type LayoutVersion = {
  version: number;
  floorPlanId: string;
  eventId: string;
  configurationOrigin: LayoutConfigurationOrigin;
  confirmedAt: string;
  tables: PersistedLayoutTable[];
};

export type LayoutVersionSummary = {
  version: number;
  confirmedAt: string;
  configurationOrigin: LayoutConfigurationOrigin;
  tableCount: number;
};

export type LayoutVersionStore = {
  floorPlanId: string;
  eventId: string;
  latestVersion: number;
  versions: LayoutVersion[];
};
