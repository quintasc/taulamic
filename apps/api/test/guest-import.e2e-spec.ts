import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import ExcelJS from 'exceljs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter';
import {
  GUEST_TEMPLATE_COLUMNS,
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
    expect(headers).toEqual([...GUEST_TEMPLATE_COLUMNS]);

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
