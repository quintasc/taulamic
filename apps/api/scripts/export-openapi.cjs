/**
 * Regenera docs/api/openapi.json desde el AppModule Nest (sin listen).
 * Uso: npm run docs:openapi  (desde apps/api; requiere build previo).
 */
'use strict';

const { mkdirSync, writeFileSync } = require('node:fs');
const { dirname, join } = require('node:path');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { createOpenApiDocument } = require('../dist/config/openapi-document');
const { assertPilotOperationsDocumented } = require('../dist/config/swagger.config');

async function main() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1');
  await app.init();

  const document = createOpenApiDocument(app);
  assertPilotOperationsDocumented(document);

  const outPath = join(__dirname, '../../../docs/api/openapi.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');

  await app.close();
  // eslint-disable-next-line no-console
  console.log(`OpenAPI escrito en ${outPath}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
