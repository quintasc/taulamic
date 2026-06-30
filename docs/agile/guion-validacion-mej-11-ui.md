# Guion de validación manual — MEJ-11 Dashboard (post-implementación)

- **Estado:** Validado PO — 2026-06-21
- **Precondición:** Implementación MEJ-11 en `main` @ `6645bef`
- **Spec:** `MEJ-11-dashboard-navegacion-y-atajos.md`
- **Evidencias:** `evidencias-mej-11-validacion.md`

---

## B — CTA contextual

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 1 | Evento nuevo, sin nombre en config | CTA «Definir evento» (o copy PO) → `/config` | [x] |
| 2 | Config completa, sin invitados | CTA apunta a Invitados (o siguiente paso acordado) | [x] |
| 3 | Tras completar paso sugerido | CTA actualiza al siguiente incompleto | [x] |

---

## C — Checklist

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 4 | Clic en «Configuración del evento» | Navega a `/config` | [x] |
| 5 | Clic en «Invitados cargados» | Navega a invitados | [x] |
| 6 | Fila Tarjetas (bloqueada) | Sin enlace; candado visible | [x] |

---

## D — Accesos rápidos (si Fase D aprobada)

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 7 | Desktop ≥1024 px | Accesos eliminados (decisión PO Sprint 07) | [x] N/A |
| 8 | Viewport &lt;1024 px | Idem — sidebar + CTA + checklist | [x] N/A |

---

## Smoke

| # | Comprobación | OK |
|---|--------------|-----|
| 9 | KPIs siguen actualizándose tras mutación distribución | [x] |
| 10 | Sidebar sin cambios funcionales | [x] |

---

## Evidencias

`evidencias-mej-11-validacion.md`
