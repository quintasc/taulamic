import { DocumentBuilder } from '@nestjs/swagger';

export const OPENAPI_JSON_PATH = '/api-json';
export const OPENAPI_UI_PATH = 'api/docs';

export const PILOT_OPENAPI_TAGS = [
  {
    name: 'events',
    description:
      'EP-01: configuracion de evento, mesas y modo de preferencias (piloto julio).',
  },
  {
    name: 'guests',
    description: 'EP-02: captura manual de invitados con datos base MVP.',
  },
  {
    name: 'guest-import',
    description: 'EP-12: plantilla Excel, validacion e importacion por lotes.',
  },
  {
    name: 'distribution',
    description:
      'EP-03 piloto: motor v0 sincrono (motorVersion v0-pilot) y confirmacion.',
  },
  {
    name: 'floor-plans',
    description: 'EP-11: importacion de plano, borrador y layout confirmado.',
  },
  {
    name: 'table-shapes',
    description: 'EP-01 HU-29: catalogo de formas y topologia de asientos.',
  },
  {
    name: 'guest-preferences',
    description: 'EP-13: restricciones y permisos de preferencias por invitado.',
  },
  {
    name: 'guest-companions',
    description: 'EP-13 HU-40: grupos de acompanantes y excepciones.',
  },
  {
    name: 'event-governance-audit',
    description: 'EP-13/#35: auditoria de cambios de gobernanza del evento.',
  },
] as const;

export function buildSwaggerConfig(): ReturnType<DocumentBuilder['build']> {
  const builder = new DocumentBuilder()
    .setTitle('Taulamic API')
    .setDescription(
      'API REST del piloto MVP julio (DECISION-002). ' +
        'Contrato OpenAPI 3 para evento, mesas, invitados, Excel, plano, preferencias y motor v0.',
    )
    .setVersion('1.0-pilot')
    .addServer('/api/v1', 'API v1 piloto')
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-taulamic-actor-role',
        description:
          'Rol del actor en piloto (admin | guest). Obligatorio en operaciones admin.',
      },
      'taulamic-actor-role',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Reservado para auth completa post-piloto (EP-06).',
      },
      'bearer',
    );

  for (const tag of PILOT_OPENAPI_TAGS) {
    builder.addTag(tag.name, tag.description);
  }

  return builder.build();
}

export type PilotOpenApiOperation = {
  method: 'get' | 'post' | 'put' | 'delete';
  pathSuffix: string;
  tag: (typeof PILOT_OPENAPI_TAGS)[number]['name'];
};

/** Operaciones minimas del flujo piloto documentadas en OpenAPI. */
export const PILOT_OPENAPI_OPERATIONS: PilotOpenApiOperation[] = [
  { method: 'post', pathSuffix: '/events', tag: 'events' },
  { method: 'get', pathSuffix: '/events/{eventId}', tag: 'events' },
  {
    method: 'post',
    pathSuffix: '/events/{eventId}/tables',
    tag: 'events',
  },
  {
    method: 'get',
    pathSuffix: '/events/{eventId}/preference-control-mode',
    tag: 'events',
  },
  { method: 'get', pathSuffix: '/events/{eventId}/guests', tag: 'guests' },
  { method: 'post', pathSuffix: '/events/{eventId}/guests', tag: 'guests' },
  {
    method: 'get',
    pathSuffix: '/events/{eventId}/guest-import/template',
    tag: 'guest-import',
  },
  {
    method: 'post',
    pathSuffix: '/events/{eventId}/guest-import/import',
    tag: 'guest-import',
  },
  {
    method: 'post',
    pathSuffix: '/events/{eventId}/distribution/run',
    tag: 'distribution',
  },
  {
    method: 'get',
    pathSuffix: '/events/{eventId}/distribution',
    tag: 'distribution',
  },
  {
    method: 'post',
    pathSuffix: '/events/{eventId}/distribution/confirm',
    tag: 'distribution',
  },
  {
    method: 'post',
    pathSuffix: '/events/{eventId}/floor-plans',
    tag: 'floor-plans',
  },
  {
    method: 'get',
    pathSuffix: '/events/{eventId}/table-shapes',
    tag: 'table-shapes',
  },
  {
    method: 'get',
    pathSuffix: '/events/{eventId}/companion-groups',
    tag: 'guest-companions',
  },
];

export function resolveOpenApiPath(
  pathSuffix: string,
  globalPrefix = 'api/v1',
): string {
  const normalizedPrefix = globalPrefix.replace(/^\/|\/$/g, '');
  const normalizedSuffix = pathSuffix.startsWith('/')
    ? pathSuffix
    : `/${pathSuffix}`;

  return `/${normalizedPrefix}${normalizedSuffix}`;
}

export function assertPilotOperationsDocumented(document: {
  paths?: Record<
    string,
    Partial<Record<PilotOpenApiOperation['method'], unknown>>
  >;
  tags?: Array<{ name: string }>;
}): void {
  const missing: string[] = [];

  for (const operation of PILOT_OPENAPI_OPERATIONS) {
    const path = resolveOpenApiPath(operation.pathSuffix);
    const pathItem = document.paths?.[path];

    if (!pathItem?.[operation.method]) {
      missing.push(`${operation.method.toUpperCase()} ${path}`);
    }
  }

  const documentedTags = new Set(
    (document.tags ?? []).map((tag) => tag.name),
  );

  for (const tag of PILOT_OPENAPI_TAGS) {
    if (!documentedTags.has(tag.name)) {
      missing.push(`tag:${tag.name}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `OpenAPI piloto incompleto. Elementos ausentes: ${missing.join(', ')}`,
    );
  }
}
