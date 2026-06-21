import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter';

describe('Table shapes and seat topology (e2e #15)', () => {
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

  it('expone catalogo configurable de formas de mesa', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/events/evt_15/table-shapes')
      .expect(200);

    expect(response.body.eventId).toBe('evt_15');
    expect(response.body.shapes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ shape: 'redonda', minCapacity: 2 }),
        expect.objectContaining({ shape: 'imperial', minCapacity: 6 }),
      ]),
    );
  });

  it('devuelve topologia de vista previa por forma y capacidad', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/events/evt_15/table-shapes/redonda/seat-topology')
      .query({ capacity: 4 })
      .expect(200);

    expect(response.body).toMatchObject({
      shape: 'redonda',
      capacity: 4,
    });
    expect(response.body.seats).toHaveLength(4);
    expect(response.body.proximities.length).toBeGreaterThan(0);
  });

  it('recalcula topologia al cambiar forma en mesa del borrador', async () => {
    const upload = await request(app.getHttpServer())
      .post('/api/v1/events/evt_15/floor-plans')
      .attach('file', Buffer.from('%PDF-1.4'), {
        filename: 'salon.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    const floorPlanId = upload.body.id as string;

    const created = await request(app.getHttpServer())
      .post(`/api/v1/events/evt_15/floor-plans/${floorPlanId}/draft/tables`)
      .set('Content-Type', 'application/json')
      .send({
        label: 'Mesa principal',
        shape: 'rectangular',
        estimatedCapacity: 6,
      })
      .expect(201);

    const tableId = created.body.tables[0].id as string;

    const rectangular = await request(app.getHttpServer())
      .get(
        `/api/v1/events/evt_15/floor-plans/${floorPlanId}/draft/tables/${tableId}/seat-topology`,
      )
      .expect(200);

    expect(rectangular.body.shape).toBe('rectangular');

    await request(app.getHttpServer())
      .put(
        `/api/v1/events/evt_15/floor-plans/${floorPlanId}/draft/tables/${tableId}`,
      )
      .set('Content-Type', 'application/json')
      .send({
        label: 'Mesa principal',
        shape: 'redonda',
        estimatedCapacity: 6,
      })
      .expect(200);

    const redonda = await request(app.getHttpServer())
      .get(
        `/api/v1/events/evt_15/floor-plans/${floorPlanId}/draft/tables/${tableId}/seat-topology`,
      )
      .expect(200);

    expect(redonda.body.shape).toBe('redonda');
    expect(redonda.body.proximities).not.toEqual(rectangular.body.proximities);
  });
});
