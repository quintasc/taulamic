import { test, expect } from '@playwright/test';

import { marketingCards } from '../src/components/marketing/marketing-cards';

const MOBILE_VIEWPORT = { width: 390, height: 844 };

test.describe('Landing — header y anclas de segmento', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('móvil: logo con wordmark y acceso piloto por icono', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('img', { name: 'Taulamic' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Acceder al piloto' }),
    ).toBeVisible();
  });

  test('móvil: menú Soluciones navega a cada tipo de evento', async ({
    page,
  }) => {
    await page.goto('/');

    for (const card of marketingCards) {
      await page.getByRole('button', { name: 'Soluciones' }).click();
      await page
        .getByRole('link', { name: new RegExp(`^${card.navLabel}`) })
        .click();

      await expect(page).toHaveURL(new RegExp(`#${card.anchorId}$`));

      const segment = page.locator(`#${card.anchorId}`);
      await expect(segment).toBeVisible();

      const headerBottom = await page
        .locator('header')
        .evaluate((el) => el.getBoundingClientRect().bottom);
      const segmentTop = await segment.evaluate((el) =>
        el.getBoundingClientRect().top,
      );

      expect(segmentTop).toBeGreaterThanOrEqual(headerBottom - 4);
      expect(segmentTop).toBeLessThan(headerBottom + 48);

      await page.goto('/');
    }
  });

  test('escritorio: enlaces directos a segmentos', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    for (const card of marketingCards) {
      await page
        .getByRole('navigation', { name: 'Tipos de evento' })
        .getByRole('link', { name: card.navLabel, exact: true })
        .click();

      await expect(page).toHaveURL(new RegExp(`#${card.anchorId}$`));
      await expect(page.locator(`#${card.anchorId}`)).toBeVisible();

      await page.goto('/');
    }
  });
});
