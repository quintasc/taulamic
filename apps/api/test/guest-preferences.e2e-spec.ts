import { readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import ExcelJS from 'exceljs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter';
import {
  GUEST_TEMPLATE_COLUMNS,
  GUEST_TEMPLATE_SHEET_NAME,
} from '../src/guest-import/domain/guest-template.schema';

describe('Preference permissions enforcement (e2e #33)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new ApiExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    await rm(join(process.cwd(), 'uploads', 'events'), {
      recursive: true,
      force: true,
    });
    await rm(join(process.cwd(), 'uploads', 'guests'), {
      recursive: true,
      force: true,
    });
  });

  it('expone permisos de UI segun modo y rol', async () => {
    const colaborativo = await request(app.getHttpServer())
      .get('/api/v1/events/evt_123/preference-control-mode/permissions')
      .query({ actorRole: 'guest' })
      .expect(200);

    expect(colaborativo.body).toMatchObject({
      eventId: 'evt_123',
      mode: 'colaborativo',
      actorRole: 'guest',
      canEditGuestPreferences: true,
      feedbackMessage: null,
    });

    await request(app.getHttpServer())
      .put('/api/v1/events/evt_123/preference-control-mode')
      .set('Content-Type', 'application/json')
      .send({ mode: 'anfitrion_exclusivo' })
      .expect(200);

    const exclusivo = await request(app.getHttpServer())
      .get('/api/v1/events/evt_123/preference-control-mode/permissions')
      .query({ actorRole: 'guest' })
      .expect(200);

    expect(exclusivo.body).toMatchObject({
      canEditGuestPreferences: false,
    });
    expect(exclusivo.body.feedbackMessage).toContain('anfitrion');
  });

  it('bloquea edicion de invitado en anfitrion_exclusivo y permite en colaborativo', async () => {
    const guestId = await seedGuest(app, 'evt_perm_33');

    await request(app.getHttpServer())
      .put('/api/v1/events/evt_perm_33/preference-control-mode')
      .set('Content-Type', 'application/json')
      .send({ mode: 'anfitrion_exclusivo' })
      .expect(200);

    const blocked = await request(app.getHttpServer())
      .post(`/api/v1/events/evt_perm_33/guests/${guestId}/restrictions`)
      .set('Content-Type', 'application/json')
      .set('x-taulame-actor-role', 'guest')
      .send({
        kind: 'afinidad',
        targetHint: 'Maria Lopez',
        description: 'Prefiere sentar con Maria Lopez',
      })
      .expect(403);

    expect(blocked.body.code).toBe('PREF-001');

    await request(app.getHttpServer())
      .put('/api/v1/events/evt_perm_33/preference-control-mode')
      .set('Content-Type', 'application/json')
      .send({ mode: 'colaborativo' })
      .expect(200);

    const allowed = await request(app.getHttpServer())
      .post(`/api/v1/events/evt_perm_33/guests/${guestId}/restrictions`)
      .set('Content-Type', 'application/json')
      .set('x-taulame-actor-role', 'guest')
      .send({
        kind: 'afinidad',
        targetHint: 'Maria Lopez',
        description: 'Prefiere sentar con Maria Lopez',
      })
      .expect(200);

    expect(allowed.body).toMatchObject({
      kind: 'afinidad',
      origin: 'manual',
    });
  });

  it('permite admin editar en anfitrion_exclusivo', async () => {
    const guestId = await seedGuest(app, 'evt_perm_33_admin');

    await request(app.getHttpServer())
      .put('/api/v1/events/evt_perm_33_admin/preference-control-mode')
      .set('Content-Type', 'application/json')
      .send({ mode: 'anfitrion_exclusivo' })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/events/evt_perm_33_admin/guests/${guestId}/restrictions`)
      .set('Content-Type', 'application/json')
      .set('x-taulame-actor-role', 'admin')
      .send({
        kind: 'incompatibilidad',
        targetHint: 'Juan Perez',
        description: 'No sentar con Juan Perez',
      })
      .expect(200);
  });

  it('bloquea gestion de sugerencias a invitados', async () => {
    const guestId = await seedGuest(app, 'evt_sugg_perm', 'Intolerancia lactosa');
    void guestId;

    const suggestions = await request(app.getHttpServer())
      .get('/api/v1/events/evt_sugg_perm/guest-import/suggestions')
      .expect(200);

    const suggestionId = suggestions.body.suggestions[0].id;

    const response = await request(app.getHttpServer())
      .post(
        `/api/v1/events/evt_sugg_perm/guest-import/suggestions/${suggestionId}/accept`,
      )
      .set('x-taulame-actor-role', 'guest')
      .expect(403);

    expect(response.body.code).toBe('ADMIN_REQUIRED');
  });
});

async function seedGuest(
  app: INestApplication<App>,
  eventId: string,
  observaciones = '',
): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(GUEST_TEMPLATE_SHEET_NAME);
  sheet.addRow([...GUEST_TEMPLATE_COLUMNS]);
  sheet.addRow([
    'Ana Garcia',
    'ana@ejemplo.com',
    '+34600111222',
    '',
    '',
    '',
    observaciones,
    '',
    '',
    '',
  ]);
  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

  await request(app.getHttpServer())
    .post(`/api/v1/events/${eventId}/guest-import/import`)
    .attach('file', buffer, {
      filename: 'invitados.xlsx',
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    .expect(200);

  const raw = await readFile(
    join(process.cwd(), 'uploads', 'guests', eventId, 'event-guests.json'),
    'utf8',
  );
  const store = JSON.parse(raw);
  return store.guests[0].id as string;
}
