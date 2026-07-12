# Evolución del alcance del piloto

Resume cómo cambió el piloto respecto al planteamiento inicial. **No modifica** los documentos históricos; los interpreta en contexto.

## Línea temporal

```text
SDD-01 (MVP completo)
  → DECISION-002 (recorte piloto jun 2026: motor v0, sin HU-05/Top-K/RSVP/PDF)
    → Enmiendas HU-05 (2b overrides, 2c sillas UI)
      → Motor CP-SAT + async (ADR-023, jul 2026)
        → PDF organizador + refinamientos UX (jul 2026)
          → Piloto evaluable actual (docs/pilot/)
```

---

## Cambios relevantes

| Funcionalidad | MVP inicial (SDD-01) | Piloto reducido (DECISION-002, jun 2026) | Estado actual (jul 2026) | Motivo o evidencia | Documento relacionado |
|---------------|----------------------|------------------------------------------|--------------------------|--------------------|-----------------------|
| Ajuste manual HU-05 | UI visual, auditoría, alertas | Solo lectura en piloto | Asignar, desasignar, mover, drag | Secuencia MEJ-08 + enmiendas 2b; implementación indica adelanto respecto al corte | [postpiloto](../sdd/SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md), [2b](../sdd/SDD-PILOTO-enmienda-HU05-fase2b-overrides-y-plano-asientos.md) |
| Override acompañantes en manual | Regla dura en motor | No en piloto | Warning + persistencia en manual | Aprobación PO en enmienda 2b | [ADR-022](../adr/ADR-022-override-manual-hu05-vs-reglas-duras.md) |
| Movimiento entre mesas | Drag-and-drop | Fuera del piloto | Implementado (drag + API move) | MEJ-08 (`3eb4740`) | [2b](../sdd/SDD-PILOTO-enmienda-HU05-fase2b-overrides-y-plano-asientos.md) |
| Distribución por sillas S1…Sn | Topología y asignación (HU-01) | No en piloto reducido | API canónica + UX visual; local auxiliar coexistente | Enmienda 2c + evolución API posterior a 2c | [2c](../sdd/SDD-PILOTO-enmienda-HU05-fase2c-sillas-distribucion-estrella.md) |
| Representación circular de mesa | Disposición visual asientos | Parcial en piloto | Miniatura radial en distribución (desktop) | Implementación UI jul 2026 | [2c](../sdd/SDD-PILOTO-enmienda-HU05-fase2c-sillas-distribucion-estrella.md) |
| Orientación presidencial (estrella) | No explícito en corte jun | No en piloto | `localStorage` en UI | Sesión PO 2026-07-06/07 | [2c](../sdd/SDD-PILOTO-enmienda-HU05-fase2c-sillas-distribucion-estrella.md) |
| Motor de distribución | Async, Top-K, reglas completas | Motor v0 síncrono, 1 propuesta | CP-SAT v1 async (adelantado) + v0 fallback | ADR-023; `d08d11a` | [ADR-023](../adr/ADR-023-motor-cpsat-dos-fases-mesa-y-asiento.md), [DECISION-002](../agile/DECISION-002-mvp-julio-piloto-funcional.md) |
| Cálculo asíncrono | Worker + cola | Pospuesto (BullMQ) | Async in-process con tracker | Implementación indica alternativa pragmática al worker pospuesto | [`run-distribution-async.service.ts`](../../apps/api/src/distribution/application/run-distribution-async.service.ts) |
| Confirmación | Versionado rico (HU-06) | Confirmar simplificado | Confirmar + bloqueo | Cumple corte piloto; sin versionado rico | [`SDD-01`](../sdd/SDD-01-borrador-mvp.md) HU-06 |
| Exportación PDF | HU-08 cocina + salón | Fuera del piloto | PDF organizador en frontend (parcial HU-08) | Ampliación de finalidad documentada por PO; no documento cocina | [`distribution-report-pdf.ts`](../../apps/web/src/lib/distribution-report-pdf.ts) |
| Relaciones / afinidades | Persistencia y gobernanza API | Modo básico | Operativas; config con persistencia incompleta | `localStorage` + envío en `run` | [`event-ui-meta.ts`](../../apps/web/src/lib/event-ui-meta.ts) |
| Plano salón | Imagen/PDF asistida + Fase A | Fase A manual (ADR-016) | Fase A API + layout visual local | Pivote ADR-016; API imagen sin UI | [ADR-016](../adr/ADR-016-plano-espacial-salon-dos-fases.md) |
| Top-K comparador | HU-09 | Fuera del piloto | Sigue fuera | Sin cambio; pospuesto explícito | [DECISION-002](../agile/DECISION-002-mvp-julio-piloto-funcional.md) |
| RSVP / invitaciones | HU-10, HU-11 | Fuera del piloto | Sigue fuera; mock UI en lista | `PILOT_INVITATION_DESIGN_ENABLED = false` | [`pilot-features.ts`](../../apps/web/src/lib/pilot-features.ts) |
| Publicación a invitados | HU-07 | Fuera del piloto | Sigue fuera | — | [SDD-01](../sdd/SDD-01-borrador-mvp.md) |
| Validaciones E2E | Contrato piloto | Motor v0 | E2E API siguen con v0; prod usa v1 | Política tests: validan contrato; no redefinen SDD | [`setup-e2e.ts`](../../apps/api/test/setup-e2e.ts) |

---

## Funcionalidades que siguen pendientes

| Funcionalidad | Estado | Referencia |
|---------------|--------|------------|
| Documento cocina (HU-08) | No implementado | SDD-01 HU-08 |
| Top-K (HU-09) | Pospuesto | DECISION-002, ADR-007 |
| RSVP e invitaciones (HU-10–11) | Pospuesto | DECISION-002, ADR-008 |
| Publicación programada (HU-07) | Pospuesto | SDD-01 |
| Portal invitado (HU-02) | No implementado | SDD-PILOTO-alineacion |
| Unificación persistencia sillas | Deuda técnica | CONTEXTO-EJECUCION pendiente Sprint 11 |
| Persistencia API de afinidades | Deuda técnica | — |
| UI subida plano imagen | Backend listo; UI no | floor-plans API |
| UI auditoría gobernanza | Backend listo; UI no | governance-audit API |

---

## Contradicciones documentales reconciliadas

| Documento | Dice | Realidad jul 2026 | Tratamiento |
|-----------|------|-------------------|-------------|
| `SDD-PILOTO-alineacion` (21-jun) | HU-05 ⬜, motor v0 | HU-05 parcial; CP-SAT | Snapshot histórico; ver [`ALCANCE-ACTUAL.md`](ALCANCE-ACTUAL.md) |
| Enmienda 2c (07-jul) | Sin cambio API para sillas | API con `seatIndex` y `PUT seat` | Evolución posterior documentada aquí |
| DECISION-002 OUT “documentos PDF” | Fuera del piloto | PDF organizador en cliente | Distinto de HU-08 cocina; parcial y frontend |
| `mvp-julio-plan` | Motor v0, cierre 24-jun | CP-SAT jul 2026 | Plan histórico de ejecución |

---

## Notas prudentes

- Donde el motivo de un adelanto no está explícito en un documento de decisión, se indica “La implementación indica…” o “La secuencia de enmiendas sugiere…”.
- No se han inventado motivos empresariales para los adelantos.
- El SDD completo no se rebaja: lo pospuesto sigue en roadmap; lo adelantado se traza en [`TRAZABILIDAD.md`](TRAZABILIDAD.md).
