import { test, expect } from '@playwright/test';

import {
  addTable,
  clickSetupNext,
  importGuestsFromPilotExcel,
  startPilotAdminFlow,
  waitForAutoSaved,
  waitForFloorPlanReady,
} from './helpers/pilot-flow';
import { DISTRIBUTION_COPY } from '../src/lib/ui-copy';

/**
 * ADR-024: con «Agrupar por categoría» activo, el score debe reflejar
 * mesas usadas, equilibrio y huérfanos por categoría.
 */
test.describe('Distribución — reparto proporcional por categoría (ADR-024)', () => {
  test('calcula distribución y muestra detalle de categoría en compatibilidad', async ({
    page,
  }) => {
    await startPilotAdminFlow(page);
    await page.getByLabel('Nombre del evento').fill('E2E categoría ADR-024');
    await clickSetupNext(page, 'Invitados');
    await importGuestsFromPilotExcel(page);

    await clickSetupNext(page, 'Plano');
    await waitForFloorPlanReady(page);
    await clickSetupNext(page, 'Mesas');

    for (let index = 0; index < 10; index += 1) {
      await addTable(page);
    }

    await clickSetupNext(page, 'Afinidades');
    await page.getByRole('button', { name: 'Agrupar por categoría' }).click();
    await waitForAutoSaved(page);

    await clickSetupNext(page, 'Distribución');
    await page
      .getByRole('button', { name: DISTRIBUTION_COPY.calculate.full })
      .first()
      .click();

    await expect(
      page.getByRole('button', { name: DISTRIBUTION_COPY.confirm.full }),
    ).toBeVisible({ timeout: 120_000 });

    await expect(page.getByText('Compatibilidad')).toBeVisible();
    await expect(page.getByText('100%').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'En uso 2' })).toBeVisible();
    await expect(page.getByText('66.7%').first()).toBeVisible();
  });
});
