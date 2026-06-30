import path from 'node:path';

import { type Page, expect } from '@playwright/test';

/** Excel de referencia del piloto (4 invitados, 2 parejas). */
export const PILOT_GUESTS_XLSX = path.resolve(
  __dirname,
  '../../../../docs/pilot/invitados-validacion-manual.xlsx',
);

function hrefUrlPattern(href: string): RegExp {
  return new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
}

export async function clickSetupNext(page: Page, stepLabel: string) {
  const pattern = new RegExp(`Siguiente: ${stepLabel}`);
  const linkLocator = page.locator('a').filter({ hasText: pattern });
  const buttonLocator = page.getByRole('button', { name: pattern });

  if ((await linkLocator.count()) > 0) {
    const link = linkLocator.first();
    await expect(link).toBeVisible({ timeout: 15_000 });
    const href = await link.getAttribute('href');
    await link.scrollIntoViewIfNeeded();
    if (href) {
      await link.click();
      try {
        await page.waitForURL(hrefUrlPattern(href), { timeout: 5_000 });
      } catch {
        await page.goto(href);
      }
    } else {
      await link.click();
    }
    return;
  }

  const button = buttonLocator.first();
  await expect(button).toBeVisible({ timeout: 15_000 });
  await button.click();
}

/** Clic en «Siguiente» bloqueado (muestra banner de validación). */
export async function clickBlockedSetupNext(page: Page, stepLabel: string) {
  await page
    .getByRole('button', { name: new RegExp(`Siguiente: ${stepLabel}`) })
    .click({ force: true });
}

/** Espera confirmación visual de auto-guardado (cabecera). */
export async function waitForAutoSaved(page: Page, timeout = 30_000) {
  await expect(page.getByText('Guardado automáticamente')).toBeVisible({
    timeout,
  });
}

/** Espera a que el plano termine de hidratar y «Siguiente» esté operativo. */
export async function waitForFloorPlanReady(page: Page) {
  await expect(page.getByText('Cargando plano…')).toHaveCount(0, {
    timeout: 30_000,
  });
  await expect(page.getByText('Plano del salón')).toBeVisible();
  await expect(page.getByRole('link', { name: /Siguiente: Mesas/ }).or(
    page.locator('a').filter({ hasText: /Siguiente: Mesas/ }),
  )).toBeVisible({ timeout: 30_000 });
}

export async function addTable(page: Page) {
  const addButton = page.getByRole('button', { name: /^Añadir( \d+)? mesa/ });
  await expect(addButton).toBeVisible({ timeout: 30_000 });
  const rows = page.locator('table tbody tr');
  const countBefore = await rows.count();
  await addButton.click();
  await expect(rows).toHaveCount(countBefore + 1, { timeout: 15_000 });
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
