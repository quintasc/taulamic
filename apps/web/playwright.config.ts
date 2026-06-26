import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001';
const apiHealthUrl =
  process.env.PLAYWRIGHT_API_HEALTH_URL ?? 'http://localhost:3000/api/docs';

/**
 * E2E UI alineado con `docs/agile/guion-validacion-piloto-ui.md`.
 * Complementa (no sustituye) la validacion manual con evidencias.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'es-ES',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run start:dev',
      cwd: '../api',
      url: apiHealthUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command: 'npm run dev',
      cwd: '.',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
