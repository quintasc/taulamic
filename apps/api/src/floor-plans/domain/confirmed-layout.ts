import { EditableLayoutTable } from './editable-layout-table';
import { LayoutConfigurationOrigin } from './table-origin';

export type ConfirmedLayout = {
  floorPlanId: string;
  eventId: string;
  status: 'confirmed';
  configurationOrigin: LayoutConfigurationOrigin;
  tables: EditableLayoutTable[];
  confirmedAt: string;
};
