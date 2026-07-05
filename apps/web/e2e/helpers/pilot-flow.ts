import path from 'node:path';

import { type Page, expect } from '@playwright/test';

import { SAVE_STATUS_COPY } from '../../src/lib/ui-copy';

/** Excel de referencia del piloto (4 invitados, 2 parejas). */
export const PILOT_GUESTS_XLSX = path.resolve(
  __dirname,
  '../../../../docs/pilot/invitados-validacion-manual.xlsx',
);

const CONFIG_URL = /\/admin\/events\/[^/]+\/config$/;

/**
 * Arranque piloto: /admin crea evento y abre Config.
 * Falla con mensaje accionable si API caída o web inconsistente (.next tras build).
 */
export async function startPilotAdminFlow(page: Page) {
  const response = await page.goto('/admin');
  if (response && response.status() >= 500) {
    throw new Error(
      `GET /admin respondió ${response.status()}. Reinicia web (parar dev, borrar apps/web/.next si hace falta) o ejecuta con CI=1.`,
    );
  }

  const apiError = page.getByText(/No se pudo crear el evento/i);
  try {
    await Promise.race([
      expect(page).toHaveURL(CONFIG_URL, { timeout: 60_000 }),
      apiError.waitFor({ state: 'visible', timeout: 60_000 }).then(() => {
        throw new Error(
          'La API no creó el evento (puerto 3000). Arranca npm run dev desde la raíz del monorepo.',
        );
      }),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message.includes('puerto 3000')) {
      throw error;
    }
    throw new Error(
      `Tras /admin no se llegó a Config (URL: ${page.url()}). Comprueba API :3000 y reinicia web si hubo npm run build con dev activo.`,
    );
  }

  await expect(page.getByLabel('Nombre del evento')).toBeVisible();
}

function hrefUrlPattern(href: string): RegExp {
  return new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
}

export async function clickSetupNext(page: Page, stepLabel: string) {
  const pattern = new RegExp(`Siguiente: ${stepLabel}`);
  let linkLocator = page.locator('a').filter({ hasText: pattern });
  let buttonLocator = page.getByRole('button', { name: pattern });

  // Fallback móvil: si no existe la etiqueta 'Siguiente: ...', busca por aria-label (ej. 'Invitados')
  if ((await linkLocator.count()) === 0 && (await buttonLocator.count()) === 0) {
    linkLocator = page.getByRole('link', { name: stepLabel, exact: true });
    buttonLocator = page.getByRole('button', { name: stepLabel, exact: true });
  }

  if ((await linkLocator.count()) > 0) {
    const link = linkLocator.first();
    await expect(link).toBeVisible({ timeout: 15_000 });
    const href = await link.getAttribute('href');
    await link.scrollIntoViewIfNeeded();
    if (href) {
      await link.click({ force: true });
      try {
        await page.waitForURL(hrefUrlPattern(href), { timeout: 5_000 });
      } catch {
        await page.goto(href);
      }
    } else {
      await link.click({ force: true });
    }
    return;
  }

  const button = buttonLocator.first();
  await expect(button).toBeVisible({ timeout: 15_000 });
  await button.click({ force: true });
}

/** Clic en «Siguiente» bloqueado (muestra banner de validación). */
export async function clickBlockedSetupNext(page: Page, stepLabel: string) {
  let buttonLocator = page.getByRole('button', { name: new RegExp(`Siguiente: ${stepLabel}`) });
  if ((await buttonLocator.count()) === 0) {
    buttonLocator = page.getByRole('button', { name: stepLabel, exact: true });
  }
  await buttonLocator.first().click({ force: true });
}

/** Espera confirmación visual de auto-guardado (cabecera). */
export async function waitForAutoSaved(page: Page, timeout = 30_000) {
  await expect(page.getByText(SAVE_STATUS_COPY.saved)).toBeVisible({
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
  await addButton.click({ force: true });
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
  await openDrawer.click({ force: true });
  await page.getByLabel('Nombre').fill(guest.nombre);
  await page.getByLabel('Correo').fill(guest.correo);
  await page.getByLabel('Teléfono').fill(guest.telefono);
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Añadir', exact: true })
    .click({ force: true });
  await expect(
    page
      .locator('table tbody')
      .getByText(guest.nombre, { exact: true })
      .or(page.getByRole('article', { name: guest.nombre })),
  ).toBeVisible({ timeout: 15_000 });
}

export async function importGuestsFromPilotExcel(page: Page) {
  await page
    .locator('input[type="file"][accept*=".xlsx"]')
    .setInputFiles(PILOT_GUESTS_XLSX);
  await page.getByRole('button', { name: 'Importar invitados' }).click({ force: true });
  await expect(page.getByText('Importación completada')).toBeVisible({
    timeout: 30_000,
  });
}

/** Setup hasta Distribución (empty state, sin calcular). */
export async function reachDistributionStep(page: Page) {
  await startPilotAdminFlow(page);
  await page.getByLabel('Nombre del evento').fill('E2E MEJ-13 copy');
  await page.getByLabel('Invitados aproximados').fill('40');
  await clickSetupNext(page, 'Invitados');
  await importGuestsFromPilotExcel(page);
  await clickSetupNext(page, 'Plano');
  await waitForFloorPlanReady(page);
  await clickSetupNext(page, 'Mesas');
  await addTable(page);
  await clickSetupNext(page, 'Afinidades');
  await page.getByRole('button', { name: 'Agrupar por categoría' }).click({ force: true });
  await waitForAutoSaved(page);
  await clickSetupNext(page, 'Distribución');
  await expect(page).toHaveURL(/\/distribution$/);
}
