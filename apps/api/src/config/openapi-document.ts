import type { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import {
  buildSwaggerConfig,
  OPENAPI_JSON_PATH,
  OPENAPI_UI_PATH,
} from './swagger.config';

export function createOpenApiDocument(app: INestApplication) {
  return SwaggerModule.createDocument(app, buildSwaggerConfig());
}

export function registerOpenApi(app: INestApplication): void {
  const document = createOpenApiDocument(app);
  SwaggerModule.setup(OPENAPI_UI_PATH, app, document);
  app.getHttpAdapter().get(OPENAPI_JSON_PATH, (_req, res) => {
    res.json(document);
  });
}
