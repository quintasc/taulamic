# Sprint 05 — Post-piloto (Excel + distribución manual)

> **Inicio:** 2026-06-28  
> **Contexto:** Sprint 04 cerrado (`sprint-04-cierre.md`).  
> **SDD manda** — feedback PO en `evidencias-piloto/sesion-2026-06-24.md`.  
> **Referencia `main`:** `6bfbe1a` (MEJ-08 Fase 1 validada manualmente).

## 1) Objetivo

Entregar MEJ-02 (Excel ampliado) y MEJ-08 Fase 1 (ajuste manual HU-05: desasignar/asignar invitados).

## 2) Alcance

| Prioridad | Issue | MEJ | Descripcion | Estado |
|-----------|-------|-----|-------------|--------|
| P2 | [#45](https://github.com/quintasc/taulamic/issues/45) | MEJ-02 | Columnas menú/movilidad; notas internas; import → alertas UI | ✅ Cerrado — `evidencias-mej-02-cierre.md` |
| P2 | [#51](https://github.com/quintasc/taulamic/issues/51) | MEJ-08 | Fase 1 validada · cierre issue pendiente | ⏭️ En curso |
| Pospuesto | [#53](https://github.com/quintasc/taulamic/issues/53) | — | Organizador real julio 2026 | ⏭️ |

## 3) Fuera de alcance Sprint 05

- Pantalla UI sugerencias IA (API lista; matriz afinidades post-piloto)
- Drag invitado entre mesas (PP-HU05-03 Fase 2)
- Auditoría cambios manuales (PP-HU05-06)
- PostgreSQL / auth

## 4) MEJ-02 — criterios de aceptación (cerrado)

1. Plantilla descargable incluye `menu_especial`, `movilidad_reducida`, `notas_internas`.
2. Solo se acepta plantilla v1 (sin columna legacy `observaciones`).
3. Tras import, iconos 🌾 / ♿ visibles en panel Invitados v2.
4. `notas_internas` se muestra en drawer; la IA genera sugerencias desde ese texto (sin autoaplicar).

Evidencia: `docs/agile/evidencias-mej-02-cierre.md` · commits `ae1a1fb`, `a106257`.

## 5) MEJ-08 Fase 1 — criterios (referencia)

Ver `SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md`: PP-HU05-01, 02, 04, 05, 07.

| ID | Estado | Evidencia |
|----|--------|-----------|
| PP-HU05-01 ✕ desasignar | ✅ Validado | `evidencias-mej-08-pp-hu05-01.md` · `b79789d` |
| PP-HU05-02 + asignar | ✅ Validado | `evidencias-mej-08-fase1-validacion.md` · `5ab009b` |
| PP-HU05-04 KPIs | ✅ Validado (parcial live dashboard) | `evidencias-mej-08-fase1-validacion.md` |
| PP-HU05-05 reglas duras | ✅ Validado en assign API | `5ab009b` |
| PP-HU05-07 lista sin asignar | ✅ Validado | `evidencias-mej-08-fase1-validacion.md` |

Guion manual: `docs/agile/guion-validacion-mej-08-ui.md`.

## 6) Criterio de cierre

- #45 y #51 cerradas con evidencia en commit.
- `npm run build` + tests piloto en verde.
- `sprint-05-cierre.md` + CONTEXTO actualizado.

## 7) Referencias

- `sprint-04-cierre.md`
- `docs/product/especificacion-plantilla-excel-v1.md`
- `docs/ux/spec-invitados-panel-v2-post-piloto.md`
- `SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md`
