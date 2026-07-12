# Trazabilidad del piloto evaluable

Índice consolidado de requisitos del **piloto actual**. Los identificadores `PIL-RF-XX` no sustituyen los IDs del SDD; enlazan con ellos.

Leyenda de estado en columna **Estado**: ver definiciones en [`ALCANCE-ACTUAL.md`](ALCANCE-ACTUAL.md).

---

## Flujo admin evaluable

| ID piloto | Capacidad | Estado | Especificación | Implementación | Pruebas | Observaciones |
|-----------|-----------|--------|----------------|----------------|---------|---------------|
| PIL-RF-01 | Crear y consultar evento | Implementado con persistencia backend | SDD-01 · EP-01 · [DECISION-002](../agile/DECISION-002-mvp-julio-piloto-funcional.md) | [`events.controller.ts`](../../apps/api/src/events/events.controller.ts) | [`events.e2e-spec.ts`](../../apps/api/test/events.e2e-spec.ts) | — |
| PIL-RF-02 | Configuración de evento (nombre, estados) | Implementado parcialmente | SDD-01 · [ADR-020](../adr/ADR-020-api-persistencia-room-setup-fase-a.md) | [`event-config.controller.ts`](../../apps/api/src/events/event-config.controller.ts), [`event-config-view.tsx`](../../apps/web/src/components/admin/config/event-config-view.tsx) | [`events-config.e2e-spec.ts`](../../apps/api/test/events-config.e2e-spec.ts) | Metadatos UI en `localStorage` |
| PIL-RF-03 | Importar invitados Excel | Implementado con persistencia backend | [SDD-01E](../sdd/SDD-01E-precarga-invitados-excel.md) · [ADR-011](../adr/ADR-011-precarga-invitados-excel-estandar.md) | [`guest-import.controller.ts`](../../apps/api/src/guest-import/guest-import.controller.ts) | [`guest-import.e2e-spec.ts`](../../apps/api/test/guest-import.e2e-spec.ts), [`pilot-flow.spec.ts`](../../apps/web/e2e/pilot-flow.spec.ts) | — |
| PIL-RF-04 | CRUD invitados manual | Implementado con persistencia backend | SDD-01 HU-13–14 | [`guests.controller.ts`](../../apps/api/src/guests/guests.controller.ts) | [`guests.e2e-spec.ts`](../../apps/api/test/guests.e2e-spec.ts) | — |
| PIL-RF-05 | Acompañantes (`acompananteKey`) | Implementado con persistencia backend | [ADR-012](../adr/ADR-012-modo-control-preferencias-y-regla-acompanantes.md) | [`guest-companions.controller.ts`](../../apps/api/src/guest-companions/guest-companions.controller.ts) | [`guest-companions.e2e-spec.ts`](../../apps/api/test/guest-companions.e2e-spec.ts) | Separar grupo: API sin UI |
| PIL-RF-06 | Afinidades y reglas blandas | Implementado parcialmente | SDD-01 · [ADR-018](../adr/ADR-018-preferencias-afinidades-y-flujo-setup.md) | [`preferences-affinity-view.tsx`](../../apps/web/src/components/admin/preferences/preferences-affinity-view.tsx), [`event-ui-meta.ts`](../../apps/web/src/lib/event-ui-meta.ts) | [`category-grouping-distribution.spec.ts`](../../apps/web/e2e/category-grouping-distribution.spec.ts) | **Funcionalidad operativa; configuración con persistencia incompleta** |
| PIL-RF-07 | Modo preferencias (anfitrión exclusivo) | Implementado parcialmente | SDD-01 HU-16 · DECISION-002 | [`pilot-features.ts`](../../apps/web/src/lib/pilot-features.ts) | [`guest-preferences.e2e-spec.ts`](../../apps/api/test/guest-preferences.e2e-spec.ts) | Colaborativo deshabilitado en UI |
| PIL-RF-08 | Configurar mesas | Implementado con persistencia backend | SDD-01 HU-01 | [`event-config.controller.ts`](../../apps/api/src/events/event-config.controller.ts), [`tables-setup-view.tsx`](../../apps/web/src/components/admin/tables/tables-setup-view.tsx) | [`table-shapes.e2e-spec.ts`](../../apps/api/test/table-shapes.e2e-spec.ts) | Bloqueo tras confirmar |
| PIL-RF-09 | Topología de asientos por forma | Implementado con persistencia backend | [ADR-009](../adr/ADR-009-forma-mesa-y-topologia-de-asientos.md) | [`table-shapes.controller.ts`](../../apps/api/src/events/table-shapes.controller.ts) | [`table-shapes.e2e-spec.ts`](../../apps/api/test/table-shapes.e2e-spec.ts) | — |
| PIL-RF-10 | Plano Fase A (room-setup) | Implementado parcialmente | [ADR-016](../adr/ADR-016-plano-espacial-salon-dos-fases.md) · [ADR-020](../adr/ADR-020-api-persistencia-room-setup-fase-a.md) | [`floor-plan-setup-view.tsx`](../../apps/web/src/components/admin/floor-plan/floor-plan-setup-view.tsx) | [`pilot-flow.spec.ts`](../../apps/web/e2e/pilot-flow.spec.ts), [`floor-plan-mobile.spec.ts`](../../apps/web/e2e/floor-plan-mobile.spec.ts) | Dual write API/local |
| PIL-RF-11 | Layout visual del plano | Implementado parcialmente | Enmienda 2b · MEJ-12 | [`floor-plan-layout-view.tsx`](../../apps/web/src/components/admin/floor-plan/floor-plan-layout-view.tsx) | [`floor-plan-mobile.spec.ts`](../../apps/web/e2e/floor-plan-mobile.spec.ts) | Posiciones custom en `localStorage` |
| PIL-RF-12 | Calcular distribución (CP-SAT v1) | Implementado / ampliación adelantada | [ADR-023](../adr/ADR-023-motor-cpsat-dos-fases-mesa-y-asiento.md) | [`cp-sat-distribution.engine.ts`](../../apps/api/src/distribution/domain/cp-sat-distribution.engine.ts) | Specs dominio + [`smoke-cpsat-engine.cjs`](../../apps/api/scripts/smoke-cpsat-engine.cjs) | Default prod; smoke manual |
| PIL-RF-13 | Motor v0 (fallback / contrato E2E) | Implementado con persistencia backend | DECISION-002 motor v0 | [`motor-v0.strategy.ts`](../../apps/api/src/distribution/domain/motor-v0.strategy.ts) | [`distribution.e2e-spec.ts`](../../apps/api/test/distribution.e2e-spec.ts), [`setup-e2e.ts`](../../apps/api/test/setup-e2e.ts) | E2E fuerzan v0 |
| PIL-RF-14 | Cálculo asíncrono y estado | Implementado con persistencia backend | HU-04 (simplificado) | [`run-distribution-async.service.ts`](../../apps/api/src/distribution/application/run-distribution-async.service.ts) | [`distribution.e2e-spec.ts`](../../apps/api/test/distribution.e2e-spec.ts) | In-process; timeout ~4 min |
| PIL-RF-15 | Ajuste manual: desasignar / asignar / mover | Implementado con persistencia backend | HU-05 · [2b](../sdd/SDD-PILOTO-enmienda-HU05-fase2b-overrides-y-plano-asientos.md) | [`distribution.controller.ts`](../../apps/api/src/distribution/distribution.controller.ts) | [`distribution.e2e-spec.ts`](../../apps/api/test/distribution.e2e-spec.ts) | Solo en `draft` |
| PIL-RF-16 | Drag invitado en UI | Implementado con persistencia backend | HU-05 · MEJ-08 | [`guest-pointer-drag-layer.tsx`](../../apps/web/src/components/admin/distribution/guest-pointer-drag-layer.tsx) | [`evidencias-mej-08-fase1-validacion.md`](../agile/evidencias-mej-08-fase1-validacion.md) | Evidencia manual + API |
| PIL-RF-17 | Asignación por silla (`seatIndex`) | Implementado con persistencia backend | HU-01 · [2c](../sdd/SDD-PILOTO-enmienda-HU05-fase2c-sillas-distribucion-estrella.md) | [`update-guest-seat-in-distribution.use-case.ts`](../../apps/api/src/distribution/application/update-guest-seat-in-distribution.use-case.ts) | [`update-guest-seat-in-proposal.spec.ts`](../../apps/api/src/distribution/domain/update-guest-seat-in-proposal.spec.ts) | **API canónica; estado local auxiliar coexistente** |
| PIL-RF-18 | UX sillas S1…Sn y estrella presidencial | Implementado parcialmente | [2c](../sdd/SDD-PILOTO-enmienda-HU05-fase2c-sillas-distribucion-estrella.md) | [`distribution-table-seat-visual.tsx`](../../apps/web/src/components/admin/distribution/distribution-table-seat-visual.tsx) | Implementada sin prueba automatizada E2E localizada | Estrella en `localStorage` |
| PIL-RF-19 | Confirmar distribución | Implementado con persistencia backend | HU-06 (simplificado) · Flujo D | [`distribution.controller.ts`](../../apps/api/src/distribution/distribution.controller.ts) (`confirm`) | [`pilot-flow.e2e-spec.ts`](../../apps/api/test/pilot-flow.e2e-spec.ts), [`pilot-flow.spec.ts`](../../apps/web/e2e/pilot-flow.spec.ts) | — |
| PIL-RF-20 | Informe PDF al confirmar | Implementado parcialmente | HU-08 (parcial) | [`distribution-report-pdf.ts`](../../apps/web/src/lib/distribution-report-pdf.ts) | Implementada sin prueba automatizada localizada | **Generado en frontend; no persistido como documento backend**. Sin documento cocina |
| PIL-RF-21 | Flujo piloto E2E de punta a punta | Implementado | [guion-validacion-piloto-ui.md](../agile/guion-validacion-piloto-ui.md) | `apps/web` + `apps/api` | [`pilot-flow.spec.ts`](../../apps/web/e2e/pilot-flow.spec.ts), [`pilot-flow.e2e-spec.ts`](../../apps/api/test/pilot-flow.e2e-spec.ts) | Validación simulada documentada en agile |

