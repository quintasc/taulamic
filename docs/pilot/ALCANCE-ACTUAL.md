# Alcance actual del piloto evaluable

Última revisión documental: **2026-07-12**. Describe exclusivamente la realidad verificable del código y las pruebas.

Leyenda de estados: ver [`README.md`](README.md#limitaciones-conocidas).

---

## Gestión del evento

| Área | Capacidad | Estado | Persistencia | Limitaciones | Evidencia |
|------|-----------|--------|--------------|--------------|-----------|
| Evento | Crear evento | Implementado con persistencia backend | Ficheros JSON (`uploads/`) | Sin fecha/ubicación en API | [`events.controller.ts`](../../apps/api/src/events/events.controller.ts), [`events.e2e-spec.ts`](../../apps/api/test/events.e2e-spec.ts) |
| Evento | Consultar/actualizar configuración | Implementado parcialmente | Backend + `localStorage` (`event-ui-meta.ts`) | Metadatos UI solo locales | [`event-config.controller.ts`](../../apps/api/src/events/event-config.controller.ts), [`event-config-view.tsx`](../../apps/web/src/components/admin/config/event-config-view.tsx) |
| Evento | Estados `configuring` / `plan_approved` | Implementado con persistencia backend | Backend | — | [`manage-distribution.use-case.ts`](../../apps/api/src/distribution/application/manage-distribution.use-case.ts) |
| Evento | Modo colaborativo en UI | Pospuesto | — | Forzado a `anfitrion_exclusivo` | [`pilot-features.ts`](../../apps/web/src/lib/pilot-features.ts) |

---

## Invitados e importación

| Área | Capacidad | Estado | Persistencia | Limitaciones | Evidencia |
|------|-----------|--------|--------------|--------------|-----------|
| Invitados | CRUD manual | Implementado con persistencia backend | Ficheros JSON | Metadatos v2 opcionales en local | [`guests.controller.ts`](../../apps/api/src/guests/guests.controller.ts), [`guests-page-view.tsx`](../../apps/web/src/components/admin/guests/guests-page-view.tsx) |
| Invitados | Plantilla Excel | Implementado con persistencia backend | — | — | [`guest-import.controller.ts`](../../apps/api/src/guest-import/guest-import.controller.ts), [`SDD-01E`](../sdd/SDD-01E-precarga-invitados-excel.md) |
| Invitados | Validación e importación por lotes | Implementado con persistencia backend | Backend | — | [`guest-import.e2e-spec.ts`](../../apps/api/test/guest-import.e2e-spec.ts), [`pilot-flow.e2e-spec.ts`](../../apps/api/test/pilot-flow.e2e-spec.ts) |
| Invitados | `acompananteKey` desde Excel | Implementado con persistencia backend | Backend | — | [`especificacion-plantilla-excel-v1.md`](../product/especificacion-plantilla-excel-v1.md) |

---

## Relaciones, preferencias y acompañantes

| Área | Capacidad | Estado | Persistencia | Limitaciones | Evidencia |
|------|-----------|--------|--------------|--------------|-----------|
| Relaciones | Grupos de acompañantes (motor) | Implementado con persistencia backend | Backend | Separar/revertir sin UI admin | [`guest-companions.controller.ts`](../../apps/api/src/guest-companions/guest-companions.controller.ts), [`guest-companions.e2e-spec.ts`](../../apps/api/test/guest-companions.e2e-spec.ts) |
| Relaciones | Afinidades invitado↔invitado y categoría↔categoría | Implementado parcialmente | Config en `localStorage`; envío en `run` | **Funcionalidad operativa; configuración con persistencia incompleta** | [`preferences-affinity-view.tsx`](../../apps/web/src/components/admin/preferences/preferences-affinity-view.tsx), [`event-ui-meta.ts`](../../apps/web/src/lib/event-ui-meta.ts) |
| Relaciones | Reglas blandas (`softRules`) | Implementado parcialmente | `localStorage` → `run` | Misma limitación de persistencia | [`distribution.controller.ts`](../../apps/api/src/distribution/distribution.controller.ts), [`soft-rules.ts`](../../apps/api/src/distribution/domain/soft-rules.ts) |
| Relaciones | Modo preferencias API | Implementado con persistencia backend | Backend | UI solo anfitrión exclusivo | [`guest-preferences.e2e-spec.ts`](../../apps/api/test/guest-preferences.e2e-spec.ts), [`ADR-012`](../adr/ADR-012-modo-control-preferencias-y-regla-acompanantes.md) |
| Relaciones | Override manual acompañantes (warning) | Implementado con persistencia backend | Backend + auditoría | — | [`ADR-022`](../adr/ADR-022-override-manual-hu05-vs-reglas-duras.md), enmienda [2b](../sdd/SDD-PILOTO-enmienda-HU05-fase2b-overrides-y-plano-asientos.md) |

---

## Configuración de mesas

| Área | Capacidad | Estado | Persistencia | Limitaciones | Evidencia |
|------|-----------|--------|--------------|--------------|-----------|
| Mesas | Alta/edición/eliminación | Implementado con persistencia backend | Backend | Bloqueadas tras `plan_approved` | [`event-config.controller.ts`](../../apps/api/src/events/event-config.controller.ts), [`tables-setup-view.tsx`](../../apps/web/src/components/admin/tables/tables-setup-view.tsx) |
| Mesas | Formas y topología de asientos | Implementado con persistencia backend | Backend | — | [`table-shapes.controller.ts`](../../apps/api/src/events/table-shapes.controller.ts), [`table-shapes.e2e-spec.ts`](../../apps/api/test/table-shapes.e2e-spec.ts) |

---

## Motor de distribución

| Área | Capacidad | Estado | Persistencia | Limitaciones | Evidencia |
|------|-----------|--------|--------------|--------------|-----------|
| Motor | CP-SAT v1 (dos fases: mesa + silla) | Implementado / ampliación adelantada | Resultado en backend | Default (`DISTRIBUTION_ENGINE=v1`); E2E API usan el mismo criterio | [`cp-sat-distribution.engine.ts`](../../apps/api/src/distribution/domain/cp-sat-distribution.engine.ts), [`ADR-023`](../adr/ADR-023-motor-cpsat-dos-fases-mesa-y-asiento.md) |
| Motor | Motor v0 (fallback) | Implementado con persistencia backend | Backend | Activable con `DISTRIBUTION_ENGINE=v0` (prod o e2e) | [`motor-v0.strategy.ts`](../../apps/api/src/distribution/domain/motor-v0.strategy.ts) |
| Motor | Cálculo asíncrono (`run` / `status`) | Implementado con persistencia backend | Tracker en memoria de proceso | Sin cola BullMQ externa | [`run-distribution-async.service.ts`](../../apps/api/src/distribution/application/run-distribution-async.service.ts) |
| Motor | Una propuesta (sin Top-K) | Implementado con persistencia backend | Backend | Top-K pospuesto (HU-09) | [`DECISION-002`](../agile/DECISION-002-mvp-julio-piloto-funcional.md) |
| Motor | Agrupación por categoría / reparto proporcional | Implementado con persistencia backend | — | — | [`category-grouping.ts`](../../apps/api/src/distribution/domain/category-grouping.ts), [`ADR-024`](../adr/ADR-024-reparto-proporcional-por-categoria.md) |

---

## Ajustes manuales

| Área | Capacidad | Estado | Persistencia | Limitaciones | Evidencia |
|------|-----------|--------|--------------|--------------|-----------|
| Manual | Desasignar invitado (✕) | Implementado con persistencia backend | Backend | Solo en `draft` | [`distribution.e2e-spec.ts`](../../apps/api/test/distribution.e2e-spec.ts) |
| Manual | Asignar invitado (+) | Implementado con persistencia backend | Backend | — | [`assign-guest-to-distribution.use-case.ts`](../../apps/api/src/distribution/application/assign-guest-to-distribution.use-case.ts) |
| Manual | Mover entre mesas | Implementado con persistencia backend | Backend | Drag + diálogo en UI | [`move-guest-in-distribution.use-case.ts`](../../apps/api/src/distribution/application/move-guest-in-distribution.use-case.ts), [`move-guest-dialog.tsx`](../../apps/web/src/components/admin/distribution/move-guest-dialog.tsx) |
| Manual | Recálculo de score tras mutación | Implementado con persistencia backend | Backend | — | [`evaluate-distribution-score.ts`](../../apps/api/src/distribution/domain/evaluate-distribution-score.ts) |

---

## Plano del salón

| Área | Capacidad | Estado | Persistencia | Limitaciones | Evidencia |
|------|-----------|--------|--------------|--------------|-----------|
| Plano | Room-setup Fase A (forma, medidas, accesorios) | Implementado parcialmente | API + cache local | Dual write API/local | [`floor-plan-setup-view.tsx`](../../apps/web/src/components/admin/floor-plan/floor-plan-setup-view.tsx), [`ADR-020`](../adr/ADR-020-api-persistencia-room-setup-fase-a.md) |
| Plano | Layout con mesas posicionadas | Implementado parcialmente | Posiciones custom en `localStorage` | `taulamic:customLayoutPositions:{eventId}` | [`floor-plan-layout-view.tsx`](../../apps/web/src/components/admin/floor-plan/floor-plan-layout-view.tsx) |
| Plano | Subida imagen/PDF + detección | Implementado en backend / sin UI piloto | Backend | Ver sección técnica sin UI | [`floor-plans.controller.ts`](../../apps/api/src/floor-plans/floor-plans.controller.ts) |

---

## Asignación por sillas

| Área | Capacidad | Estado | Persistencia | Limitaciones | Evidencia |
|------|-----------|--------|--------------|--------------|-----------|
| Sillas | `seatIndex` / `seatLabel` en propuesta | Implementado con persistencia backend | Backend (canónico) | **API canónica; estado local auxiliar todavía coexistente** | [`distribution.types.ts`](../../apps/api/src/distribution/domain/distribution.types.ts), [`PUT .../seat`](../../apps/api/src/distribution/distribution.controller.ts) |
| Sillas | Cambio de silla (`PUT placements/:guestId/seat`) | Implementado con persistencia backend | Backend | Sin E2E API dedicado | [`update-guest-seat-in-distribution.use-case.ts`](../../apps/api/src/distribution/application/update-guest-seat-in-distribution.use-case.ts), [`update-guest-seat-in-proposal.spec.ts`](../../apps/api/src/distribution/domain/update-guest-seat-in-proposal.spec.ts) |
| Sillas | Visualización S1…Sn y DnD a silla | Implementado parcialmente | API + `localStorage` (`guestChairs`) | Pendiente unificar mecanismos | [`distribution-table-seat-visual.tsx`](../../apps/web/src/components/admin/distribution/distribution-table-seat-visual.tsx), enmienda [2c](../sdd/SDD-PILOTO-enmienda-HU05-fase2c-sillas-distribucion-estrella.md) |
| Sillas | Estrella presidencial (orientación) | Implementado con persistencia local | `taulamic:presidentialChairs:{eventId}` | No en API | [`distribution-table-list.tsx`](../../apps/web/src/components/admin/distribution/distribution-table-list.tsx) |
| Sillas | Asignación en motor CP-SAT Fase 2 | Implementado con persistencia backend | Backend | — | [`seat-assignment-fallback.ts`](../../apps/api/src/distribution/domain/seat-assignment-fallback.ts), [`smoke-cpsat-seats.cjs`](../../apps/api/scripts/smoke-cpsat-seats.cjs) |

---

## Confirmación

| Área | Capacidad | Estado | Persistencia | Limitaciones | Evidencia |
|------|-----------|--------|--------------|--------------|-----------|
| Confirmación | Confirmar distribución | Implementado con persistencia backend | Backend | Irreversible en piloto | [`distribution.controller.ts`](../../apps/api/src/distribution/distribution.controller.ts) (`POST confirm`) |
| Confirmación | Bloqueo recálculo y edición mesas | Implementado con persistencia backend | Backend | — | [`distribution.e2e-spec.ts`](../../apps/api/test/distribution.e2e-spec.ts), [`pilot-flow.spec.ts`](../../apps/web/e2e/pilot-flow.spec.ts) |

---

## Exportación e informes

| Área | Capacidad | Estado | Persistencia | Limitaciones | Evidencia |
|------|-----------|--------|--------------|--------------|-----------|
| Exportación | Informe PDF al confirmar | Implementado parcialmente | **Generado en frontend; no persistido como documento backend** | HU-08 parcial; sin documento cocina | [`distribution-report-pdf.ts`](../../apps/web/src/lib/distribution-report-pdf.ts), [`distribution-calculated-view.tsx`](../../apps/web/src/components/admin/distribution/distribution-calculated-view.tsx) |
| Exportación | Documento cocina (HU-08) | No implementado | — | Fuera del piloto | [`SDD-01`](../sdd/SDD-01-borrador-mvp.md) HU-08 |

---

## Auditoría y gobernanza

| Área | Capacidad | Estado | Persistencia | Limitaciones | Evidencia |
|------|-----------|--------|--------------|--------------|-----------|
| Auditoría | Registro de mutaciones de placements | Implementado con persistencia backend | Ficheros | Sin UI de consulta | [`record-distribution-placement-audit.ts`](../../apps/api/src/distribution/application/record-distribution-placement-audit.ts) |
| Auditoría | Histórico unificado gobernanza | Implementado en backend / sin UI piloto | Backend | Solo vía API | [`event-governance-audit.controller.ts`](../../apps/api/src/event-governance-audit/event-governance-audit.controller.ts), [`event-governance-audit.e2e-spec.ts`](../../apps/api/test/event-governance-audit.e2e-spec.ts) |

---

## Pruebas y calidad

| Área | Capacidad | Estado | Persistencia | Limitaciones | Evidencia |
|------|-----------|--------|--------------|--------------|-----------|
| Pruebas | E2E API flujo piloto | Implementado | — | Motor forzado a v0 | [`pilot-flow.e2e-spec.ts`](../../apps/api/test/pilot-flow.e2e-spec.ts) |
| Pruebas | E2E Playwright flujo admin | Implementado | — | Sin PDF ni `PUT seat` | [`pilot-flow.spec.ts`](../../apps/web/e2e/pilot-flow.spec.ts), [`guion-validacion-piloto-ui.md`](../agile/guion-validacion-piloto-ui.md) |
| Pruebas | Specs dominio distribución | Implementado | — | — | [`apps/api/src/distribution/domain/*.spec.ts`](../../apps/api/src/distribution/domain/) |
| Pruebas | Smoke/benchmark CP-SAT | Experimental | — | Manual post-build | [`scripts/smoke-cpsat-*.cjs`](../../apps/api/scripts/), [`benchmark-motor.cjs`](../../apps/api/scripts/benchmark-motor.cjs) |
| Pruebas | PDF | No verificable | — | Sin test automatizado | — |

---

## Capacidades técnicas disponibles sin interfaz de usuario

Estas capacidades existen en el código y forman parte del estado técnico actual, pero **no** están en el flujo admin evaluable de punta a punta.

| Capacidad | Estado técnico | UI piloto | Alcance evaluable | Evidencia |
|-----------|----------------|-----------|-------------------|-----------|
| Subida de plano imagen/PDF y detección de mesas | Implementado en backend | No disponible | Fuera del flujo E2E | [`floor-plans.controller.ts`](../../apps/api/src/floor-plans/floor-plans.controller.ts), [`floor-plans.e2e-spec.ts`](../../apps/api/test/floor-plans.e2e-spec.ts) |
| Auditoría de gobernanza | Implementado en backend | No disponible | Uso técnico/interno | [`event-governance-audit.controller.ts`](../../apps/api/src/event-governance-audit/event-governance-audit.controller.ts) |
| Separar o revertir grupos de acompañantes | Implementado en backend | Sin UI dedicada | Parcial (motor sí; gestión manual no) | [`guest-companions.controller.ts`](../../apps/api/src/guest-companions/guest-companions.controller.ts) |
| Sugerencias de restricciones post-import | Implementado en backend | No disponible | Fuera del flujo E2E | [`guest-import.controller.ts`](../../apps/api/src/guest-import/guest-import.controller.ts) (`suggestions`) |

Limitación común: no accesible desde `apps/web` en el piloto actual.

---

## Fuera de alcance

- Top-K y comparador visual (HU-09).
- RSVP, invitaciones y diseño de tarjetas (HU-10, HU-11).
- Publicación programada a invitados (HU-07).
- Documento operativo de cocina (HU-08 completa).
- Portal invitado (HU-02).
- Modo colaborativo en UI.
- PostgreSQL producción, auth JWT/RBAC completo, worker BullMQ.
- Benchmark GA como motor alternativo (ADR-014 sin efecto salvo reversión).

---

## Limitaciones conocidas

1. **Persistencia piloto:** ficheros JSON, no base de datos relacional.
2. **Afinidades:** funcionalidad operativa al calcular; configuración con persistencia incompleta (`localStorage`).
3. **Sillas:** API canónica; estado local auxiliar (`guestChairs`, `presidentialChairs`) pendiente de unificar.
4. **PDF:** generado en frontend; no persistido como documento backend; no sustituye documento de cocina.
5. **Motor:** CP-SAT v1 en producción; tests E2E API validan contrato con v0.
6. **Cálculo async:** en proceso Node; timeout de recuperación si el job se estanca (~4 min).

---

## Deuda funcional o técnica relevante

| Ítem | Descripción |
|------|-------------|
| Unificación sillas | Consolidar `seatIndex` API y mapeos `localStorage` |
| Persistencia afinidades | Centralizar configuración de relaciones/reglas en API |
| HU-08 cocina | Documento específico para cocina pendiente |
| UI auditoría | Consulta de histórico de gobernanza para admin |
| UI floor-plans | Cablear subida/deteción de plano imagen |
| E2E motor v1 | Cobertura automatizada del motor por defecto en producción |
| Tests PDF / `PUT seat` | Sin evidencia automatizada localizada |
