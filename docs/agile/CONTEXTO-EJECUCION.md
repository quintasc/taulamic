# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: 2026-06-18
- Uso: leer este documento al retomar el proyecto tras un corte (apagar equipo, nueva sesion, etc.).

## Frase clave para Cursor

Copiar y pegar en el chat:

```text
Retomo Taulame. Sprint 02 activo (Opcion B). #22 validada tecnicamente (commit 616edd3); pendiente cierre formal en GitHub. Siguiente: push, cerrar #22, empezar #23. Arquitectura: Clean Architecture pragmatica + modulos por feature (ADR-015). SDD manda.
```

## Estado del proyecto en una tabla

| Aspecto | Estado |
|---------|--------|
| Fase | SDD cerrado; ejecucion Agile |
| Decision de sprint | **Opcion B** — ver `DECISION-001-sprint-01-pospuesto-opcion-b.md` |
| Sprint activo | **Sprint 02** (issue #21), hasta ~2026-07-14 |
| Sprint 01 | Pospuesto (#7 Figma, #1 evento, #2 invitados) |
| Issue actual | **#22** — validacion tecnica **completa**; cierre formal en GitHub pendiente |
| Ultimo commit relevante | `616edd3` — tests e2e JPG, PNG, FILE_TOO_LARGE |
| Rama | `main` (verificar si hay commits sin push: `git log origin/main..HEAD`) |
| Codigo | `apps/api/` — NestJS, modulo `floor-plans`, endpoint carga plano |
| Arquitectura backend | Monolito modular (ADR-002) + Clean Architecture pragmatica (ADR-015) |
| Fuente de verdad funcional | SDD — `docs/sdd/SDD-GOVERNANZA-PROTECCION-SDD.md` |

## Proximas acciones (orden)

1. `git push` si el commit `616edd3` no esta en remoto.
2. Cerrar **#22** en GitHub con enlace al commit/PR y evidencia de tests.
3. Iniciar **#23** — deteccion asistida de mesas (HU-32); no abrir hasta cerrar #22.
4. Aplicar ADR-015 de forma progresiva en #23 (caso de uso explicito, dominio separado).

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

1. ~~#22~~ Carga de plano — **validacion tecnica OK**
2. **#23** Deteccion asistida de mesas
3. #24 Editor de correccion manual
4. #25 Persistencia y versionado de layout
5. #26 E2E calidad importacion
6. #27–#31 Excel (cuando #22–#24 estables)
7. #32–#36 Modos de preferencias

## Comandos utiles

```bash
cd apps/api
npm run build
npm test
npm run test:e2e
```
