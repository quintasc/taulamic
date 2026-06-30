# Sprint 10 — Pulido PO post-validación piloto (móvil / iPad)

> **Inicio:** 2026-06-30  
> **Contexto:** Feedback PO sesión `evidencias-piloto/sesion-2026-06-24.md` + iteración UI en Cursor (sin commit hasta 2026-06-30).  
> **SDD manda** — solo UX / estética / responsive; sin cambio de alcance funcional.

## 1) Objetivo

Cerrar observaciones de **validación manual piloto** en viewport móvil y tablet: navegación setup, plano, importación invitados, cabecera admin y cohesión visual.

---

## 2) Alcance

| Prioridad | ID | Descripción | Estado |
|-----------|-----|-------------|--------|
| **P1** | NAV-01 | Flecha «Anterior» visible en footer setup móvil (`btn-secondary-compact`) | ✅ |
| **P1** | NAV-02 | Logo Taulamic en cabecera móvil; sin duplicar en drawer abierto | ✅ |
| **P1** | NAV-03 | Nombre evento alineado a la derecha con margen simétrico a hamburguesa | ✅ |
| **P1** | GUEST-01 | Import Excel: jerarquía botones (seleccionar / importar / quitar fichero) | ✅ |
| **P1** | GUEST-02 | `GuestTemplateFileRow` — fila plantilla unificada | ✅ |
| **P1** | GUEST-03 | Drawer alta manual: z-index y ancho móvil | ✅ |
| **P1** | PLAN-01 | Plano móvil: escalado numérico con límites (`clampSetupToFitLimits`) | ✅ |
| **P1** | PLAN-02 | Steppers ± en dimensiones sala móvil | ✅ |
| **P1** | PLAN-03 | Accesorios móvil: chevrones ‹ › en cabecera (`MobileHorizontalScroll`) en lugar de depender solo del scroll | ✅ |
| **P2** | E2E-01 | `mej-13-ui-copy.spec.ts` — smoke copy + hamburguesa + distribución | ✅ |
| **P2** | DEV-01 | Indicador dev Next.js en `bottom-right` | ✅ |
| **P2** | — | Validación PO manual de los puntos anteriores | ⏳ |
| **P3** | REF-02–04 | Fases 2–4 `refactor-ui-mobile-admin.md` | ⏳ Backlog |
| **P3** | — | Ocultar campos medida plano tras «Ajustar medidas» | ⏸️ PO: de momento no |

---

## 3) Fuera de alcance

| Exclusión | Motivo |
|-----------|--------|
| Accesorios `(x,y)` room-setup | Gate SDD Sprint 09 P3 |
| Scroll en tarjeta del plano móvil | Rechazado PO — camino numérico |
| Cambios motor / API import | Sin aprobación SDD |

---

## 4) Criterios de cierre

- [x] Implementación P1 en rama local
- [ ] Commit + push `main`
- [ ] Validación PO móvil + iPad (Invitados, Plano, Distribución, cabecera)
- [ ] `CONTEXTO-EJECUCION.md` y evidencias actualizadas
- [ ] GitHub Project: ítems pulido PO → Done

---

## 5) Referencias

| Documento | Uso |
|-----------|-----|
| `evidencias-piloto/sesion-2026-06-24.md` | Origen feedback |
| `evidencias-piloto/sesion-2026-06-30-implementacion-po.md` | Entregas técnicas |
| `refactor-ui-mobile-admin.md` | Fase 1 ampliada |
| `guion-validacion-piloto-ui.md` | Repaso manual pendiente |

---

## 6) Historial

| Fecha | Evento |
|-------|--------|
| 2026-06-30 | Plan Sprint 10 + commit pulido PO |
