import { test, expect } from '@playwright/test';

import {
  clickSetupNext,
  importGuestsFromPilotExcel,
  startPilotAdminFlow,
} from './helpers/pilot-flow';

const MOBILE_VIEWPORT = { width: 390, height: 844 };

test.describe('Plano — vista móvil', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('controles arriba y lienzo compacto', async ({ page }) => {
    await startPilotAdminFlow(page);
    await page.getByLabel('Nombre del evento').fill('E2E plano móvil');
    await page.getByLabel('Invitados aproximados').fill('80');
    await clickSetupNext(page, 'Invitados');
    await importGuestsFromPilotExcel(page);
    await clickSetupNext(page, 'Plano');

    await expect(page).toHaveURL(/\/floor-plan$/);
    await expect(page.getByText('Plano del salón')).toBeVisible();
    await expect(page.getByText('~', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Forma', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Rectang.' })).toBeVisible();
    await expect(page.getByLabel('Ancho (m)')).toBeVisible();
    await expect(
      page.getByText('Vista previa escalada al tamaño de pantalla', { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Aplicar tamaño recomendado' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Redimensionar salón' }),
    ).toHaveCount(0);
  });
});
