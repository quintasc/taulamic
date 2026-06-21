import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { assertPilotOperationsDocumented } from './swagger.config';
import { createOpenApiDocument } from './openapi-document';

describe('OpenAPI piloto', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('expone tags y operaciones minimas del MVP julio', () => {
    const document = createOpenApiDocument(app);

    expect(document.info).toMatchObject({
      title: 'Taulamic API',
      version: '1.0-pilot',
    });
    expect(document.components?.securitySchemes).toMatchObject({
      'taulamic-actor-role': expect.objectContaining({
        type: 'apiKey',
        name: 'x-taulamic-actor-role',
      }),
    });

    assertPilotOperationsDocumented(document);
  });
});
