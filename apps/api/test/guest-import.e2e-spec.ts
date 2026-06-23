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
  GUEST_TEMPLATE_DOWNLOAD_COLUMNS,
  GUEST_TEMPLATE_FILENAME,
  GUEST_TEMPLATE_INSTRUCTIONS_SHEET_NAME,
  GUEST_TEMPLATE_SHEET_NAME,
} from '../src/guest-import/domain/guest-template.schema';

describe('GuestImport template (e2e)', () => {
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
  });

  it('descarga plantilla xlsx con contrato de columnas v1 (#27)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/events/evt_123/guest-import/template')
      .buffer()
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      })
      .expect(200);

    expect(response.headers['content-type']).toContain(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(response.headers['content-disposition']).toContain(
      GUEST_TEMPLATE_FILENAME,
    );

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.body);

    const guestsSheet = workbook.getWorksheet(GUEST_TEMPLATE_SHEET_NAME);
    expect(guestsSheet).toBeDefined();

    const headers = (guestsSheet!.getRow(1).values as Array<string | undefined>).slice(
      1,
    );
    expect(headers).toEqual([...GUEST_TEMPLATE_DOWNLOAD_COLUMNS]);

    const instructionsSheet = workbook.getWorksheet(
      GUEST_TEMPLATE_INSTRUCTIONS_SHEET_NAME,
    );
    expect(instructionsSheet).toBeDefined();
  });
});

describe('GuestImport validate (e2e #28)', () => {
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
  });

  it('valida plantilla oficial sin errores', async () => {
    const template = await request(app.getHttpServer())
      .get('/api/v1/events/evt_123/guest-import/template')
      .buffer()
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      })
      .expect(200);

    const response = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/guest-import/validate')
      .attach('file', template.body, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      eventId: 'evt_123',
      valid: true,
      totalRows: 2,
      validRows: 2,
      invalidRows: 0,
      errors: [],
    });
  });

  it('devuelve XLS-001 si faltan encabezados', async () => {
    const buffer = await buildGuestWorkbook({
      headers: ['nombre', 'correo'],
      rows: [['Ana', 'ana@ejemplo.com']],
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/guest-import/validate')
      .attach('file', buffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    expect(response.body.valid).toBe(false);
    expect(response.body.errors[0]).toMatchObject({
      code: 'XLS-001',
    });
  });

  it('devuelve errores por fila, campo y codigo', async () => {
    const buffer = await buildGuestWorkbook({
      rows: [
        [
          'Ana',
          'correo-invalido',
          '123',
          '',
          '',
          '',
          '',
          '',
          'maybe',
          '',
        ],
      ],
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/guest-import/validate')
      .attach('file', buffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    expect(response.body.valid).toBe(false);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ row: 2, field: 'correo', code: 'XLS-002' }),
        expect.objectContaining({ row: 2, field: 'telefono', code: 'XLS-003' }),
        expect.objectContaining({
          row: 2,
          field: 'separar_acompanante',
          code: 'XLS-005',
        }),
      ]),
    );
  });

  it('detecta duplicados por correo (XLS-004)', async () => {
    const buffer = await buildGuestWorkbook({
      rows: [
        [
          'Ana',
          'ana@ejemplo.com',
          '+34600111222',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
        ],
        [
          'Luis',
          'ana@ejemplo.com',
          '+34600333444',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
        ],
      ],
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/guest-import/validate')
      .attach('file', buffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ row: 3, field: 'correo', code: 'XLS-004' }),
      ]),
    );
  });

  it('rechaza archivo ausente o formato invalido', async () => {
    const missing = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/guest-import/validate')
      .expect(400);
    expect(missing.body.code).toBe('FILE_REQUIRED');

    const invalid = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/guest-import/validate')
      .attach('file', Buffer.from('csv'), {
        filename: 'invitados.csv',
        contentType: 'text/csv',
      })
      .expect(400);
    expect(invalid.body.code).toBe('INVALID_FILE_TYPE');
  });
});

