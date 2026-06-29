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
  GUEST_TEMPLATE_DOWNLOAD_COLUMNS,
  GUEST_TEMPLATE_SHEET_NAME,
} from '../src/guest-import/domain/guest-template.schema';

describe('Companion groups rule (e2e #34)', () => {
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

  it('lista grupos con keepTogether=true por defecto tras import', async () => {
    await importCompanionPair(app, 'evt_comp_34');

    const response = await request(app.getHttpServer())
      .get('/api/v1/events/evt_comp_34/companion-groups')
      .expect(200);

    expect(response.body.groups).toHaveLength(1);
    expect(response.body.groups[0]).toMatchObject({
      key: 'PAREJA_001',
      keepTogether: true,
      exception: null,
    });
  });

  it('registra excepcion desde Excel con trazabilidad', async () => {
    await importCompanionPair(app, 'evt_comp_34_excel', {
      separarAcompanante: 'true',
      notasInternas: 'Separar por peticion de los novios',
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/events/evt_comp_34_excel/companion-groups')
      .expect(200);

    expect(response.body.groups[0]).toMatchObject({
      keepTogether: false,
      exception: {
        reason: 'Separar por peticion de los novios',
        origin: 'excel',
      },
    });
  });

  it('permite admin separar y revertir con motivo auditado', async () => {
    await importCompanionPair(app, 'evt_comp_34_admin');

    await request(app.getHttpServer())
      .post('/api/v1/events/evt_comp_34_admin/companion-groups/PAREJA_001/separate')
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'admin')
      .send({ reason: 'Conflicto familiar temporal' })
      .expect(200);

    const separated = await request(app.getHttpServer())
      .get('/api/v1/events/evt_comp_34_admin/companion-groups')
      .expect(200);

    expect(separated.body.groups[0]).toMatchObject({
      keepTogether: false,
      exception: {
        reason: 'Conflicto familiar temporal',
        origin: 'admin',
      },
    });

    await request(app.getHttpServer())
      .post(
        '/api/v1/events/evt_comp_34_admin/companion-groups/PAREJA_001/revert-separation',
      )
      .set('x-taulamic-actor-role', 'admin')
      .expect(200);

    const reverted = await request(app.getHttpServer())
      .get('/api/v1/events/evt_comp_34_admin/companion-groups')
      .expect(200);

    expect(reverted.body.groups[0]).toMatchObject({
      keepTogether: true,
      exception: null,
    });
  });

  it('bloquea separacion manual a invitados', async () => {
    await importCompanionPair(app, 'evt_comp_34_guest');

    const response = await request(app.getHttpServer())
      .post('/api/v1/events/evt_comp_34_guest/companion-groups/PAREJA_001/separate')
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'guest')
      .send({ reason: 'Intento invitado' })
      .expect(403);

    expect(response.body.code).toBe('ADMIN_REQUIRED');
  });

  it('explica cuando incompatibilidades impiden sentar juntos', async () => {
    const guestIds = await importCompanionPair(app, 'evt_comp_34_eval');

    await request(app.getHttpServer())
      .post(
        `/api/v1/events/evt_comp_34_eval/guests/${guestIds[0]}/restrictions`,
      )
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'admin')
      .send({
        kind: 'incompatibilidad',
        targetHint: 'Luis Martinez Ruiz',
        description: 'No sentar con Luis Martinez Ruiz',
      })
      .expect(200);

    const evaluation = await request(app.getHttpServer())
      .get(
        '/api/v1/events/evt_comp_34_eval/companion-groups/PAREJA_001/evaluation',
      )
      .expect(200);

    expect(evaluation.body).toMatchObject({
      groupKey: 'PAREJA_001',
      keepTogether: true,
      canKeepTogether: false,
    });
    expect(evaluation.body.explanation).toContain('incompatibilidades');
    expect(evaluation.body.blockers).toHaveLength(1);
  });
});

type CompanionImportOptions = {
  separarAcompanante?: string;
  notasInternas?: string;
};

async function importCompanionPair(
  app: INestApplication<App>,
  eventId: string,
  options: CompanionImportOptions = {},
): Promise<string[]> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(GUEST_TEMPLATE_SHEET_NAME);
  sheet.addRow([...GUEST_TEMPLATE_DOWNLOAD_COLUMNS]);
  sheet.addRow([
    'Ana Garcia Lopez',
    'ana.garcia@ejemplo.com',
    '+34600111222',
    '',
    'Familia novia',
    '',
    '',
    '',
    options.notasInternas ?? '',
    'PAREJA_001',
    options.separarAcompanante ?? 'false',
  ]);
  sheet.addRow([
    'Luis Martinez Ruiz',
    'luis.martinez@ejemplo.com',
    '+34600333444',
    '',
    'Familia novia',
    'Pareja',
    '',
    '',
    '',
    'PAREJA_001',
    options.separarAcompanante ?? 'false',
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
  return store.guests.map((guest: { id: string }) => guest.id as string);
}
