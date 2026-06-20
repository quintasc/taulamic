# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: 2026-06-18
- Uso: leer este documento al retomar el proyecto tras un corte (apagar equipo, nueva sesion, etc.).

## Frase clave para Cursor

Copiar y pegar en el chat:

```text
Retomo Taulame. Sprint 02 activo (Opcion B). #22-#24 cerradas. #25 implementada (persistencia versionada layout) — pendiente commit/cierre GitHub. Siguiente: cerrar #25, empezar #26. Arquitectura: Clean Architecture pragmatica (ADR-015). SDD manda.
```

## Estado del proyecto en una tabla

| Aspecto | Estado |
|---------|--------|
| Fase | SDD cerrado; ejecucion Agile |
| Sprint activo | **Sprint 02** (issue #21) |
| Issue actual | **#25** — implementada; **pendiente commit y cierre formal** |
| Issues cerradas recientes | **#22**, **#23**, **#24** (commit `51d6f97`) |
| Codigo | upload + detect + draft CRUD + confirm + **layout versionado** |
| Arquitectura backend | Monolito modular + Clean Architecture pragmatica (ADR-015) |

## Proximas acciones (orden)

1. Commit + push de #25.
2. Cerrar **#25** en GitHub.
3. Iniciar **#26** — pruebas E2E y calidad de importacion de plano.

## Secuencia Sprint 02 (resumen)

1. ~~#22~~ ~~#23~~ ~~#24~~ — cerradas
2. **#25** Persistencia versionada — **codigo listo, cierre pendiente**
3. **#26** E2E calidad importacion — **siguiente**

## API relevante (#25)

```http
GET /api/v1/events/:eventId/floor-plans/:floorPlanId/layout-versions
GET /api/v1/events/:eventId/floor-plans/:floorPlanId/layout-versions/:version
GET /api/v1/events/:eventId/floor-plans/:floorPlanId/confirmed   # ultima version
```

Cada confirmacion crea version N con `audit` por mesa (`wasAutoDetected`, `wasManuallyCorrected`, `detectionConfidence`).

## Comandos utiles

```bash
cd apps/api
npm run build && npm test && npm run test:e2e
```
