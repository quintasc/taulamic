# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: 2026-06-18
- Uso: leer este documento al retomar el proyecto tras un corte (apagar equipo, nueva sesion, etc.).

## Frase clave para Cursor

Copiar y pegar en el chat:

```text
Retomo Taulame. Sprint 02 activo (Opcion B). #22 cerrada. #23 implementada (deteccion asistida) — pendiente commit/validacion/cierre GitHub. Siguiente: cerrar #23, empezar #24. Arquitectura: Clean Architecture pragmatica (ADR-015). SDD manda.
```

## Estado del proyecto en una tabla

| Aspecto | Estado |
|---------|--------|
| Fase | SDD cerrado; ejecucion Agile |
| Decision de sprint | **Opcion B** — ver `DECISION-001-sprint-01-pospuesto-opcion-b.md` |
| Sprint activo | **Sprint 02** (issue #21), hasta ~2026-07-14 |
| Sprint 01 | Pospuesto (#7 Figma, #1 evento, #2 invitados) |
| Issue actual | **#23** — implementada en codigo; **pendiente commit y cierre formal** |
| Issue anterior | **#22** — **cerrada** en GitHub |
| Codigo | `apps/api/` — upload plano + `POST .../floor-plans/:id/detect` |
| Arquitectura backend | Monolito modular (ADR-002) + Clean Architecture pragmatica (ADR-015) |
| Fuente de verdad funcional | SDD — `docs/sdd/SDD-GOVERNANZA-PROTECCION-SDD.md` |

## Proximas acciones (orden)

1. Commit de la implementacion #23 (si aun no esta commiteada).
2. Validar build + tests (`npm run build`, `npm test`, `npm run test:e2e`).
3. Push y cerrar **#23** en GitHub con evidencia.
4. Iniciar **#24** — editor de correccion manual y confirmacion final.

## Documentos de referencia rapida

| Pregunta | Donde mirar |
|----------|-------------|
| Que sprint toca y en que orden | `docs/agile/sprint-02-plan.md` (seccion 4) |
| Por que Sprint 01 esta pospuesto | `docs/agile/DECISION-001-sprint-01-pospuesto-opcion-b.md` |
| Cuando un cambio se acepta tecnicamente | `docs/agile/politica-validacion-tests-y-cobertura.md` |
| Reglas funcionales del plano | `docs/sdd/SDD-01D-importacion-plano-salon.md` |
| Arquitectura y capas | `docs/adr/ADR-015-clean-architecture-pragmatica-y-features.md` |
| Patrones de dominio | `docs/adr/ADR-004-patrones-diseno-mvp.md` |

## Secuencia Sprint 02 (resumen)

1. ~~#22~~ Carga de plano — **cerrada**
2. **#23** Deteccion asistida — **codigo listo, cierre pendiente**
3. **#24** Editor de correccion manual — **siguiente**
4. #25 Persistencia y versionado de layout
5. #26 E2E calidad importacion
6. #27–#31 Excel (cuando #22–#24 estables)
7. #32–#36 Modos de preferencias

## API relevante (#23)

```http
POST /api/v1/events/:eventId/floor-plans/:floorPlanId/detect
```

Respuesta: propuesta de mesas (`shape`, `estimatedCapacity`, `confidence`), `status` (`completed` | `partial` | `failed`), `manualFallbackAvailable: true`.

## Comandos utiles

```bash
cd apps/api
npm run build
npm test
npm run test:e2e
```