---

## Requisitos pospuestos (trazados, no evaluables como completos)

| ID piloto | Capacidad | Estado | Especificación | Implementación | Pruebas | Observaciones |
|-----------|-----------|--------|----------------|----------------|---------|---------------|
| PIL-RF-30 | Top-K comparador (HU-09) | Pospuesto | SDD-01 · [ADR-007](../adr/ADR-007-top-k-soluciones-candidatas.md) | — | — | DECISION-002 OUT |
| PIL-RF-31 | RSVP e invitaciones (HU-10–11) | Pospuesto | [ADR-008](../adr/ADR-008-alcance-invitaciones-rsvp-y-principios-ux.md) | Mock UI lista invitados | — | `PILOT_INVITATION_DESIGN_ENABLED = false` |
| PIL-RF-32 | Publicación a invitados (HU-07) | Pospuesto | SDD-01 | — | — | — |
| PIL-RF-33 | Documento cocina (HU-08) | No implementado | SDD-01 | — | — | Distinto del PDF organizador |
| PIL-RF-34 | Portal invitado (HU-02) | No implementado | SDD-01 | — | — | — |
| PIL-RF-35 | Modo colaborativo UI | Pospuesto | SDD-01 HU-16 | API sí; UI no | — | `pilot-features.ts` |

