import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter';
import { expectedMotorVersion } from './expected-motor-version';

describe('Distribution motor (e2e #3)', () => {
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
      .send({ name: 'Evento motor distribucion' })
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

  async function waitForDistributionReady(
    eventIdToPoll: string,
    expectedProposalId?: string,
  ) {
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      const current = await request(app.getHttpServer())
        .get(`/api/v1/events/${eventIdToPoll}/distribution`)
        .expect(200);
      if (
        (!expectedProposalId || current.body.id === expectedProposalId) &&
        current.body.status !== 'calculating'
      ) {
        return current;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('Timeout esperando a que termine el cálculo de distribución');
  }

  afterEach(async () => {
    await app.close();
    await rm(join(process.cwd(), 'uploads'), { recursive: true, force: true });
  });

  it('ejecuta el motor configurado, asigna acompanantes juntos y confirma distribucion', async () => {
    const runStarted = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/distribution/run`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(201);
    expect(runStarted.body.status).toBe('calculating');

    const run = await waitForDistributionReady(eventId, runStarted.body.id);

    expect(run.body).toMatchObject({
      motorVersion: expectedMotorVersion(),
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

    expect(run.body.id).toBe(runStarted.body.id);

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

  it('expone estado del job async con progreso y timestamps', async () => {
    const runStarted = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/distribution/run`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(201);

    const statusStarted = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/distribution/status`)
      .expect(200);

    expect(statusStarted.body).toMatchObject({
      eventId,
      proposalId: runStarted.body.id,
    });
    expect(
      ['calculating', 'draft', 'failed'].includes(statusStarted.body.state),
    ).toBe(true);
    expect(typeof statusStarted.body.progressPercent).toBe('number');
    expect(statusStarted.body.progressPercent).toBeGreaterThanOrEqual(0);
    expect(statusStarted.body.progressPercent).toBeLessThanOrEqual(100);
    expect(statusStarted.body.startedAt).toBeTruthy();

    await waitForDistributionReady(eventId, runStarted.body.id);

    const statusCompleted = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/distribution/status`)
      .expect(200);

    expect(statusCompleted.body).toMatchObject({
      eventId,
      proposalId: runStarted.body.id,
      state: 'draft',
      phase: 'completed',
      progressPercent: 100,
    });
    expect(statusCompleted.body.updatedAt).toBeTruthy();
  });

  it('rechaza recalcular tras confirmar distribucion', async () => {
    const runStarted = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/distribution/run`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(201);
    await waitForDistributionReady(eventId, runStarted.body.id);

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
    const runStarted = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/distribution/run`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(201);
    const run = await waitForDistributionReady(eventId, runStarted.body.id);

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
    const runStarted = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/distribution/run`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(201);
    const run = await waitForDistributionReady(eventId, runStarted.body.id);

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

  it('mueve un invitado asignado a otra mesa en borrador', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/tables`)
      .set('Content-Type', 'application/json')
      .send({
        label: 'Mesa 2',
        shape: 'redonda',
        estimatedCapacity: 4,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/guests`)
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'admin')
      .send({
        nombre: 'Pepe Ruiz',
        correo: 'pepe@ejemplo.com',
        telefono: '+34600555666',
      })
      .expect(201);

    const runStarted = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/distribution/run`)
      .set('x-taulamic-actor-role', 'admin')
      .expect(201);
    const run = await waitForDistributionReady(eventId, runStarted.body.id);

    const pepe = run.body.placements.find(
      (item: { guestName: string }) => item.guestName === 'Pepe Ruiz',
    );

    expect(pepe).toBeTruthy();

    const event = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}`)
      .expect(200);

    const targetTable = event.body.tables.find(
      (table: { id: string }) => table.id !== pepe.tableId,
    );

    expect(targetTable).toBeTruthy();

    const moved = await request(app.getHttpServer())
      .post(
        `/api/v1/events/${eventId}/distribution/placements/${pepe.guestId}/move`,
      )
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'admin')
      .send({ tableId: targetTable.id })
      .expect(200);

    expect(moved.body).toMatchObject({
      status: 'draft',
      stats: {
        assignedCount: 3,
        unassignedCount: 0,
      },
    });
    expect(
      moved.body.placements.some(
        (item: { guestId: string; tableId: string }) =>
          item.guestId === pepe.guestId && item.tableId === targetTable.id,
      ),
    ).toBe(true);
  });
});
