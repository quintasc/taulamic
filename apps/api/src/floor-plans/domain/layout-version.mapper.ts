import { ConfirmedLayout } from './confirmed-layout';
import { EditableLayoutTable } from './editable-layout-table';
import { LayoutVersion } from './layout-version';
import { PersistedLayoutTable } from './persisted-layout-table';
import { LayoutConfigurationOrigin } from './table-origin';

export function toPersistedLayoutTable(
  table: EditableLayoutTable,
): PersistedLayoutTable {
  const wasAutoDetected =
    table.origin === 'detected' || table.origin === 'detected_edited';
  const wasManuallyCorrected =
    table.origin === 'manual' || table.origin === 'detected_edited';

  return {
    id: table.id,
    label: table.label,
    shape: table.shape,
    estimatedCapacity: table.estimatedCapacity,
    origin: table.origin,
    audit: {
      wasAutoDetected,
      wasManuallyCorrected,
      detectionConfidence: table.confidence,
    },
  };
}

export function createLayoutVersion(input: {
  version: number;
  floorPlanId: string;
  eventId: string;
  configurationOrigin: LayoutConfigurationOrigin;
  confirmedAt: string;
  tables: EditableLayoutTable[];
}): LayoutVersion {
  return {
    version: input.version,
    floorPlanId: input.floorPlanId,
    eventId: input.eventId,
    configurationOrigin: input.configurationOrigin,
    confirmedAt: input.confirmedAt,
    tables: input.tables.map(toPersistedLayoutTable),
  };
}

export function toLayoutVersionSummary(version: LayoutVersion) {
  return {
    version: version.version,
    confirmedAt: version.confirmedAt,
    configurationOrigin: version.configurationOrigin,
    tableCount: version.tables.length,
  };
}

export function layoutVersionToConfirmedLayout(
  version: LayoutVersion,
): ConfirmedLayout {
  return {
    version: version.version,
    floorPlanId: version.floorPlanId,
    eventId: version.eventId,
    status: 'confirmed',
    configurationOrigin: version.configurationOrigin,
    tables: version.tables,
    confirmedAt: version.confirmedAt,
  };
}
