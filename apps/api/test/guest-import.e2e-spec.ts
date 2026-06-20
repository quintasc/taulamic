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
