import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter';

describe('FloorPlans (e2e)', () => {
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

  it('acepta PDF valido', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/floor-plans')
      .attach('file', Buffer.from('%PDF-1.4'), {
        filename: 'salon.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      eventId: 'evt_123',
      originalName: 'salon.pdf',
      mimeType: 'application/pdf',
      status: 'uploaded',
    });
    expect(response.body.id).toBeDefined();
  });

  it('rechaza formato no soportado', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/floor-plans')
      .attach('file', Buffer.from('gif'), {
        filename: 'plano.gif',
        contentType: 'image/gif',
      })
      .expect(400);

    expect(response.body.code).toBe('INVALID_FILE_TYPE');
  });

  it('rechaza peticion sin archivo', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/floor-plans')
      .expect(400);

    expect(response.body.code).toBe('FILE_REQUIRED');
  });
});
