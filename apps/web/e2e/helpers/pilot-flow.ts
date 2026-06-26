import path from 'node:path';

import { type Page, expect } from '@playwright/test';

/** Excel de referencia del piloto (4 invitados, 2 parejas). */
export const PILOT_GUESTS_XLSX = path.resolve(
  __dirname,
  '../../../../docs/pilot/invitados-validacion-manual.xlsx',
);

export async function clickSetupNext(page: Page, stepLabel: string) {
  const pattern = new RegExp(`Siguiente: ${stepLabel}`);
  const nextControl = page.getByRole('button', { name: pattern }).or(
    page.getByRole('link', { name: pattern }),
  );
  await expect(nextControl.first()).toBeVisible();
  await nextControl.first().click();
}

/** Clic en «Siguiente» bloqueado (muestra banner de validación). */
export async function clickBlockedSetupNext(page: Page, stepLabel: string) {
  await page
    .getByRole('button', { name: new RegExp(`Siguiente: ${stepLabel}`) })
    .click({ force: true });
}

/** Espera a que el plano termine de hidratar (SetupNavBar visible). */
export async function waitForFloorPlanReady(page: Page) {
  await expect(page.getByText('Cargando plano…')).toHaveCount(0, {
    timeout: 30_000,
  });
  await expect(page.getByText('Plano del salón')).toBeVisible();
}

export async function addTable(page: Page) {
  const addButton = page.getByRole('button', { name: /^Añadir( \d+)? mesa/ });
  await expect(addButton).toBeVisible({ timeout: 30_000 });
  await addButton.click();
}

export async function expectNoGenericSaveButton(page: Page) {
  await expect(
    page.getByRole('button', { name: /^Guardar$/ }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: /Guardar y continuar/i }),
  ).toHaveCount(0);
}

export async function addGuestManually(
  page: Page,
  guest: { nombre: string; correo: string; telefono: string },
) {
  const openDrawer = page
    .getByRole('button', { name: 'Añadir invitado' })
    .first();
  await openDrawer.click();
  await page.getByLabel('Nombre').fill(guest.nombre);
  await page.getByLabel('Correo').fill(guest.correo);
  await page.getByLabel('Teléfono').fill(guest.telefono);
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Añadir', exact: true })
    .click();
  await expect(
    page.locator('table tbody').getByText(guest.nombre, { exact: true }),
  ).toBeVisible({ timeout: 15_000 });
}

export async function importGuestsFromPilotExcel(page: Page) {
  await page
    .locator('input[type="file"][accept*=".xlsx"]')
    .setInputFiles(PILOT_GUESTS_XLSX);
  await page.getByRole('button', { name: 'Importar invitados' }).click();
  await expect(page.getByText('Importación completada')).toBeVisible({
    timeout: 30_000,
  });
}
