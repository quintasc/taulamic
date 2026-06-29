# Guion de validacion manual — MEJ-08 distribucion manual (HU-05)

- **Estado:** Vigente (Sprint 06 — Fase 2 cerrada 2026-06-21)
- **Fecha:** 2026-06-29 (Fase 1) · actualizado 2026-06-21 (Fase 2)
- **Issue:** [#51](https://github.com/quintasc/taulamic/issues/51)
- **SDD:** `docs/sdd/SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md`
- **Entorno:** API `:3000`, Web `:3001` (`npm run dev` desde raiz)
- **Precondicion:** evento con invitados, mesas y **distribucion calculada** en estado `draft` (sin confirmar)

> El guion piloto julio (`guion-validacion-piloto-ui.md`) deja ✕/+ **fuera de alcance**. Este guion valida las mejoras **post-piloto** MEJ-08.

---

## Preparacion

- [ ] API y web en marcha sin errores en consola
- [ ] Commit con la funcionalidad bajo prueba (referencia: `b79789d` en adelante para PP-HU05-01)
- [ ] Evento de prueba con ≥ 2 invitados y ≥ 1 mesa; motor v0 ejecutado

---

## PP-HU05-01 — Desasignar (✕ en pill)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 1 | Pills en lista | `/distribution` → expandir mesa | Cada invitado asignado muestra pill con **✕** a la derecha | [ ] |
| 2 | Desasignar en lista | Pulsar ✕ en un invitado | Invitado desaparece de la mesa; KPI `sin asignar` sube; mesa recalcula estado (En uso / Vacia) | [ ] |
| 3 | Pills en plano | `/floor-plan/layout` → clic en mesa | Panel inferior con pills y **✕** en cada invitado | [ ] |
| 4 | Desasignar en plano | Pulsar ✕ en panel del plano | Mismo efecto que en Distribucion; panel y contador mesa actualizados | [ ] |
| 5 | Solo borrador | Con propuesta `draft` | ✕ visible y operativo | [ ] |
| 6 | Tras confirmar | `/distribution` → Confirmar → volver a expandir mesa | **Sin** ✕ en pills (solo lectura) | [ ] |
| 7 | Error API | (opcional) API caida al pulsar ✕ | `Alert` con mensaje; lista no queda inconsistente | [ ] |

**Criterios SDD:** RF-HU05-01.1–01.4.

---

## PP-HU05-02 — Asignar (+ en mesa)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 8 | Control + | Mesa con plazas libres | Boton **+** o «Anadir invitado» visible | [x] |
| 9 | Selector | Pulsar + | Lista/buscador de invitados en `unassignedGuestIds` | [x] |
| 10 | Asignar | Elegir invitado sin asignar | Nuevo pill en mesa; invitado sale de sin asignar | [x] |
| 11 | Mesa llena | Mesa al maximo de capacidad | + deshabilitado o rechazo con mensaje claro | [x] |

**Estado implementacion:** validado 2026-06-29 (`5ab009b`).

---

## PP-HU05-04 — Coherencia KPIs

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 12 | Dashboard | Tras desasignar/asignar | Hint invitados «X de Y asignados · Z sin asignar» coherente | [x] |
| 13 | Distribucion | Tras cambio manual | `stats.unassignedCount`, chips mesa, barras capacidad actualizados sin recargar | [x] |
| 14 | Plano | Panel mesa abierto | Contador `n/cap` y pills sincronizados tras mutacion | [x] |

**Estado implementacion:** validado 2026-06-29 (coherencia en distribucion/plano; dashboard al reentrar).

---

## PP-HU05-05 — Reglas duras

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 15 | Capacidad | Asignar sobre mesa llena | Bloqueo con mensaje (409 / Alert) | [x] |
| 16 | Acompanantes | (si aplica) Separar pareja manualmente | Advertencia o bloqueo segun SDD §7.1 | [x] |

**Estado implementacion:** validado en API assign (`5ab009b`). Fase 2b: override con warning — ver pasos 22–24.

---

## PP-HU05-03 — Drag invitado (Fase 2)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 19 | Drag lista | `/distribution` → expandir mesa → arrastrar pill | Invitado en mesa destino; KPIs actualizados | [x] |
| 20 | Drag plano | `/floor-plan/layout` → panel mesa → arrastrar a otra mesa canvas | Mismo efecto; panel lateral no tapa centro | [x] |
| 21 | Mesa llena | Soltar en mesa sin plazas | Sin drop / sin cambio | [x] |

**Estado implementación:** validado 2026-06-21 (PO). Fix DnD `dragover` + feedback junto a pills.

---

## RF-HU05-05.5 — Override acompañantes (Fase 2b)

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 22 | Separar pareja | Drag un miembro de pareja (sin `separar_acompanante`) | Cambio **persiste**; banner **warning**; plano sigue visible | [x] |
| 23 | Excel excepción | Grupo con `separar_acompanante` | Sin warning al separar | [x] |
| 24 | Incompatibilidad | (si aplica) drag a mesa incompatible | Sigue **bloqueando** (error rojo) | [x] |

**Estado implementación:** validado 2026-06-21 (PO). Warning inline en fila expandida / panel plano (ADR-022).

SDD: `SDD-PILOTO-enmienda-HU05-fase2b-overrides-y-plano-asientos.md` · ADR-022.

---

## PP-HU05-07 — Lista sin asignar

| # | Paso | Ruta / accion | Resultado esperado | OK |
|---|------|---------------|-------------------|-----|
| 17 | Clic KPI | Dashboard o Distribucion → KPI sin asignar | Lista o drawer con invitados no asignados | [x] |
| 18 | Enlace distribucion | Desde lista en Dashboard | «Asignar en distribucion» navega a Distribucion | [x] |

**Estado implementacion:** validado 2026-06-29.

---

## Fuera de alcance Sprint 05 / Fase 2 actual

| ID | Comportamiento | Estado |
|----|----------------|--------|
| PP-HU05-03 | Drag invitado entre mesas | ✅ Sprint 06 |
| PP-HU05-06 | Auditoría cambios manuales | ✅ Sprint 06 |
| PP-HU05-05.5 | Override acompañantes (warning) | ✅ Fase 2b — ver enmienda fase2b |
| RF-HU05-03.6 | Asientos S1…Sn en plano | ⏭️ Fase C backlog |

---

## Validacion automatizada (complemento)

```powershell
cd apps\api
npm test -- --testPathPatterns=unassign-guest-from-proposal
npm run test:e2e -- --testPathPatterns=distribution.e2e-spec
```

---

## Evidencias

- Fase 1: `docs/agile/evidencias-mej-08-fase1-validacion.md`
- Fase 2: `docs/agile/evidencias-mej-08-fase2-validacion.md`

---

## Referencias

- `docs/agile/sprint-06-plan.md`
- `docs/agile/sprint-06-cierre.md`
- `docs/agile/guion-validacion-piloto-ui.md` (piloto julio — sin ✕/+)
- `docs/sdd/SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md`
