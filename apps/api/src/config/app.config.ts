export const appConfig = () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  floorPlan: {
    maxBytes: parseInt(
      process.env.FLOOR_PLAN_MAX_BYTES ?? String(10 * 1024 * 1024),
      10,
    ),
    uploadDir: process.env.FLOOR_PLAN_UPLOAD_DIR ?? 'uploads/floor-plans',
  },
  guestImport: {
    dataDir: process.env.GUEST_IMPORT_DATA_DIR ?? 'uploads/guests',
  },
  events: {
    dataDir: process.env.EVENTS_DATA_DIR ?? 'uploads/events',
  },
  distribution: {
    /** Motor de distribucion: 'v1' (CP-SAT ADR-023, por defecto) o 'v0' (greedy piloto). */
    engine: process.env.DISTRIBUTION_ENGINE ?? 'v1',
  },
});
