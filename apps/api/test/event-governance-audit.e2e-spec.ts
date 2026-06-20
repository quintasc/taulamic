import { rm } from 'node:fs/promises';
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

describe('Event governance audit (e2e #35)', () => {
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

  it('reconstruye historico unificado de modo y excepciones', async () => {
    await request(app.getHttpServer())
      .put('/api/v1/events/evt_audit_35/preference-control-mode')
      .set('Content-Type', 'application/json')
      .set('x-taulame-actor-role', 'admin')
      .send({ mode: 'anfitrion_exclusivo' })
      .expect(200);

    await importCompanionPair(app, 'evt_audit_35', {
      separarAcompanante: 'true',
      observaciones: 'Separar por peticion de los novios',
    });

    await request(app.getHttpServer())
      .post(
        '/api/v1/events/evt_audit_35/companion-groups/PAREJA_001/separate',
      )
      .set('Content-Type', 'application/json')
      .set('x-taulame-actor-role', 'admin')
      .send({ reason: 'Revision admin posterior' })
      .expect(200);

    const audit = await request(app.getHttpServer())
      .get('/api/v1/events/evt_audit_35/governance-audit')
      .set('x-taulame-actor-role', 'admin')
      .expect(200);

    expect(audit.body.entries.length).toBeGreaterThanOrEqual(3);

    const modeChange = audit.body.entries.find(
      (entry: { type: string }) => entry.type === 'preference_mode_changed',
    );
    expect(modeChange).toMatchObject({
      actorRole: 'admin',
      before: { mode: null, version: 0 },
      after: { mode: 'anfitrion_exclusivo', version: 1 },
    });

    const excelSeparation = audit.body.entries.find(
      (entry: {
        type: string;
        after: { origin: string; reason: string };
      }) =>
        entry.type === 'companion_separation_changed' &&
        entry.after.origin === 'excel',
    );
    expect(excelSeparation?.after.reason).toContain('peticion');

    const adminSeparation = audit.body.entries.find(
      (entry: {
        type: string;
        after: { origin: string; reason: string };
      }) =>
        entry.type === 'companion_separation_changed' &&
        entry.after.reason === 'Revision admin posterior',
    );
    expect(adminSeparation).toMatchObject({
      actorRole: 'admin',
      after: { origin: 'admin', keepTogether: false },
    });
  });

  it('bloquea consulta de auditoria a invitados', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/events/evt_audit_35/governance-audit')
      .set('x-taulame-actor-role', 'guest')
      .expect(403);

    expect(response.body.code).toBe('ADMIN_REQUIRED');
  });

  it('expone actorRole en revisiones de modo', async () => {
    await request(app.getHttpServer())
      .put('/api/v1/events/evt_audit_35/preference-control-mode')
      .set('Content-Type', 'application/json')
      .set('x-taulame-actor-role', 'admin')
      .send({ mode: 'anfitrion_exclusivo' })
      .expect(200);

    const revisions = await request(app.getHttpServer())
      .get('/api/v1/events/evt_audit_35/preference-control-mode/revisions')
      .expect(200);

    expect(revisions.body.revisions[0]).toMatchObject({
      actorRole: 'admin',
      mode: 'anfitrion_exclusivo',
    });
  });
});

type CompanionImportOptions = {
  separarAcompanante?: string;
  observaciones?: string;
};

async function importCompanionPair(
  app: INestApplication<App>,
  eventId: string,
  options: CompanionImportOptions = {},
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(GUEST_TEMPLATE_SHEET_NAME);
  sheet.addRow([...GUEST_TEMPLATE_COLUMNS]);
  sheet.addRow([
    'Ana Garcia Lopez',
    'ana.garcia@ejemplo.com',
    '+34600111222',
    '',
    'Familia novia',
    '',
    options.observaciones ?? '',
    'PAREJA_001',
    options.separarAcompanante ?? 'false',
    '',
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
    options.separarAcompanante ?? 'false',
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
}
