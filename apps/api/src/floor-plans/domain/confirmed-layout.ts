import { PersistedLayoutTable } from './persisted-layout-table';
import { LayoutConfigurationOrigin } from './table-origin';

export type ConfirmedLayout = {
  version: number;
  floorPlanId: string;
  eventId: string;
  status: 'confirmed';
  configurationOrigin: LayoutConfigurationOrigin;
  tables: PersistedLayoutTable[];
  confirmedAt: string;
};
