# AGENTS.md — instrucciones para agentes de IA

Instrucciones portables para cualquier agente que trabaje en este repositorio.
Las reglas específicas de Cursor viven en `.cursor/rules/` y **complementan** este archivo; no lo sustituyen.

## Fuentes de verdad

1. El **SDD** manda sobre implementación, tests y alcance funcional. Ver `docs/sdd/SDD-GOVERNANZA-PROTECCION-SDD.md`.
2. No rebajes, elimines ni reinterpretés requisitos del SDD sin **aprobación explícita** del usuario.
3. Mapa de docs: `docs/README.md`. Alcance piloto: `docs/pilot/` (`README.md`, `ALCANCE-ACTUAL.md`, `TRAZABILIDAD.md`). Runtime: `docs/arquitectura/arquitectura-operativa-piloto.md`.
4. Decisiones técnicas: `docs/adr/`. Patrones y Clean Architecture pragmática: ADR-015.
5. Validación de tests/cobertura: `docs/agile/politica-validacion-tests-y-cobertura.md`.
6. Al retomar trabajo, consulta el estado operativo en `docs/agile/CONTEXTO-EJECUCION.md`.
7. Checklist de docs derivados: ver sección **Documentación al cerrar un cambio** más abajo (y mapa en `docs/README.md`).

## Cómo trabajar

- Deriva tests del SDD; no adaptes el SDD para que pasen tests.
- Si un test falla, corrige primero la implementación para cumplir el SDD.
- Puedes refactorizar, mejorar arquitectura y corregir bugs técnicos **sin** cambiar alcance funcional.
- Ante conflicto SDD ↔ tests ↔ código: **detente**, explica el conflicto, alternativas e impacto; espera aprobación.
- Sigue el estilo y convenciones del código existente (Clean Architecture por feature, TypeScript, Nest/Next).
- Ejecuta tests proporcionales al cambio (unitarios del área tocada; E2E solo si el flujo lo requiere).
- **No** hagas `commit` ni `push` salvo petición explícita del usuario.
- Responde y documenta en **español**.

## Documentación al cerrar un cambio

En **cada** cambio relevante (feature, bugfix de producto, API, motor, persistencia, alcance piloto), el agente debe:

1. **Valorar** si hace falta actualizar documentación (markdown humano y/o artefactos derivados como OpenAPI). No asumir que ya está al día.
2. **Si la respuesta es no:** no regenerar ni editar docs por inercia; puedes mencionar brevemente que no aplica.
3. **Si la respuesta es sí:** pedir **permiso explícito** al usuario antes de actuar, indicando qué docs tocaría y qué comandos ejecutaría (p. ej. `npm run docs:openapi`).
4. **Solo tras el permiso:** ejecutar esos comandos y/o aplicar las ediciones de markdown.

Checklist orientativo (ampliar según el cambio):

| Si tocaste… | Valorar actualizar | Comando (si aplica, tras permiso) |
|-------------|--------------------|-----------------------------------|
| Controladores, DTOs, decoradores Swagger | `docs/api/openapi.json` (CI lo exige al día) | `npm run docs:openapi` |
| Runtime (async motor, persistencia, módulos, deploy) | `docs/arquitectura/arquitectura-operativa-piloto.md` | — (markdown; también con permiso) |
| Capacidad evaluable del piloto | `docs/pilot/ALCANCE-ACTUAL.md`, `TRAZABILIDAD.md`, a veces `pilot/README.md` | — |
| Mapa de entrada / rutas de lectura | `docs/README.md` | — |
| Requisitos o criterios de aceptación | SDD / enmiendas (solo con aprobación explícita) | — |
| Decisión técnica estable | ADR nuevo o enmienda de ADR | — |

Notas:

- OpenAPI **no** se auto-commitea en push: CI regenera y **falla** si el JSON del repo está desfasado; regenerarlo en el PR solo tras permiso del usuario.
- SDD, ADR, ALCANCE y el mapa **no** se regeneran solos; la valoración de necesidad es obligatoria aunque el único comando sea OpenAPI.
- Detalle para humanos: `docs/README.md` → sección homónima.

