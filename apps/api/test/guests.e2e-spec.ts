import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter';

describe('Guests API (e2e #2)', () => {
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
      .send({ name: 'Evento invitados piloto' })
      .expect(201);

    eventId = created.body.id as string;
  });

  afterEach(async () => {
    await app.close();
    await rm(join(process.cwd(), 'uploads'), { recursive: true, force: true });
  });

  it('registra, lista y actualiza invitados con datos base', async () => {
    const created = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/guests`)
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'admin')
      .send({
        nombre: 'Ana Garcia Lopez',
        correo: 'ana.garcia@ejemplo.com',
        telefono: '+34600111222',
        categoryNames: ['Familia novia'],
        observaciones: 'Intolerancia lactosa',
        acompananteKey: 'PAREJA_001',
      })
      .expect(201);

    const guestId = created.body.id as string;
    expect(created.body.categories).toEqual([
      expect.objectContaining({ name: 'Familia novia' }),
    ]);

    const listAdmin = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/guests`)
      .query({ actorRole: 'admin' })
      .expect(200);

    expect(listAdmin.body.total).toBe(1);
    expect(listAdmin.body.guests[0].correo).toBe('ana.garcia@ejemplo.com');

    const listGuest = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/guests`)
      .query({ actorRole: 'guest' })
      .expect(200);

    expect(listGuest.body.guests[0].correo).toBeNull();
    expect(listGuest.body.guests[0].observaciones).toBeNull();

    await request(app.getHttpServer())
      .put(`/api/v1/events/${eventId}/guests/${guestId}`)
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'admin')
      .send({
        nombre: 'Ana Garcia Lopez',
        correo: 'ana.garcia@ejemplo.com',
        telefono: '+34600999888',
        observaciones: 'Dieta sin lactosa',
      })
      .expect(200);

    const fetched = await request(app.getHttpServer())
      .get(`/api/v1/events/${eventId}/guests/${guestId}`)
      .query({ actorRole: 'admin' })
      .expect(200);

    expect(fetched.body.telefono).toBe('+34600999888');
  });

  it('rechaza registro duplicado por correo', async () => {
    const payload = {
      nombre: 'Ana Garcia',
      correo: 'ana@ejemplo.com',
      telefono: '+34600111222',
    };

    await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/guests`)
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'admin')
      .send(payload)
      .expect(201);

    const duplicate = await request(app.getHttpServer())
      .post(`/api/v1/events/${eventId}/guests`)
      .set('Content-Type', 'application/json')
      .set('x-taulamic-actor-role', 'admin')
      .send({
        ...payload,
        nombre: 'Otra persona',
      })
      .expect(409);

    expect(duplicate.body.code).toBe('GUEST_EMAIL_EXISTS');
  });
});
