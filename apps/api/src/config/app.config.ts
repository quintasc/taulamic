export const appConfig = () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  floorPlan: {
    maxBytes: parseInt(
      process.env.FLOOR_PLAN_MAX_BYTES ?? String(10 * 1024 * 1024),
      10,
    ),
    uploadDir: process.env.FLOOR_PLAN_UPLOAD_DIR ?? 'uploads/floor-plans',
  },
});