---

## Capacidades backend sin UI piloto

| ID piloto | Capacidad | Estado | Especificación | Implementación | Pruebas | Observaciones |
|-----------|-----------|--------|----------------|----------------|---------|---------------|
| PIL-RF-40 | Subida plano imagen/PDF + detección | Implementado backend / no expuesto en UI | [SDD-01D](../sdd/SDD-01D-importacion-plano-salon.md) · [ADR-010](../adr/ADR-010-importacion-plano-imagen-pdf.md) | [`floor-plans.controller.ts`](../../apps/api/src/floor-plans/floor-plans.controller.ts) | [`floor-plans.e2e-spec.ts`](../../apps/api/test/floor-plans.e2e-spec.ts) | No verificable E2E desde piloto UI |
| PIL-RF-41 | Auditoría gobernanza | Implementado backend / no expuesto en UI | EP-13 · [ADR-012](../adr/ADR-012-modo-control-preferencias-y-regla-acompanantes.md) | [`event-governance-audit.controller.ts`](../../apps/api/src/event-governance-audit/event-governance-audit.controller.ts) | [`event-governance-audit.e2e-spec.ts`](../../apps/api/test/event-governance-audit.e2e-spec.ts) | Uso técnico/interno |
| PIL-RF-42 | Separar/revertir grupo acompañante | Implementado backend / no expuesto en UI | ADR-012 | [`guest-companions.controller.ts`](../../apps/api/src/guest-companions/guest-companions.controller.ts) | [`guest-companions.e2e-spec.ts`](../../apps/api/test/guest-companions.e2e-spec.ts) | Parcial en flujo evaluable |
| PIL-RF-43 | Sugerencias restricciones post-import | Implementado backend / no expuesto en UI | SDD-01 HU-15 | [`guest-import.controller.ts`](../../apps/api/src/guest-import/guest-import.controller.ts) | [`guest-import.e2e-spec.ts`](../../apps/api/test/guest-import.e2e-spec.ts) | Fuera flujo E2E UI |

---

## Resumen de cobertura

| Métrica | Cantidad |
|---------|----------|
| Requisitos consolidados (`PIL-RF-01`–`43`) | 33 |
| Implementados o parciales en flujo evaluable (`01`–`21`) | 21 |
| De ellos con prueba E2E UI o API del flujo | 15 |
| Sin prueba automatizada localizada | 3 (`18`, `20`, parcial `12` smoke) |
| Pospuestos / no implementados (`30`–`35`) | 6 |
| Backend sin UI (`40`–`43`) | 4 |

---

## Mapeo rápido SDD → piloto

| SDD (SDD-01) | IDs piloto |
|--------------|------------|
| HU-01 Mesas / asientos | PIL-RF-08, 09, 17, 18 |
| HU-04 Calcular | PIL-RF-12, 13, 14 |
| HU-05 Ajuste manual | PIL-RF-15, 16 |
| HU-06 Aprobar | PIL-RF-19 |
| HU-07 Publicación | PIL-RF-32 (pospuesto) |
| HU-08 Documentos | PIL-RF-20 (parcial), PIL-RF-33 (cocina pendiente) |
| HU-09 Top-K | PIL-RF-30 (pospuesto) |
| HU-10–11 RSVP | PIL-RF-31 (pospuesto) |
| HU-12 Plano | PIL-RF-10, 11, PIL-RF-40 (API sin UI) |
| HU-13–14 Excel | PIL-RF-03, 04 |
| HU-16 Preferencias | PIL-RF-06, 07 |
