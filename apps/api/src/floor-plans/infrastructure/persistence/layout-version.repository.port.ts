import { EditableLayoutTable } from '../../domain/editable-layout-table';
import { LayoutVersion, LayoutVersionSummary } from '../../domain/layout-version';
import { LayoutConfigurationOrigin } from '../../domain/table-origin';

export type SaveLayoutVersionInput = {
  eventId: string;
  floorPlanId: string;
  configurationOrigin: LayoutConfigurationOrigin;
  confirmedAt: string;
  tables: EditableLayoutTable[];
};

export type LayoutVersionRepositoryPort = {
  hasAnyVersion(eventId: string, floorPlanId: string): Promise<boolean>;
  saveVersion(input: SaveLayoutVersionInput): Promise<LayoutVersion>;
  getLatestVersion(
    eventId: string,
    floorPlanId: string,
  ): Promise<LayoutVersion | null>;
  getVersion(
    eventId: string,
    floorPlanId: string,
    version: number,
  ): Promise<LayoutVersion | null>;
  listVersionSummaries(
    eventId: string,
    floorPlanId: string,
  ): Promise<LayoutVersionSummary[]>;
};

export const LAYOUT_VERSION_REPOSITORY = Symbol('LAYOUT_VERSION_REPOSITORY');