describe('GuestImport batch import (e2e #29)', () => {
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
    await rm(join(process.cwd(), 'uploads', 'guests'), {
      recursive: true,
      force: true,
    });
  });

  it('importa filas validas con conteos de creados y categorias', async () => {
    const buffer = await buildGuestWorkbook({
      rows: [
        [
          'Ana Garcia',
          'ana@ejemplo.com',
          '+34600111222',
          '',
          'Familia novia',
          '',
          '',
          '',
          '',
          '',
        ],
        [
          'Luis Martinez',
          'luis@ejemplo.com',
          '+34600333444',
          '',
          'Familia novia',
          'Pareja',
          '',
          'PAREJA_001',
          'false',
          'colaborativo',
        ],
      ],
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/guest-import/import')
      .attach('file', buffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      eventId: 'evt_123',
      totalRows: 2,
      created: 2,
      updated: 0,
      rejected: 0,
    });
    expect(response.body.categoriesEnsured).toBeGreaterThanOrEqual(2);
  });

  it('actualiza invitados existentes por correo en reimportacion', async () => {
    const buffer = await buildGuestWorkbook({
      rows: [
        [
          'Ana Garcia',
          'ana@ejemplo.com',
          '+34600111222',
          '',
          'Familia novia',
          '',
          '',
          '',
          '',
          '',
        ],
      ],
    });

    await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/guest-import/import')
      .attach('file', buffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    const updatedBuffer = await buildGuestWorkbook({
      rows: [
        [
          'Ana Garcia Lopez',
          'ana@ejemplo.com',
          '+34600999888',
          'Madrid',
          'Familia novia',
          '',
          'Nota',
          '',
          '',
          '',
        ],
      ],
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/guest-import/import')
      .attach('file', updatedBuffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      created: 0,
      updated: 1,
      rejected: 0,
    });
  });

  it('importa filas validas y rechaza invalidas sin perder consistencia', async () => {
    const buffer = await buildGuestWorkbook({
      rows: [
        [
          'Ana Garcia',
          'ana@ejemplo.com',
          '+34600111222',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
        ],
        [
          'Mal fila',
          'correo-invalido',
          '123',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
        ],
      ],
    });

    const response = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/guest-import/import')
      .attach('file', buffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      totalRows: 2,
      created: 1,
      updated: 0,
      rejected: 1,
    });
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});

describe('GuestImport restriction suggestions (e2e #30)', () => {
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
    await rm(join(process.cwd(), 'uploads', 'guests'), {
      recursive: true,
      force: true,
    });
  });

  it('genera sugerencias pendientes al importar observaciones', async () => {
    const buffer = await buildGuestWorkbook({
      rows: [
        [
          'Ana Garcia',
          'ana@ejemplo.com',
          '+34600111222',
          '',
          '',
          '',
          'No sentar con Juan Perez',
          '',
          '',
          '',
        ],
      ],
    });

    const importResponse = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/guest-import/import')
      .attach('file', buffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    expect(importResponse.body.suggestionsGenerated).toBeGreaterThanOrEqual(1);

    const listResponse = await request(app.getHttpServer())
      .get('/api/v1/events/evt_123/guest-import/suggestions')
      .expect(200);

    expect(listResponse.body.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'incompatibilidad',
          targetHint: 'Juan Perez',
          status: 'pending',
        }),
      ]),
    );
  });

  it('acepta sugerencia y rechaza otra sin auto-aplicar', async () => {
    const buffer = await buildGuestWorkbook({
      rows: [
        [
          'Ana Garcia',
          'ana@ejemplo.com',
          '+34600111222',
          '',
          '',
          '',
          'Prefiere sentar con Maria Lopez',
          '',
          '',
          '',
        ],
        [
          'Luis Martinez',
          'luis@ejemplo.com',
          '+34600333444',
          '',
          '',
          '',
          'Intolerancia lactosa',
          '',
          '',
          '',
        ],
      ],
    });

    await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/guest-import/import')
      .attach('file', buffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    const listResponse = await request(app.getHttpServer())
      .get('/api/v1/events/evt_123/guest-import/suggestions')
      .expect(200);

    const affinity = listResponse.body.suggestions.find(
      (item: { kind: string }) => item.kind === 'afinidad',
    );
    const intolerance = listResponse.body.suggestions.find(
      (item: { kind: string }) => item.kind === 'intolerancia_alimentaria',
    );

    const accepted = await request(app.getHttpServer())
      .post(
        `/api/v1/events/evt_123/guest-import/suggestions/${affinity.id}/accept`,
      )
      .expect(200);

    expect(accepted.body).toMatchObject({
      id: affinity.id,
      status: 'accepted',
      kind: 'afinidad',
    });

    const rejected = await request(app.getHttpServer())
      .post(
        `/api/v1/events/evt_123/guest-import/suggestions/${intolerance.id}/reject`,
      )
      .expect(200);

    expect(rejected.body).toMatchObject({
      id: intolerance.id,
      status: 'rejected',
    });

    const pending = await request(app.getHttpServer())
      .get('/api/v1/events/evt_123/guest-import/suggestions')
      .expect(200);

    expect(pending.body.suggestions).toHaveLength(0);
  });

  it('permite editar sugerencia pendiente antes de confirmar', async () => {
    const buffer = await buildGuestWorkbook({
      rows: [
        [
          'Ana Garcia',
          'ana@ejemplo.com',
          '+34600111222',
          '',
          '',
          '',
          'No sentar con Juan Perez',
          '',
          '',
          '',
        ],
      ],
    });

    await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/guest-import/import')
      .attach('file', buffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    const listResponse = await request(app.getHttpServer())
      .get('/api/v1/events/evt_123/guest-import/suggestions')
      .expect(200);

    expect(listResponse.body.suggestions.length).toBeGreaterThan(0);
    const suggestionId = listResponse.body.suggestions[0].id;

    const updated = await request(app.getHttpServer())
      .put(`/api/v1/events/evt_123/guest-import/suggestions/${suggestionId}`)
      .set('Content-Type', 'application/json')
      .send({ targetHint: 'Juan Pérez García' })
      .expect(200);

    expect(updated.body).toMatchObject({
      id: suggestionId,
      targetHint: 'Juan Pérez García',
      status: 'pending',
    });
  });
});

