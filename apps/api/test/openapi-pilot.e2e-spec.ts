import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter';
import { registerOpenApi } from '../src/config/openapi-document';
import {
  assertPilotOperationsDocumented,
  OPENAPI_JSON_PATH,
  OPENAPI_UI_PATH,
  PILOT_OPENAPI_TAGS,
} from '../src/config/swagger.config';

describe('OpenAPI piloto (e2e #9)', () => {
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
    registerOpenApi(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('publica /api-json con contrato piloto y UI en /api/docs', async () => {
    const spec = await request(app.getHttpServer())
      .get(OPENAPI_JSON_PATH)
      .expect(200);

    expect(spec.body.openapi).toMatch(/^3\./);
    expect(spec.body.info).toMatchObject({
      title: 'Taulamic API',
      version: '1.0-pilot',
    });
    expect(spec.body.info.description).toContain('piloto MVP julio');

    assertPilotOperationsDocumented(spec.body);

    const tagNames = (spec.body.tags as Array<{ name: string }>).map(
      (tag) => tag.name,
    );
    expect(tagNames).toEqual(
      expect.arrayContaining(PILOT_OPENAPI_TAGS.map((tag) => tag.name)),
    );

    await request(app.getHttpServer()).get(`/${OPENAPI_UI_PATH}`).expect(200);
  });

  it('documenta motor v0 con motorVersion en el esquema de distribucion', async () => {
    const spec = await request(app.getHttpServer())
      .get(OPENAPI_JSON_PATH)
      .expect(200);

    const distributionSchema =
      spec.body.components?.schemas?.DistributionProposalDto;

    expect(distributionSchema).toBeDefined();
    expect(distributionSchema.properties.motorVersion).toMatchObject({
      example: 'v0-pilot',
    });
  });
});
