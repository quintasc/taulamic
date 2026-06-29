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
  GUEST_TEMPLATE_LEGACY_IMPORT_HEADERS,
  GUEST_TEMPLATE_SHEET_NAME,
} from '../src/guest-import/domain/guest-template.schema';

/**
 * Suite E2E consolidada EP-13 (#36).
 * Recorre HU-38 (modo), HU-39 (permisos) y HU-40 (acompanantes) + auditoria (#35).
 */
describe('EP-13 governance consolidated flow (e2e #36)', () => {
  const eventId = 'evt_ep13_consolidated';
  let app: INestApplication<App>;
  let guestId: string;

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

    guestId = await importCompanionPair(app, eventId);
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

  it('recorre modo, permisos, acompanantes y auditoria de gobernanza de punta a punta', async () => {
    const defaultMode = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/preference-control-mode`)
      .expect(200);

    expect(defaultMode.body).toMatchObject({
      eventId,
      mode: 'colaborativo',
      version: 0,
    });

    const colaborativoPermissions = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/preference-control-mode/permissions`)
      .query({ actorRole: 'guest' })
      .expect(200);

    expect(colaborativoPermissions.body).toMatchObject({
      mode: 'colaborativo',
      actorRole: 'guest',
      canEditGuestPreferences: true,
      feedbackMessage: null,
    });

    const companionGroups = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/companion-groups`)
      .expect(200);

    expect(companionGroups.body.groups).toHaveLength(1);
    expect(companionGroups.body.groups[0]).toMatchObject({
      key: 'PAREJA_001',
      keepTogether: true,
      exception: null,
    });

    await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/guests/${guestId}/restrictions`)
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'guest')
      .send({
        kind: 'afinidad',
        targetHint: 'Luis Martinez Ruiz',
        description: 'Prefiere sentar con Luis Martinez Ruiz',
      })
      .expect(200);

    const guestSeparationBlocked = await request(app.getHttpServer())
      .post(
        `/api/v1/events/${eventId}/companion-groups/PAREJA_001/separate`,
      )
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'guest')
      .send({ reason: 'Intento invitado' })
      .expect(403);

    expect(guestSeparationBlocked.body.code).toBe('ADMIN_REQUIRED');

    const modeChange = await request(app.getHttpServer())
      .put(`/api/v1/events/${eventId}/preference-control-mode`)
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'admin')
      .send({ mode: 'anfitrion_exclusivo' })
      .expect(200);

    expect(modeChange.body).toMatchObject({
      eventId,
      mode: 'anfitrion_exclusivo',
      version: 1,
    });

    const exclusivoPermissions = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/preference-control-mode/permissions`)
      .query({ actorRole: 'guest' })
      .expect(200);

    expect(exclusivoPermissions.body).toMatchObject({
      canEditGuestPreferences: false,
    });
    expect(exclusivoPermissions.body.feedbackMessage).toContain('anfitrion');

    const guestEditBlocked = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/guests/${guestId}/restrictions`)
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'guest')
      .send({
        kind: 'incompatibilidad',
        targetHint: 'Otro invitado',
        description: 'No sentar con otro invitado',
      })
      .expect(403);

    expect(guestEditBlocked.body.code).toBe('PREF-001');

    await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/guests/${guestId}/restrictions`)
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'admin')
      .send({
        kind: 'incompatibilidad',
        targetHint: 'Invitado externo',
        description: 'No sentar con invitado externo',
      })
      .expect(200);

    await request(app.getHttpServer())
      .post(
        `/api/v1/events/${eventId}/companion-groups/PAREJA_001/separate`,
      )
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'admin')
      .send({ reason: 'Separacion acordada con los novios' })
      .expect(200);

    const separated = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/companion-groups`)
      .expect(200);

    expect(separated.body.groups[0]).toMatchObject({
      keepTogether: false,
      exception: {
        reason: 'Separacion acordada con los novios',
        origin: 'admin',
      },
    });

    const revisions = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/preference-control-mode/revisions`)
      .expect(200);

    expect(revisions.body.revisions[0]).toMatchObject({
      actorRole: 'admin',
      mode: 'anfitrion_exclusivo',
      previousMode: null,
    });

    const guestAuditBlocked = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/governance-audit`)
      .set('x-taulamic-actor-role', 'guest')
      .expect(403);

    expect(guestAuditBlocked.body.code).toBe('ADMIN_REQUIRED');

    const audit = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/governance-audit`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(200);

    expect(audit.body.entries.length).toBeGreaterThanOrEqual(2);

    const modeAudit = audit.body.entries.find(
      (entry: { type: string }) => entry.type === 'preference_mode_changed',
    );
    expect(modeAudit).toMatchObject({
      actorRole: 'admin',
      before: { mode: null, version: 0 },
      after: { mode: 'anfitrion_exclusivo', version: 1 },
    });

    const companionAudit = audit.body.entries.find(
      (entry: {
        type: string;
        after: { origin: string; reason: string };
      }) =>
        entry.type === 'companion_separation_changed' &&
        entry.after.reason === 'Separacion acordada con los novios',
    );
    expect(companionAudit).toMatchObject({
      actorRole: 'admin',
      after: { origin: 'admin', keepTogether: false },
    });
  });
});

async function importCompanionPair(
  app: INestApplication<App>,
  eventId: string,
): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(GUEST_TEMPLATE_SHEET_NAME);
  sheet.addRow([...GUEST_TEMPLATE_LEGACY_IMPORT_HEADERS, 'preferencia_control']);
  sheet.addRow([
    'Ana Garcia Lopez',
    'ana.garcia@ejemplo.com',
    '+34600111222',
    '',
    'Familia novia',
    '',
    '',
    'PAREJA_001',
    'false',
  ]);
  sheet.addRow([
    'Luis Martinez Ruiz',
    'luis.martinez@ejemplo.com',
    '+34600333444',
    '',
    'Familia novia',
    'Pareja',
    '',
    'PAREJA_001',
    'false',
    'colaborativo',
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
