import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter';

describe('Distribution motor v0 (e2e #3)', () => {
  let app: INestApplication<App>;
  let eventId: string;

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

    const created = await request(app.getHttpServer())
      .post('/api/v1/events')
      .set('Content-Type', 'application/json')
      .send({ name: 'Evento motor v0' })
      .expect(201);

    eventId = created.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/tables`)
      .set('Content-Type', 'application/json')
      .send({
        label: 'Mesa 1',
        shape: 'redonda',
        estimatedCapacity: 4,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/guests`)
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'admin')
      .send({
        nombre: 'Ana Garcia',
        correo: 'ana@ejemplo.com',
        telefono: '+34600111222',
        acompananteKey: 'PAREJA_1',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/guests`)
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'admin')
      .send({
        nombre: 'Luis Perez',
        correo: 'luis@ejemplo.com',
        telefono: '+34600333444',
        acompananteKey: 'PAREJA_1',
      })
      .expect(201);
  });

  afterEach(async () => {
    await app.close();
    await rm(join(process.cwd(), 'uploads'), { recursive: true, force: true });
  });

  it('ejecuta motor v0, asigna acompanantes juntos y confirma distribucion', async () => {
    const run = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/distribution/run`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(201);

    expect(run.body).toMatchObject({
      motorVersion: 'v0-pilot',
      status: 'draft',
      stats: {
        assignedCount: 2,
        unassignedCount: 0,
      },
    });

    const ana = run.body.placements.find(
      (item: { guestName: string }) => item.guestName === 'Ana Garcia',
    );
    const luis = run.body.placements.find(
      (item: { guestName: string }) => item.guestName === 'Luis Perez',
    );

    expect(ana.tableId).toBe(luis.tableId);

    const fetched = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/distribution`)
      .expect(200);

    expect(fetched.body.id).toBe(run.body.id);

    const confirmed = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/distribution/confirm`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(200);

    expect(confirmed.body.status).toBe('confirmed');
    expect(confirmed.body.confirmedAt).toBeTruthy();

    const event = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}`)
      .expect(200);

    expect(event.body.status).toBe('plan_approved');
  });

  it('rechaza recalcular tras confirmar distribucion', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/distribution/run`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/distribution/confirm`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(200);

    const rerun = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/distribution/run`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(409);

    expect(rerun.body.code).toBe('EVENT_PLAN_APPROVED');
  });

  it('desasigna un invitado en borrador y actualiza estadisticas', async () => {
    const run = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/distribution/run`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(201);

    const ana = run.body.placements.find(
      (item: { guestName: string }) => item.guestName === 'Ana Garcia',
    );

    expect(ana).toBeTruthy();

    const unassigned = await request(app.getHttpServer())
      .post(
        `/api/v1/events/${eventId}/distribution/placements/${ana.guestId}/unassign`,
      )
      .set('x-taulamic-actor-role', 'admin')
      .expect(200);

    expect(unassigned.body).toMatchObject({
      status: 'draft',
      stats: {
        assignedCount: 1,
        unassignedCount: 1,
      },
    });
    expect(unassigned.body.placements).toHaveLength(1);
    expect(unassigned.body.unassignedGuestIds).toEqual([ana.guestId]);
    expect(
      unassigned.body.placements.some(
        (item: { guestId: string }) => item.guestId === ana.guestId,
      ),
    ).toBe(false);
  });

  it('asigna un invitado sin asignar a una mesa en borrador', async () => {
    const run = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/distribution/run`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(201);

    const ana = run.body.placements.find(
      (item: { guestName: string }) => item.guestName === 'Ana Garcia',
    );
    const luis = run.body.placements.find(
      (item: { guestName: string }) => item.guestName === 'Luis Perez',
    );

    await request(app.getHttpServer())
      .post(
        `/api/v1/events/${eventId}/distribution/placements/${ana.guestId}/unassign`,
      )
      .set('x-taulamic-actor-role', 'admin')
      .expect(200);

    const assigned = await request(app.getHttpServer())
      .put(
        `/api/v1/events/${eventId}/distribution/placements/${ana.guestId}`,
      )
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'admin')
      .send({ tableId: luis.tableId })
      .expect(200);

    expect(assigned.body).toMatchObject({
      status: 'draft',
      stats: {
        assignedCount: 2,
        unassignedCount: 0,
      },
    });
    expect(assigned.body.unassignedGuestIds).toEqual([]);
    expect(
      assigned.body.placements.some(
        (item: { guestId: string; tableId: string }) =>
          item.guestId === ana.guestId && item.tableId === luis.tableId,
      ),
    ).toBe(true);
  });
});
