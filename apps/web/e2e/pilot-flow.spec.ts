import { test, expect } from '@playwright/test';

import {
  addGuestManually,
  addTable,
  clickBlockedSetupNext,
  clickSetupNext,
  expectNoGenericSaveButton,
  importGuestsFromPilotExcel,
  waitForAutoSaved,
  waitForFloorPlanReady,
} from './helpers/pilot-flow';

/**
 * Flujo feliz del guion `docs/agile/guion-validacion-piloto-ui.md`.
 * La validacion manual con evidencias en `docs/agile/evidencias-piloto/`
 * sigue siendo obligatoria para el cierre del piloto (DECISION-002).
 */
test.describe('Piloto UI — flujo guion (Playwright)', () => {
  test('A–G: setup admin de punta a punta', async ({ page }) => {
    // A — Arranque: /admin crea evento y abre config
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/events\/[^/]+\/config$/);
    await expect(page.getByLabel('Nombre del evento')).toHaveValue('');
    await expectNoGenericSaveButton(page);

    // Bloqueo sin nombre
    await clickBlockedSetupNext(page, 'Invitados');
    await expect(
      page.getByText('Indica el nombre del evento para continuar'),
    ).toBeVisible();

    await page
      .getByLabel('Nombre del evento')
      .fill('Boda piloto Playwright E2E');
    await page.getByLabel('Invitados aproximados').fill('80');

    // Config persiste al pulsar Siguiente (onBeforeNext); no depender del debounce.
    await clickSetupNext(page, 'Invitados');
    await expect(page).toHaveURL(/\/guests$/);

    // B — Invitados (Excel piloto)
    await importGuestsFromPilotExcel(page);

    await clickSetupNext(page, 'Plano');
    await expect(page).toHaveURL(/\/floor-plan$/);
    await expectNoGenericSaveButton(page);

    // D — Plano Fase A (auto-save al cargar/editar)
    await waitForFloorPlanReady(page);
    await expectNoGenericSaveButton(page);
    await clickSetupNext(page, 'Mesas');

    // E — Mesas
    await addTable(page);
    await addTable(page);

    await clickSetupNext(page, 'Afinidades');
    await expect(page).toHaveURL(/\/preferences$/);
    await expectNoGenericSaveButton(page);

    await page
      .getByRole('button', { name: 'Agrupar por categoría' })
      .click();
    await waitForAutoSaved(page);

    await clickSetupNext(page, 'Distribución');
    await expect(page).toHaveURL(/\/distribution$/);

    // G — Distribución
    await page
      .getByRole('button', { name: 'Calcular distribución' })
      .first()
      .click();
    await expect(
      page.getByRole('button', { name: 'Confirmar distribución' }),
    ).toBeVisible({ timeout: 30_000 });

    await page.getByRole('button', { name: 'Confirmar distribución' }).click();
    await expect(page.getByText('Distribución confirmada')).toBeVisible({
      timeout: 20_000,
    });
  });

  test('patrones UX: alta manual', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/config$/);

    await page.getByLabel('Nombre del evento').fill('Evento patrones UX');
    await clickSetupNext(page, 'Invitados');

    await addGuestManually(page, {
      nombre: 'Test Manual',
      correo: 'test@ejemplo.com',
      telefono: '+34600111222',
    });

    await clickSetupNext(page, 'Plano');
    await expect(page).toHaveURL(/\/floor-plan$/);
  });

  test('C: paso Tarjetas bloqueado', async ({ page }) => {
    await page.goto('/admin');
    await page.getByLabel('Nombre del evento').fill('Evento tarjetas');
    await clickSetupNext(page, 'Invitados');
    await importGuestsFromPilotExcel(page);

    const eventId = page.url().match(/events\/([^/]+)/)?.[1];
    expect(eventId).toBeTruthy();
    await page.goto(`/admin/events/${eventId}/invitations`);

    await expect(
      page.getByText('Próximamente — disponible tras el piloto'),
    ).toBeVisible();
    await expect(
      page.getByTitle('Próximamente — disponible tras el piloto (HU-10)'),
    ).toBeVisible();
  });
});
