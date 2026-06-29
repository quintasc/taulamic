import { rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import ExcelJS from 'exceljs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter';
import { GUEST_TEMPLATE_LEGACY_IMPORT_HEADERS, GUEST_TEMPLATE_SHEET_NAME } from '../src/guest-import/domain/guest-template.schema';

describe('Event preference control mode (e2e #32)', () => {
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

  it('consulta modo por defecto y lo actualiza con historial versionado', async () => {
    const initial = await request(app.getHttpServer())
      .get('/api/v1/events/evt_123/preference-control-mode')
      .expect(200);

    expect(initial.body).toMatchObject({
      eventId: 'evt_123',
      mode: 'colaborativo',
      version: 0,
    });

    const updated = await request(app.getHttpServer())
      .put('/api/v1/events/evt_123/preference-control-mode')
      .set('Content-Type', 'application/json')
      .send({ mode: 'anfitrion_exclusivo' })
      .expect(200);

    expect(updated.body).toMatchObject({
      eventId: 'evt_123',
      mode: 'anfitrion_exclusivo',
      version: 1,
    });

    const revisions = await request(app.getHttpServer())
      .get('/api/v1/events/evt_123/preference-control-mode/revisions')
      .expect(200);

    expect(revisions.body.revisions).toEqual([
      expect.objectContaining({
        version: 1,
        mode: 'anfitrion_exclusivo',
        previousMode: null,
      }),
    ]);
  });

  it('conserva historico al cambiar de modo varias veces', async () => {
    await request(app.getHttpServer())
      .put('/api/v1/events/evt_123/preference-control-mode')
      .set('Content-Type', 'application/json')
      .send({ mode: 'anfitrion_exclusivo' })
      .expect(200);

    await request(app.getHttpServer())
      .put('/api/v1/events/evt_123/preference-control-mode')
      .set('Content-Type', 'application/json')
      .send({ mode: 'colaborativo' })
      .expect(200);

    const revisions = await request(app.getHttpServer())
      .get('/api/v1/events/evt_123/preference-control-mode/revisions')
      .expect(200);

    expect(revisions.body.revisions).toHaveLength(2);
    expect(revisions.body.revisions[1]).toMatchObject({
      version: 2,
      mode: 'colaborativo',
      previousMode: 'anfitrion_exclusivo',
    });
  });

  it('rechaza modos invalidos', async () => {
    const response = await request(app.getHttpServer())
      .put('/api/v1/events/evt_123/preference-control-mode')
      .set('Content-Type', 'application/json')
      .send({ mode: 'mixto' })
      .expect(400);

    expect(response.body.statusCode).toBe(400);
  });

  it('no pierde preferencias historicas de invitados al cambiar el modo', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(GUEST_TEMPLATE_SHEET_NAME);
    sheet.addRow([...GUEST_TEMPLATE_LEGACY_IMPORT_HEADERS]);
    sheet.addRow([
      'Ana Garcia',
      'ana@ejemplo.com',
      '+34600111222',
      '',
      '',
      '',
      'Intolerancia lactosa',
      '',
      '',
    ]);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/guest-import/import')
      .attach('file', buffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    const suggestions = await request(app.getHttpServer())
      .get('/api/v1/events/evt_123/guest-import/suggestions')
      .expect(200);

    const suggestionId = suggestions.body.suggestions[0].id;
    await request(app.getHttpServer())
      .post(
        `/api/v1/events/evt_123/guest-import/suggestions/${suggestionId}/accept`,
      )
      .expect(200);

    await request(app.getHttpServer())
      .put('/api/v1/events/evt_123/preference-control-mode')
      .set('Content-Type', 'application/json')
      .send({ mode: 'anfitrion_exclusivo' })
      .expect(200);

    const raw = await readFile(
      join(process.cwd(), 'uploads', 'guests', 'evt_123', 'event-guests.json'),
      'utf8',
    );
    const store = JSON.parse(raw);

    expect(store.guests[0].restrictions).toEqual([
      expect.objectContaining({
        kind: 'intolerancia_alimentaria',
        origin: 'suggested',
      }),
    ]);
  });
});