## Comunicación

- Responde de forma **directa, clara y breve**.
- Ve al grano: lo necesario para la pregunta o la tarea; evita relleno y repeticiones.
- **No inventes** APIs, archivos, comportamientos, resultados de tests ni estado del repo. Si no lo sabes, dilo o compruébalo en el código/docs.
- Atiende a **best practices** del stack del proyecto (TypeScript, NestJS, Next.js, pruebas, seguridad básica) sin sobreingeniería.

## Estilo de código (legibilidad)

Al generar o modificar código, prioriza que un técnico pueda leerlo sin adivinar:

### Nomenclatura

- Usa nombres **descriptivos** (intención clara en el identificador).
- Respeta las **convenciones del lenguaje y del stack** del archivo (TypeScript/Nest/Next ya usados en el repo: `camelCase` para variables/funciones, `PascalCase` para tipos/clases/componentes, `SCREAMING_SNAKE` o `camelCase` const exportada según el entorno del módulo, etc.). Alinea con el código vecino.
- **Funciones y métodos:** verbos o sintagmas verbales (`calculateDistribution`, `assignGuestToTable`).
- **Variables, propiedades y tipos:** sustantivos o sintagmas nominales (`guestCount`, `softRules`, `DistributionProposal`).
- Booleanos: prefijos claros (`isReady`, `hasConflict`, `canConfirm`).
- Evita abreviaturas opacas (`tmp`, `x1`, `data2`) salvo convenciones muy locales ya establecidas (p. ej. índices de bucle cortos).

### Constantes y números mágicos

- Evita literales numéricos/string opacos en lógica de negocio (`4`, `0.15`, `'v1'` sueltos) cuando el significado no sea obvio en contexto.
- Prefiere **constantes con nombre descriptivo** (o enums/uniones tipadas) cerca del dominio que las usa.
- Excepciones razonables: `0`/`1` en bucles o offsets triviales; literales de test evidentes; valores exigidos por una API externa ya documentada junto al uso.

### SOLID (pragmático)

- Aplica SOLID **cuando encaje** con el módulo y el ADR-015 (Clean Architecture pragmática): responsabilidades claras, dependencias hacia abstracciones donde ya hay puertos/Strategy, etc.
- **No** sobrecargues el proyecto: no inventes capas, interfaces o factories vacías “por SOLID”. El MVP/piloto prioriza claridad y tests del SDD frente a pureza académica.
- Ante duda, mira el módulo vecino (p. ej. `distribution`) y sigue el mismo nivel de abstracción.

### Evitar código spaghetti

- Evita lógica enmarañada, “god” controllers/páginas o ficheros que mezclan HTTP, reglas de negocio y persistencia sin límite.
- Prefiere módulos por feature, use cases y dominio (ADR-015): el controller/orquestador solo coordina; la regla de negocio vive fuera.
- Extrae funciones/métodos pequeños con una responsabilidad clara cuando un bloque crezca o se vuelva difícil de seguir.
- No confundir esto con sobreingeniería: estructurar lo suficiente para mantener y testear, sin capas vacías.

### Comentarios

- Comentarios **útiles** para alguien técnico: invariantes no triviales, workarounds, algoritmos densos, contrato sutil con SDD/motor.
- **No** comentes trivialidades ni el “qué” que ya dicen nombres y tipos.
- Prefiere nombres claros y funciones pequeñas frente a comentarios largos.

## No duplicar aquí

No copies el contenido completo del SDD, ADRs o guías UX. Enlaza y aplica. Detalle de estilo UI: `.cursor/rules/guia-estilo-ux.mdc`. Estilo de código (resumen Cursor): `.cursor/rules/estilo-codigo-legibilidad.mdc`. Protección funcional detallada: `.cursor/rules/sdd-proteccion-funcional.mdc`.
