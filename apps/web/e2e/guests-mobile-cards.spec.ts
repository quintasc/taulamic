import { test, expect } from '@playwright/test';

import { reachDistributionStep } from './helpers/pilot-flow';

const MOBILE_VIEWPORT = { width: 390, height: 844 };

test.describe('Invitados — vista móvil en tarjetas', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('lista en tarjetas con plantilla, buscador y filtros', async ({
    page,
  }) => {
    await reachDistributionStep(page);
    await page.goto(page.url().replace(/\/distribution$/, '/guests'));

    await expect(page.getByText('Plantilla Excel')).toBeVisible();
    await expect(
      page.getByRole('searchbox', {
        name: 'Buscar invitados por nombre, correo, teléfono o categoría',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Filtros/ }),
    ).toBeVisible();
    await expect(page.getByRole('article').first()).toBeVisible();
    await expect(
      page.locator('.card-admin table').first(),
    ).toBeHidden();
  });

  test('filtro desplegable reduce resultados visibles', async ({ page }) => {
    await reachDistributionStep(page);
    await page.goto(page.url().replace(/\/distribution$/, '/guests'));
    await expect(page.getByRole('article').first()).toBeVisible({
      timeout: 30_000,
    });

    const initialCount = await page.getByRole('article').count();
    expect(initialCount).toBeGreaterThan(0);

    await page.getByRole('button', { name: /Filtros/ }).click();
    await page
      .getByRole('listbox', { name: 'Filtrar invitados' })
      .getByRole('button', { name: 'Menú especial' })
      .click();

    await expect(page.getByText('(filtro activo)')).toBeVisible();
    const filteredCount = await page.getByRole('article').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('tarjetas contraídas por defecto y expandir uno o todos', async ({
    page,
  }) => {
    await reachDistributionStep(page);
    await page.goto(page.url().replace(/\/distribution$/, '/guests'));
    await expect(page.getByRole('article').first()).toBeVisible({
      timeout: 30_000,
    });

    const articles = page.getByRole('article');
    const guestCount = await articles.count();
    expect(guestCount).toBeGreaterThan(1);

    if (guestCount > 8) {
      await expect(articles.first()).toHaveAttribute('aria-expanded', 'false');
    } else {
      await page.getByRole('button', { name: 'Contraer todos' }).click();
    }
    await expect(articles.first()).toHaveAttribute('aria-expanded', 'false');

    await articles
      .first()
      .getByRole('button', { name: /Expandir detalle de/ })
      .click();
    await expect(articles.first()).toHaveAttribute('aria-expanded', 'true');

    await page.getByRole('button', { name: 'Expandir todos' }).click();
    for (let i = 0; i < guestCount; i += 1) {
      await expect(articles.nth(i)).toHaveAttribute('aria-expanded', 'true');
    }

    await page.getByRole('button', { name: 'Contraer todos' }).click();
    for (let i = 0; i < guestCount; i += 1) {
      await expect(articles.nth(i)).toHaveAttribute('aria-expanded', 'false');
    }
  });
});
