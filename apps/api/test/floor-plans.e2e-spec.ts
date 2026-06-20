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

  it('acepta JPG valido', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/floor-plans')
      .attach('file', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), {
        filename: 'salon.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      eventId: 'evt_123',
      originalName: 'salon.jpg',
      mimeType: 'image/jpeg',
      status: 'uploaded',
    });
    expect(response.body.id).toBeDefined();
  });

  it('acepta PNG valido', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/floor-plans')
      .attach('file', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), {
        filename: 'salon.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      eventId: 'evt_123',
      originalName: 'salon.png',
      mimeType: 'image/png',
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

describe('FloorPlans limite de tamano (e2e)', () => {
  let app: INestApplication<App>;
  const originalMaxBytes = process.env.FLOOR_PLAN_MAX_BYTES;

  beforeEach(async () => {
    process.env.FLOOR_PLAN_MAX_BYTES = '512';

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

    if (originalMaxBytes === undefined) {
      delete process.env.FLOOR_PLAN_MAX_BYTES;
    } else {
      process.env.FLOOR_PLAN_MAX_BYTES = originalMaxBytes;
    }
  });

  it('rechaza archivo que supera el tamano maximo', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/floor-plans')
      .attach('file', Buffer.alloc(600, 0x41), {
        filename: 'salon.pdf',
        contentType: 'application/pdf',
      })
      .expect(400);

    expect(response.body.code).toBe('FILE_TOO_LARGE');
  });
});

describe('FloorPlans deteccion (e2e)', () => {
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

  it('detecta mesas con forma, capacidad y confianza', async () => {
    const upload = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/floor-plans')
      .attach(
        'file',
        Buffer.from(
          '%PDF-1.4\nMesa 1 redonda 10 pax\nMesa 2 rectangular 8 personas\n',
        ),
        {
          filename: 'salon-etiquetado.pdf',
          contentType: 'application/pdf',
        },
      )
      .expect(201);

    const response = await request(app.getHttpServer())
      .post(
        `/api/v1/events/evt_123/floor-plans/${upload.body.id}/detect`,
      )
      .expect(200);

    expect(response.body).toMatchObject({
      floorPlanId: upload.body.id,
      eventId: 'evt_123',
      status: 'completed',
      manualFallbackAvailable: true,
    });
    expect(response.body.tables).toHaveLength(2);
    expect(response.body.tables[0]).toMatchObject({
      label: 'Mesa 1',
      shape: 'redonda',
      estimatedCapacity: 10,
    });
    expect(response.body.tables[0].confidence).toBeGreaterThanOrEqual(0.65);
    expect(response.body.tables[1]).toMatchObject({
      label: 'Mesa 2',
      shape: 'rectangular',
      estimatedCapacity: 8,
    });
  });

  it('falla de forma controlada sin bloquear flujo manual', async () => {
    const upload = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/floor-plans')
      .attach('file', Buffer.from('%PDF-1.4\nplano sin mesas\n'), {
        filename: 'plano-vacio.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post(
        `/api/v1/events/evt_123/floor-plans/${upload.body.id}/detect`,
      )
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'failed',
      tables: [],
      manualFallbackAvailable: true,
    });
    expect(response.body.message).toContain('manual');
  });

  it('devuelve 404 si el plano no existe', async () => {
    const response = await request(app.getHttpServer())
      .post(
        '/api/v1/events/evt_123/floor-plans/00000000-0000-0000-0000-000000000000/detect',
      )
      .expect(404);

    expect(response.body.code).toBe('FLOOR_PLAN_NOT_FOUND');
  });
});

