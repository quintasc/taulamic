# ADR-005 - Documentacion de API con OpenAPI en NestJS

- Estado: Aceptado
- Fecha: 2026-06-17

## Contexto

El stack elegido usa NestJS para backend.
Se necesita documentacion de API clara para frontend, pruebas, integraciones y mantenimiento.

## Decision

Adoptar **OpenAPI 3** con `@nestjs/swagger` como estandar de documentacion de API.

Salida de documentacion:

- UI interactiva tipo Swagger: `/api/docs`
- Especificacion JSON OpenAPI: `/api-json`

## Motivos de la decision

- Integracion nativa con NestJS.
- Facilita contrato API compartido entre frontend y backend.
- Mejora calidad de pruebas e integraciones.
- Menor coste que herramientas externas adicionales en MVP.

## Normas de implementacion obligatorias

- Cada endpoint debe estar decorado con:
  - `@ApiTags`
  - `@ApiOperation`
  - `@ApiResponse` (exito y errores esperados)
- Cada DTO expuesto debe tener metadata con `@ApiProperty`.
- Todos los endpoints autenticados deben declararse con esquema Bearer JWT.
- Cambios breaking de contrato requieren nueva version de API.

## Consecuencias positivas

- Contrato API visible y trazable.
- Menos ambiguedad entre equipos.
- Onboarding mas rapido para nuevas personas.

## Consecuencias negativas

- Trabajo extra de documentacion por endpoint/DTO.
- Riesgo de desactualizacion si no se aplica control en PR.

## Control de calidad recomendado

- Checklist de PR: "API doc actualizada".
- Validar en CI que la app genera OpenAPI sin errores.
- Mantener ejemplos minimos para endpoints clave.

## Comentarios para principiantes

- **OpenAPI:** formato estandar para describir APIs REST.
- **Swagger UI:** vista web para leer y probar endpoints.
- **DTO:** objeto que define datos de entrada/salida de una API.