describe('GuestImport precarga E2E flujo completo (#31)', () => {
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
    await rm(join(process.cwd(), 'uploads', 'guests'), {
      recursive: true,
      force: true,
    });
  });

  it('descargar, completar, validar, corregir e importar con reporte accionable', async () => {
    const templateResponse = await request(app.getHttpServer())
      .get('/api/v1/events/evt_precarga_31/guest-import/template')
      .buffer()
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      })
      .expect(200);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(templateResponse.body as never);
    const sheet = workbook.getWorksheet(GUEST_TEMPLATE_SHEET_NAME)!;
    const headers = (sheet.getRow(1).values as Array<string | undefined>).slice(
      1,
    );
    expect(headers).toEqual([...GUEST_TEMPLATE_DOWNLOAD_COLUMNS]);

    const draftBuffer = await buildGuestWorkbook({
      rows: [
        [
          'Ana Garcia',
          'ana@ejemplo.com',
          '+34600111222',
          '',
          'Familia novia',
          '',
          'Intolerancia lactosa',
          '',
          '',
          '',
        ],
        [
          'Luis Mal',
          'correo-invalido',
          '123',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
        ],
      ],
    });

    const firstValidation = await request(app.getHttpServer())
      .post('/api/v1/events/evt_precarga_31/guest-import/validate')
      .attach('file', draftBuffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    expect(firstValidation.body).toMatchObject({
      eventId: 'evt_precarga_31',
      valid: false,
      totalRows: 2,
      validRows: 1,
      invalidRows: 1,
    });
    expect(firstValidation.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ row: 3, field: 'correo', code: 'XLS-002' }),
        expect.objectContaining({ row: 3, field: 'telefono', code: 'XLS-003' }),
      ]),
    );

    const correctedWorkbook = new ExcelJS.Workbook();
    await correctedWorkbook.xlsx.load(draftBuffer as never);
    const correctedSheet = correctedWorkbook.getWorksheet(GUEST_TEMPLATE_SHEET_NAME)!;
    correctedSheet.getCell('B3').value = 'luis@ejemplo.com';
    correctedSheet.getCell('C3').value = '+34600333444';
    const correctedBuffer = Buffer.from(await correctedWorkbook.xlsx.writeBuffer());

    const secondValidation = await request(app.getHttpServer())
      .post('/api/v1/events/evt_precarga_31/guest-import/validate')
      .attach('file', correctedBuffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    expect(secondValidation.body).toMatchObject({
      valid: true,
      totalRows: 2,
      validRows: 2,
      invalidRows: 0,
      errors: [],
    });

    const importResponse = await request(app.getHttpServer())
      .post('/api/v1/events/evt_precarga_31/guest-import/import')
      .attach('file', correctedBuffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    expect(importResponse.body).toMatchObject({
      eventId: 'evt_precarga_31',
      totalRows: 2,
      created: 2,
      updated: 0,
      rejected: 0,
      errors: [],
    });
    expect(importResponse.body.categoriesEnsured).toBeGreaterThanOrEqual(1);
    expect(importResponse.body.suggestionsGenerated).toBeGreaterThanOrEqual(1);

    const suggestions = await request(app.getHttpServer())
      .get('/api/v1/events/evt_precarga_31/guest-import/suggestions')
      .expect(200);

    expect(suggestions.body.suggestions.length).toBeGreaterThan(0);

    const suggestionId = suggestions.body.suggestions[0].id;
    await request(app.getHttpServer())
      .post(
        `/api/v1/events/evt_precarga_31/guest-import/suggestions/${suggestionId}/accept`,
      )
      .expect(200);
  });

  it('reporta errores criticos estructurales sin importar filas invalidas', async () => {
    const buffer = await buildGuestWorkbook({
      headers: ['nombre', 'correo'],
      rows: [['Ana', 'ana@ejemplo.com']],
    });

    const validation = await request(app.getHttpServer())
      .post('/api/v1/events/evt_precarga_31/guest-import/validate')
      .attach('file', buffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    expect(validation.body.valid).toBe(false);
    expect(validation.body.errors[0]).toMatchObject({ code: 'XLS-001' });

    const importResponse = await request(app.getHttpServer())
      .post('/api/v1/events/evt_precarga_31/guest-import/import')
      .attach('file', buffer, {
        filename: 'invitados.xlsx',
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      .expect(200);

    expect(importResponse.body).toMatchObject({
      totalRows: 0,
      created: 0,
      updated: 0,
      rejected: 0,
    });
    expect(importResponse.body.errors[0]).toMatchObject({ code: 'XLS-001' });
  });
});

async function buildGuestWorkbook(options: {
  headers?: string[];
  rows?: string[][];
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(GUEST_TEMPLATE_SHEET_NAME);
  sheet.addRow(options.headers ?? [...GUEST_TEMPLATE_COLUMNS]);

  for (const row of options.rows ?? []) {
    sheet.addRow(row);
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

