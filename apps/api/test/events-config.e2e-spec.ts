import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter';

describe('Event config and tables (e2e #1)', () => {
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

  it('crea evento, configura mesas y expone capacidad total', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/events')
      .set('Content-Type', 'application/json')
      .send({ name: 'Boda piloto' })
      .expect(201);

    const eventId = created.body.id as string;
    expect(created.body).toMatchObject({
      name: 'Boda piloto',
      status: 'configuring',
      capacitySummary: {
        tableCount: 0,
        totalCapacity: 0,
      },
    });

    const withTable = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/tables`)
      .set('Content-Type', 'application/json')
      .send({
        label: 'Mesa principal',
        shape: 'redonda',
        estimatedCapacity: 10,
      })
      .expect(201);

    expect(withTable.body.capacitySummary).toMatchObject({
      tableCount: 1,
      totalCapacity: 10,
      byShape: {
        redonda: { tableCount: 1, totalCapacity: 10 },
      },
    });

    const tableId = withTable.body.tables[0].id as string;

    const updated = await request(app.getHttpServer())
      .put(`/api/v1/events/${eventId}/tables/${tableId}`)
      .set('Content-Type', 'application/json')
      .send({
        label: 'Mesa principal',
        shape: 'rectangular',
        estimatedCapacity: 12,
      })
      .expect(200);

    expect(updated.body.tables[0]).toMatchObject({
      shape: 'rectangular',
      capacity: 12,
    });
    expect(updated.body.capacitySummary.totalCapacity).toBe(12);

    const fetched = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}`)
      .expect(200);

    expect(fetched.body.capacitySummary.totalCapacity).toBe(12);
  });

  it('rechaza capacidad invalida y mesa con forma no soportada', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/events')
      .set('Content-Type', 'application/json')
      .send({ name: 'Evento validacion' })
      .expect(201);

    const eventId = created.body.id as string;

    const zeroCapacity = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/tables`)
      .set('Content-Type', 'application/json')
      .send({
        label: 'Mesa invalida',
        shape: 'redonda',
        estimatedCapacity: 0,
      })
      .expect(400);

    expect(zeroCapacity.body.statusCode).toBe(400);

    const invalidShape = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/tables`)
      .set('Content-Type', 'application/json')
      .send({
        label: 'Mesa rara',
        shape: 'hexagonal',
        estimatedCapacity: 8,
      })
      .expect(400);

    expect(invalidShape.body.statusCode).toBe(400);
  });
});
