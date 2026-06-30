import { test, expect } from '@playwright/test';

import {
  clickBlockedSetupNext,
  reachDistributionStep,
  startPilotAdminFlow,
} from './helpers/pilot-flow';
import { DISTRIBUTION_COPY, PILOT_COPY, SETUP_NAV_COPY } from '../src/lib/ui-copy';

const MOBILE_VIEWPORT = { width: 390, height: 844 };

/**
 * Smoke MEJ-13 D — copy canónico y responsive.
 * Complementa validación manual PO (`guion-validacion-mej-13-ui.md` §Fase D).
 */
test.describe('MEJ-13 D — ui-copy smoke', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('Config: hints y copy piloto desde ui-copy', async ({ page }) => {
    await startPilotAdminFlow(page);
    await expect(
      page.getByRole('button', { name: 'Abrir menú de navegación' }),
    ).toBeVisible();
    await expect(page.getByText(PILOT_COPY.collaborativeConfigNote)).toBeVisible();

    await clickBlockedSetupNext(page, 'Invitados');
    await expect(page.getByText(SETUP_NAV_COPY.configNameRequired)).toBeVisible();
  });

  test('Admin: menú hamburguesa abre navegación en móvil', async ({ page }) => {
    await startPilotAdminFlow(page);
    await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
    const menu = page.getByRole('dialog', { name: 'Menú de navegación' });
    await expect(menu).toBeVisible();
    await menu.getByRole('link', { name: 'Invitados' }).click();
    await expect(page).toHaveURL(/\/guests$/);
    await expect(menu).toHaveCount(0);
  });

  test('Distribución: etiqueta corta móvil + aria-label completo', async ({
    page,
  }) => {
    await reachDistributionStep(page);

    const calcBtn = page
      .getByRole('button', { name: DISTRIBUTION_COPY.calculate.full })
      .first();
    await expect(calcBtn).toBeVisible();
    await expect(calcBtn).toHaveAttribute(
      'aria-label',
      DISTRIBUTION_COPY.calculate.full,
    );
    await expect(
      calcBtn.getByText(DISTRIBUTION_COPY.calculate.short, { exact: true }),
    ).toBeVisible();
    await expect(calcBtn.locator('span.hidden.md\\:inline')).toBeHidden();

    const prevLink = page.getByRole('link', {
      name: 'Anterior: Afinidades',
    });
    await expect(prevLink).toBeVisible();
    const nextLink = page.getByRole('link', {
      name: 'Siguiente: Dashboard',
    });
    await expect(nextLink).toBeVisible();
  });
});
