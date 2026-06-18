# Guia API - OpenAPI/Swagger para NestJS

## 1) Recomendacion principal

Usar `@nestjs/swagger` como documentacion oficial de API en este proyecto.

Resultado esperado:

- UI interactiva en `/api/docs`
- Especificacion OpenAPI JSON en `/api-json`

## 2) Paquetes sugeridos

- `@nestjs/swagger`
- `swagger-ui-express`

## 3) Configuracion base (main.ts)

1. Crear documento OpenAPI con:
   - titulo de API,
   - descripcion,
   - version.
2. Definir seguridad Bearer JWT.
3. Publicar docs en `/api/docs`.
4. Exponer JSON en `/api-json`.

## 4) Convenciones de documentacion por endpoint

Cada controlador debe incluir:

- `@ApiTags("nombre-modulo")`

Cada endpoint debe incluir:

- `@ApiOperation({ summary: "..." })`
- `@ApiResponse({ status: 200/201/... })`
- `@ApiResponse({ status: 400/401/403/404/... })` segun corresponda.

## 5) Convenciones de DTO

- Cada propiedad publica debe declararse con `@ApiProperty`.
- Campos opcionales deben marcarse como opcionales.
- Enumerados deben documentarse de forma explicita.

## 6) Estandar de errores recomendado

Minimo para MVP:

- Codigo HTTP correcto.
- Mensaje legible.
- Codigo interno opcional para trazabilidad (ejemplo: `SEATING_RULE_CONFLICT`).

## 7) Versionado de API recomendado

- Prefijo inicial: `/api/v1`
- Cambios breaking => nueva version (`v2`) y periodo de convivencia.

## 8) Calidad y mantenimiento

Checklist de PR:

- [ ] Endpoint documentado en OpenAPI.
- [ ] DTOs actualizados.
- [ ] Respuestas de error declaradas.
- [ ] Seguridad declarada cuando aplique.

## 9) Integracion con flujo SDD

- SDD-01 define que debe hacer el endpoint.
- OpenAPI define como se consume el endpoint.
- Ambos deben mantenerse alineados.
- Los tests de API deben derivarse del SDD (`docs/sdd/SDD-GOVERNANZA-PROTECCION-SDD.md`): si un test falla, se corrige la implementacion antes que el requisito.
- Umbrales de cobertura y gates de CI: `docs/agile/politica-validacion-tests-y-cobertura.md`.

## 10) Comentarios para principiantes

- **Endpoint:** URL + metodo HTTP (GET, POST, etc.) de una API.
- **Contrato API:** acuerdo de entrada/salida entre cliente y servidor.
- **Breaking change:** cambio que rompe clientes existentes.
