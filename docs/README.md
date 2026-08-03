# Empieza aquí

Mapa de docs de Taulamic. Elige una ruta; no hace falta leer todo.

- Portada del producto: [`../README.md`](../README.md)
- Agentes / cómo trabajar: [`../AGENTS.md`](../AGENTS.md)

## Jerarquía (qué manda)

| Prioridad | Dónde |
|-----------|--------|
| Requisitos funcionales | [`sdd/`](sdd/) — gobernanza: [`SDD-GOVERNANZA-PROTECCION-SDD.md`](sdd/SDD-GOVERNANZA-PROTECCION-SDD.md) |
| Alcance evaluable / siguiente paso | [`pilot/`](pilot/), [`agile/CONTEXTO-EJECUCION.md`](agile/CONTEXTO-EJECUCION.md) |
| Decisiones técnicas | [`adr/`](adr/) |
| Cómo trabajar (agentes y devs) | [`../AGENTS.md`](../AGENTS.md) |
| Este mapa | rutas e inventario abajo |

---

## Rutas rápidas

### 1) Entender el piloto (evaluable ahora)

1. [`pilot/README.md`](pilot/README.md) — índice
2. [`pilot/ALCANCE-ACTUAL.md`](pilot/ALCANCE-ACTUAL.md) — qué hay y límites
3. [`pilot/TRAZABILIDAD.md`](pilot/TRAZABILIDAD.md) — código ↔ docs
4. [`pilot/EVOLUCION-DEL-ALCANCE.md`](pilot/EVOLUCION-DEL-ALCANCE.md) — cómo cambió el alcance
5. [`agile/DECISION-002-mvp-julio-piloto-funcional.md`](agile/DECISION-002-mvp-julio-piloto-funcional.md) — hito piloto

### 2) Tocar código (agente o desarrollador)

1. [`../AGENTS.md`](../AGENTS.md) — instrucciones y estilo
2. [`sdd/SDD-GOVERNANZA-PROTECCION-SDD.md`](sdd/SDD-GOVERNANZA-PROTECCION-SDD.md) — el SDD manda
3. [`agile/politica-validacion-tests-y-cobertura.md`](agile/politica-validacion-tests-y-cobertura.md) — cuándo se acepta un cambio
4. [`agile/CONTEXTO-EJECUCION.md`](agile/CONTEXTO-EJECUCION.md) — estado y siguiente acción
5. [`arquitectura/arquitectura-operativa-piloto.md`](arquitectura/arquitectura-operativa-piloto.md) — runtime actual
6. API: [`api/openapi.json`](api/openapi.json) · guía [`api/openapi-nestjs-guia.md`](api/openapi-nestjs-guia.md)

Luego el SDD/ADR del tema concreto (issue o CONTEXTO).

### 3) Producto / requisitos (visión completa)

1. [`sdd/SDD-00-vision-y-estrategia.md`](sdd/SDD-00-vision-y-estrategia.md)
2. [`product/PRD-v1.md`](product/PRD-v1.md)
3. [`sdd/SDD-01-borrador-mvp.md`](sdd/SDD-01-borrador-mvp.md)
4. Resto de [`sdd/`](sdd/) (UI, Excel, plano, IA, backlog…)
5. [`adr/`](adr/) según tema
6. Specs en [`product/`](product/)

### 4) Motor de distribución

1. [`arquitectura/arquitectura-operativa-piloto.md`](arquitectura/arquitectura-operativa-piloto.md) (`run` / `status`)
2. [`adr/ADR-023-motor-cpsat-dos-fases-mesa-y-asiento.md`](adr/ADR-023-motor-cpsat-dos-fases-mesa-y-asiento.md)
3. [`adr/ADR-024-reparto-proporcional-por-categoria.md`](adr/ADR-024-reparto-proporcional-por-categoria.md)
4. [`arquitectura/decision-motor-para-principiantes.md`](arquitectura/decision-motor-para-principiantes.md)
5. Más estudios en [`arquitectura/`](arquitectura/)

### 5) Arrancar en local

[`../README.md`](../README.md) — `npm run install:apps` · `npm run dev`.

### 6) Principiantes / UX

1. [`glosario/glosario-principiantes.md`](glosario/glosario-principiantes.md)
2. [`agile/agile-para-principiantes.md`](agile/agile-para-principiantes.md)
3. UX canónica: [`ux/guia-estilo-taulamic.md`](ux/guia-estilo-taulamic.md) · tokens [`ux/design-tokens-mvp.md`](ux/design-tokens-mvp.md) · handoff [`ux/handoff-figma-a-frontend.md`](ux/handoff-figma-a-frontend.md)

---

## Mantener documentación

| Artefacto | ¿Auto en push? | Cómo se mantiene |
|-----------|----------------|------------------|
| [`api/openapi.json`](api/openapi.json) | Sí (CI verifica) | `npm run docs:openapi` en `apps/api`; el workflow falla si el JSON del repo no coincide |
| Este mapa, arquitectura, SDD, ADR, ALCANCE, TRAZABILIDAD | No | Markdown en PRs cuando cambie producto o decisiones |

La UI Swagger (`/api/docs`) se regenera al arrancar Nest; el JSON versionado es el contrato para revisión y CI.

**Al cerrar un cambio:** valorar si hace falta actualizar docs. Si sí, pedir permiso al usuario antes de editar o regenerar (norma en [`AGENTS.md`](../AGENTS.md) § Documentación al cerrar un cambio). Si no, no regenerar por inercia.

| Si tocaste… | Valorar |
|-------------|---------|
| API / Swagger | `api/openapi.json` → `npm run docs:openapi` |
| Runtime | `arquitectura/arquitectura-operativa-piloto.md` |
| Alcance piloto | `pilot/ALCANCE-ACTUAL.md`, `TRAZABILIDAD.md` |
| Entrada a docs | este `README.md` |
| Requisitos / alcance | SDD, ADR — solo con aprobación explícita |

---

## Inventario por carpeta

| Carpeta | Contenido |
|---------|-----------|
| [`pilot/`](pilot/) | Alcance evaluable, evidencias, evolución, trazabilidad |
| [`sdd/`](sdd/) | Spec-Driven Development (fuente de verdad funcional) |
| [`adr/`](adr/) | Decisiones de arquitectura |
| [`arquitectura/`](arquitectura/) | Runtime del piloto, patrones, estudios del motor |
| [`agile/`](agile/) | Ejecución, sprints, CONTEXTO, tests; ideas post-piloto: [`backlog-mejoras-post-piloto.md`](agile/backlog-mejoras-post-piloto.md) |
| [`api/`](api/) | OpenAPI exportado + guía NestJS |
| [`product/`](product/) | PRD y especificaciones |
| [`ux/`](ux/) | Guía de estilo, tokens, handoff Figma → frontend |
| [`glosario/`](glosario/) | Términos para principiantes |