describe('FloorPlans editor y confirmacion (e2e)', () => {
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

  async function uploadAndDetect(server: App) {
    const upload = await request(server)
      .post('/api/v1/events/evt_123/floor-plans')
      .attach(
        'file',
        Buffer.from(
          '%PDF-1.4\nMesa 1 redonda 10 pax\nMesa 2 rectangular 8 personas\n',
        ),
        {
          filename: 'salon-etiquetado.pdf',
          contentType: 'application/pdf',
        },
      )
      .expect(201);

    await request(server)
      .post(`/api/v1/events/evt_123/floor-plans/${upload.body.id}/detect`)
      .expect(200);

    return upload.body.id as string;
  }

  it('permite corregir detecciones y confirmar configuracion final', async () => {
    const floorPlanId = await uploadAndDetect(app.getHttpServer());

    const draft = await request(app.getHttpServer())
      .get(`/api/v1/events/evt_123/floor-plans/${floorPlanId}/draft`)
      .expect(200);

    expect(draft.body.tables).toHaveLength(2);

    const tableToEdit = draft.body.tables[0];
    await request(app.getHttpServer())
      .put(
        `/api/v1/events/evt_123/floor-plans/${floorPlanId}/draft/tables/${tableToEdit.id}`,
      )
      .send({
        label: 'Mesa principal',
        shape: 'redonda',
        estimatedCapacity: 12,
      })
      .expect(200);

    await request(app.getHttpServer())
      .delete(
        `/api/v1/events/evt_123/floor-plans/${floorPlanId}/draft/tables/${draft.body.tables[1].id}`,
      )
      .expect(204);

    await request(app.getHttpServer())
      .post(`/api/v1/events/evt_123/floor-plans/${floorPlanId}/draft/tables`)
      .send({
        label: 'Mesa VIP',
        shape: 'imperial',
        estimatedCapacity: 14,
      })
      .expect(201);

    const confirmed = await request(app.getHttpServer())
      .post(`/api/v1/events/evt_123/floor-plans/${floorPlanId}/draft/confirm`)
      .send({ confirmed: true })
      .expect(200);

    expect(confirmed.body).toMatchObject({
      status: 'confirmed',
      configurationOrigin: 'imported_edited',
    });
    expect(confirmed.body.tables).toHaveLength(2);
    expect(confirmed.body.tables[0]).toMatchObject({
      label: 'Mesa principal',
      estimatedCapacity: 12,
      origin: 'detected_edited',
    });

    const stored = await request(app.getHttpServer())
      .get(`/api/v1/events/evt_123/floor-plans/${floorPlanId}/confirmed`)
      .expect(200);

    expect(stored.body.tables).toHaveLength(2);

    await request(app.getHttpServer())
      .put(
        `/api/v1/events/evt_123/floor-plans/${floorPlanId}/draft/tables/${tableToEdit.id}`,
      )
      .send({
        label: 'Mesa bloqueada',
        shape: 'redonda',
        estimatedCapacity: 6,
      })
      .expect(409);
  });

  it('requiere confirmacion explicita y al menos una mesa', async () => {
    const upload = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/floor-plans')
      .attach('file', Buffer.from('%PDF-1.4\n'), {
        filename: 'plano.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(
        `/api/v1/events/evt_123/floor-plans/${upload.body.id}/draft/confirm`,
      )
      .send({ confirmed: false })
      .expect(400);

    await request(app.getHttpServer())
      .post(
        `/api/v1/events/evt_123/floor-plans/${upload.body.id}/draft/confirm`,
      )
      .send({ confirmed: true })
      .expect(400);
  });

  it('permite configuracion manual sin deteccion previa', async () => {
    const upload = await request(app.getHttpServer())
      .post('/api/v1/events/evt_123/floor-plans')
      .attach('file', Buffer.from('%PDF-1.4\n'), {
        filename: 'plano.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    const draft = await request(app.getHttpServer())
      .get(`/api/v1/events/evt_123/floor-plans/${upload.body.id}/draft`)
      .expect(200);

    expect(draft.body.tables).toEqual([]);

    await request(app.getHttpServer())
      .post(
        `/api/v1/events/evt_123/floor-plans/${upload.body.id}/draft/tables`,
      )
      .send({
        label: 'Mesa manual',
        shape: 'rectangular',
        estimatedCapacity: 8,
      })
      .expect(201);

    const confirmed = await request(app.getHttpServer())
      .post(
        `/api/v1/events/evt_123/floor-plans/${upload.body.id}/draft/confirm`,
      )
      .send({ confirmed: true })
      .expect(200);

    expect(confirmed.body.configurationOrigin).toBe('manual');
  });
});
