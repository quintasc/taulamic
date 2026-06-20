# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: 2026-06-18
- Uso: leer este documento al retomar el proyecto tras un corte (apagar equipo, nueva sesion, etc.).

## Frase clave para Cursor

Copiar y pegar en el chat:

```text
Retomo Taulame. Sprint 02 activo (Opcion B). #22 y #23 cerradas. #24 implementada (editor + confirmacion) — pendiente commit/cierre GitHub. Siguiente: cerrar #24, empezar #25. Arquitectura: Clean Architecture pragmatica (ADR-015). SDD manda.
```

## Estado del proyecto en una tabla

| Aspecto | Estado |
|---------|--------|
| Fase | SDD cerrado; ejecucion Agile |
| Decision de sprint | **Opcion B** — ver `DECISION-001-sprint-01-pospuesto-opcion-b.md` |
| Sprint activo | **Sprint 02** (issue #21), hasta ~2026-07-14 |
| Sprint 01 | Pospuesto (#7 Figma, #1 evento, #2 invitados) |
| Issue actual | **#24** — implementada; **pendiente commit y cierre formal** |
| Issues cerradas recientes | **#22**, **#23** |
| Codigo | upload + detect + draft CRUD + confirmacion |
| Arquitectura backend | Monolito modular (ADR-002) + Clean Architecture pragmatica (ADR-015) |
| Fuente de verdad funcional | SDD — `docs/sdd/SDD-GOVERNANZA-PROTECCION-SDD.md` |

## Proximas acciones (orden)

1. Commit + push de #24.
2. Cerrar **#24** en GitHub con evidencia de tests.
3. Iniciar **#25** — persistencia y versionado de layout importado.

## Secuencia Sprint 02 (resumen)

1. ~~#22~~ Carga de plano — **cerrada**
2. ~~#23~~ Deteccion asistida — **cerrada**
3. **#24** Editor y confirmacion — **codigo listo, cierre pendiente**
4. **#25** Persistencia y versionado — **siguiente**
5. #26 E2E calidad importacion
6. #27–#31 Excel
7. #32–#36 Modos de preferencias

## API relevante (#24)

```http
GET    /api/v1/events/:eventId/floor-plans/:floorPlanId/draft
POST   /api/v1/events/:eventId/floor-plans/:floorPlanId/draft/tables
PUT    /api/v1/events/:eventId/floor-plans/:floorPlanId/draft/tables/:tableId
DELETE /api/v1/events/:eventId/floor-plans/:floorPlanId/draft/tables/:tableId
POST   /api/v1/events/:eventId/floor-plans/:floorPlanId/draft/confirm   { "confirmed": true }
GET    /api/v1/events/:eventId/floor-plans/:floorPlanId/confirmed
```

## Comandos utiles

```bash
cd apps/api
npm run build
npm test
npm run test:e2e
```
