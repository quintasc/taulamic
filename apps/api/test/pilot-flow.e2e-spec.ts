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
  GUEST_TEMPLATE_DOWNLOAD_COLUMNS,
  GUEST_TEMPLATE_SHEET_NAME,
} from '../src/guest-import/domain/guest-template.schema';

/**
 * Suite E2E integracion piloto MVP julio (DECISION-002 / mvp-julio-plan Fase C).
 * Flujo admin: evento → mesas → preferencias → Excel → motor v0 → confirmacion.
 */
describe('MVP julio pilot flow (e2e integracion)', () => {
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
    await rm(join(process.cwd(), 'uploads'), { recursive: true, force: true });
  });

  it('recorre el flujo piloto de punta a punta con evidencia API', async () => {
    const createdEvent = await request(app.getHttpServer())
      .post('/api/v1/events')
      .set('Content-Type', 'application/json')
      .send({ name: 'Boda piloto integracion' })
      .expect(201);

    const eventId = createdEvent.body.id as string;
    expect(createdEvent.body).toMatchObject({
      name: 'Boda piloto integracion',
      status: 'configuring',
    });

    await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/tables`)
      .set('Content-Type', 'application/json')
      .send({
        label: 'Mesa principal',
        shape: 'redonda',
        estimatedCapacity: 6,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/tables`)
      .set('Content-Type', 'application/json')
      .send({
        label: 'Mesa familiar',
        shape: 'rectangular',
        estimatedCapacity: 6,
      })
      .expect(201);

    const eventWithTables = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}`)
      .expect(200);

    expect(eventWithTables.body.capacitySummary).toMatchObject({
      tableCount: 2,
      totalCapacity: 12,
    });

    const preferenceMode = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/preference-control-mode`)
      .expect(200);

    expect(preferenceMode.body).toMatchObject({
      eventId,
      mode: 'colaborativo',
    });

    const importBuffer = await buildGuestWorkbook({
      rows: [
        [
          'Ana Garcia Lopez',
          'ana.garcia@ejemplo.com',
          '+34600111222',
          '',
          'Familia novia',
          '',
          'X',
          '',
          'Intolerancia lactosa',
          'PAREJA_001',
          '',
        ],
        [
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
          '',
        ],
        [
          'Maria Santos',
          'maria.santos@ejemplo.com',
          '+34600555666',
          '',
          'Familia novio',
          '',
          '',
          '',
          '',
          'PAREJA_002',
          '',
        ],
        [
          'Pedro Ruiz',
          'pedro.ruiz@ejemplo.com',
          '+34600777888',
          '',
          'Familia novio',
          '',
          '',
          '',
          '',
          'PAREJA_002',
          '',
        ],
      ],
    });

    const imported = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/guest-import/import`)
      .attach('file', importBuffer, {
        filename: 'invitados-piloto.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    expect(imported.body).toMatchObject({
      eventId,
      totalRows: 4,
      created: 4,
      rejected: 0,
    });

    const guestList = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/guests`)
      .query({ actorRole: 'admin' })
      .expect(200);

    expect(guestList.body.total).toBe(4);

    const companionGroups = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/companion-groups`)
      .expect(200);

    expect(companionGroups.body.groups).toHaveLength(2);
    expect(companionGroups.body.groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'PAREJA_001', keepTogether: true }),
        expect.objectContaining({ key: 'PAREJA_002', keepTogether: true }),
      ]),
    );

    const distribution = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/distribution/run`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(201);

    expect(distribution.body).toMatchObject({
      eventId,
      motorVersion: 'v0-pilot',
      status: 'draft',
      stats: {
        assignedCount: 4,
        unassignedCount: 0,
      },
    });

    const anaTable = distribution.body.placements.find(
      (item: { guestName: string }) => item.guestName === 'Ana Garcia Lopez',
    );
    const luisTable = distribution.body.placements.find(
      (item: { guestName: string }) => item.guestName === 'Luis Martinez Ruiz',
    );
    const mariaTable = distribution.body.placements.find(
      (item: { guestName: string }) => item.guestName === 'Maria Santos',
    );
    const pedroTable = distribution.body.placements.find(
      (item: { guestName: string }) => item.guestName === 'Pedro Ruiz',
    );

    expect(anaTable.tableId).toBe(luisTable.tableId);
    expect(mariaTable.tableId).toBe(pedroTable.tableId);

    const fetchedDistribution = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/distribution`)
      .expect(200);

    expect(fetchedDistribution.body.id).toBe(distribution.body.id);

    const confirmed = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/distribution/confirm`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(200);

    expect(confirmed.body).toMatchObject({
      status: 'confirmed',
      motorVersion: 'v0-pilot',
    });
    expect(confirmed.body.confirmedAt).toBeTruthy();

    const approvedEvent = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}`)
      .expect(200);

    expect(approvedEvent.body.status).toBe('plan_approved');

    await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/tables`)
      .set('Content-Type', 'application/json')
      .send({
        label: 'Mesa extra',
        shape: 'redonda',
        estimatedCapacity: 4,
      })
      .expect(409);
  });
});

async function buildGuestWorkbook(options: {
  rows: string[][];
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(GUEST_TEMPLATE_SHEET_NAME);
  sheet.addRow([...GUEST_TEMPLATE_DOWNLOAD_COLUMNS]);

  for (const row of options.rows) {
    sheet.addRow(row);
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
