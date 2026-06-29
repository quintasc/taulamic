# Sprint 05 — Post-piloto (Excel + distribución manual)

> **Inicio:** 2026-06-28  
> **Contexto:** Sprint 04 cerrado (`sprint-04-cierre.md` · `main` @ `7d147cf`).  
> **SDD manda** — feedback PO en `evidencias-piloto/sesion-2026-06-24.md`.

## 1) Objetivo

Entregar MEJ-02 (Excel ampliado) y MEJ-08 Fase 1 (ajuste manual HU-05: desasignar/asignar invitados).

## 2) Alcance

| Prioridad | Issue | MEJ | Descripcion | Estado |
|-----------|-------|-----|-------------|--------|
| P2 | [#45](https://github.com/quintasc/taulamic/issues/45) | MEJ-02 | Columnas menú/movilidad; notas internas; import → alertas UI | 🔄 |
| P2 | [#51](https://github.com/quintasc/taulamic/issues/51) | MEJ-08 | PP-HU05-01…04: ✕ pill, + mesa, KPIs, reglas duras | ⏭️ |
| Pospuesto | [#53](https://github.com/quintasc/taulamic/issues/53) | — | Organizador real julio 2026 | ⏭️ |

## 3) Fuera de alcance Sprint 05

- IA interpretación de observaciones (SDD-03; issue #45 menciona post-piloto)
- Drag invitado entre mesas (PP-HU05-03 Fase 2)
- Auditoría cambios manuales (PP-HU05-06)
- PostgreSQL / auth

## 4) MEJ-02 — criterios de aceptación

1. Plantilla descargable incluye `menu_especial`, `movilidad_reducida`, `notas_internas`.
2. Import acepta legacy con columna `observaciones` (mapeo a notas internas).
3. Tras import, iconos 🌾 / ♿ visibles en panel Invitados v2.
4. `observaciones` ya no se usa en plantilla nueva; sugerencias IA siguen solo para legacy si aplica.

## 5) MEJ-08 Fase 1 — criterios (referencia)

Ver `SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md`: PP-HU05-01, 02, 04, 05, 07.

## 6) Criterio de cierre

- #45 y #51 cerradas con evidencia en commit.
- `npm run build` + tests piloto en verde.
- `sprint-05-cierre.md` + CONTEXTO actualizado.

## 7) Referencias

- `sprint-04-cierre.md`
- `docs/product/especificacion-plantilla-excel-v1.md`
- `docs/ux/spec-invitados-panel-v2-post-piloto.md`
- `SDD-PILOTO-enmienda-HU05-ajuste-manual-postpiloto.md`
