# Empieza aquí

Mapa de entrada a la documentación de Taulamic. No hace falta leer todo: elige el camino según tu rol.

**Antes de tocar código**, lee también [`AGENTS.md`](../AGENTS.md) (instrucciones para agentes y desarrolladores) y la gobernanza SDD enlazada más abajo. La portada pública del producto está en el [`README.md`](../README.md) de la raíz.

## Qué se actualiza solo y qué no

| Artefacto | ¿Automático en cada push? | Cómo se mantiene |
|-----------|---------------------------|------------------|
| `docs/api/openapi.json` | **Sí (verificado en CI)** | Se regenera con `npm run docs:openapi` en `apps/api`. El workflow falla si el JSON del repo no coincide con el código. |
| Este mapa, arquitectura operativa, SDD, ADR, ALCANCE, TRAZABILIDAD | **No** | Markdown humano: se actualiza en PRs cuando cambia el producto o las decisiones. |

La UI en vivo (`/api/docs`) también se regenera al arrancar Nest; el JSON versionado es la copia de contrato para revisión y CI.

## Documentación al cerrar un cambio

En cada cambio relevante hay que **valorar** si estos docs/artefactos deben actualizarse. Si **sí**, el agente pide **permiso al usuario** y solo entonces ejecuta los comandos o ediciones que actualicen esa documentación (norma en `AGENTS.md`). Si **no**, no regenera ni edita docs por inercia.

| Si tocaste… | Valorar | Tras permiso |
|-------------|---------|--------------|
| API / Swagger | `api/openapi.json` | `npm run docs:openapi` (incluir el JSON en el PR) |
| Cómo corre el sistema | `arquitectura/arquitectura-operativa-piloto.md` | Editar a mano |
| Alcance piloto | `pilot/ALCANCE-ACTUAL.md`, `TRAZABILIDAD.md` | Editar a mano |
| Entrada a la docs | este `README.md` | Editar a mano |
| Requisitos / decisiones | SDD, ADR | Solo con aprobación explícita si cambia alcance |

---

## Rutas rápidas

### 1) Quiero entender el piloto (evaluable ahora)

1. [`pilot/README.md`](pilot/README.md) — índice del piloto
2. [`pilot/ALCANCE-ACTUAL.md`](pilot/ALCANCE-ACTUAL.md) — qué hay implementado y límites
3. [`pilot/TRAZABILIDAD.md`](pilot/TRAZABILIDAD.md) — enlaces código ↔ docs
4. [`pilot/EVOLUCION-DEL-ALCANCE.md`](pilot/EVOLUCION-DEL-ALCANCE.md) — cómo cambió el alcance
5. [`agile/DECISION-002-mvp-julio-piloto-funcional.md`](agile/DECISION-002-mvp-julio-piloto-funcional.md) — hito piloto

### 2) Voy a tocar código (agente o desarrollador)

1. [`../AGENTS.md`](../AGENTS.md) — instrucciones y estilo de trabajo
2. [`sdd/SDD-GOVERNANZA-PROTECCION-SDD.md`](sdd/SDD-GOVERNANZA-PROTECCION-SDD.md) — el SDD manda
3. [`agile/politica-validacion-tests-y-cobertura.md`](agile/politica-validacion-tests-y-cobertura.md) — cuándo un cambio se acepta
4. [`agile/CONTEXTO-EJECUCION.md`](agile/CONTEXTO-EJECUCION.md) — estado y siguiente acción
5. [`arquitectura/arquitectura-operativa-piloto.md`](arquitectura/arquitectura-operativa-piloto.md) — cómo corre el sistema hoy
6. Contrato API: [`api/openapi.json`](api/openapi.json) · guía [`api/openapi-nestjs-guia.md`](api/openapi-nestjs-guia.md)

### 3) Producto / requisitos (visión completa, no solo piloto)

1. [`sdd/SDD-00-vision-y-estrategia.md`](sdd/SDD-00-vision-y-estrategia.md)
2. [`product/PRD-v1.md`](product/PRD-v1.md)
3. [`sdd/SDD-01-borrador-mvp.md`](sdd/SDD-01-borrador-mvp.md)
4. Resto de SDD en [`sdd/`](sdd/) (UI/Figma, Excel, plano, IA, backlog…)
5. ADRs en [`adr/`](adr/) según el tema (motor, Excel, plano, preferencias…)
6. Especificaciones de producto en [`product/`](product/) (plantilla Excel, modo preferencias…)

### 4) Motor de distribución

1. [`arquitectura/arquitectura-operativa-piloto.md`](arquitectura/arquitectura-operativa-piloto.md) (flujo `run` / `status`)
2. [`adr/ADR-023-motor-cpsat-dos-fases-mesa-y-asiento.md`](adr/ADR-023-motor-cpsat-dos-fases-mesa-y-asiento.md)
3. [`adr/ADR-024-reparto-proporcional-por-categoria.md`](adr/ADR-024-reparto-proporcional-por-categoria.md)
4. [`arquitectura/decision-motor-para-principiantes.md`](arquitectura/decision-motor-para-principiantes.md)
5. Estudios y comparativas en [`arquitectura/`](arquitectura/)

### 5) Arrancar en local

Ver el [`README.md`](../README.md) de la raíz (`npm run install:apps` · `npm run dev`).

### 6) Principiantes / glosario / UX

1. [`glosario/glosario-principiantes.md`](glosario/glosario-principiantes.md)
2. [`agile/agile-para-principiantes.md`](agile/agile-para-principiantes.md)
3. [`ux/handoff-figma-a-frontend.md`](ux/handoff-figma-a-frontend.md)

---

## Inventario por carpeta

El listado archivo a archivo del README de la raíz se retiró a favor de este mapa. Usa la carpeta correspondiente (y las rutas rápidas de arriba):

| Carpeta | Contenido |
|---------|-----------|
| [`pilot/`](pilot/) | Alcance evaluable, evidencias, evolución, trazabilidad |
| [`sdd/`](sdd/) | Spec-Driven Development (fuente de verdad funcional) |
| [`adr/`](adr/) | Decisiones de arquitectura |
| [`arquitectura/`](arquitectura/) | Runtime del piloto, patrones, estudios del motor |
| [`agile/`](agile/) | Decisiones de ejecución, sprints, contexto, políticas de tests |
| [`api/`](api/) | OpenAPI exportado + guía NestJS |
| [`product/`](product/) | PRD y especificaciones de producto |
| [`ux/`](ux/) | Handoff Figma → frontend |
| [`glosario/`](glosario/) | Términos para principiantes |
