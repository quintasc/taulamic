import { EditableLayoutTable } from './editable-layout-table';

export type LayoutDraft = {
  floorPlanId: string;
  eventId: string;
  status: 'draft';
  tables: EditableLayoutTable[];
  updatedAt: string;
};
