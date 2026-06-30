# Guion de validación manual — MEJ-11 Dashboard (post-implementación)

- **Estado:** Listo para validación manual PO
- **Precondición:** Implementación MEJ-11 en `main` @ `6645bef`
- **Spec:** `MEJ-11-dashboard-navegacion-y-atajos.md`

---

## B — CTA contextual

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 1 | Evento nuevo, sin nombre en config | CTA «Definir evento» (o copy PO) → `/config` | [ ] |
| 2 | Config completa, sin invitados | CTA apunta a Invitados (o siguiente paso acordado) | [ ] |
| 3 | Tras completar paso sugerido | CTA actualiza al siguiente incompleto | [ ] |

---

## C — Checklist

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 4 | Clic en «Configuración del evento» | Navega a `/config` | [ ] |
| 5 | Clic en «Invitados cargados» | Navega a invitados | [ ] |
| 6 | Fila Tarjetas (bloqueada) | Sin enlace; candado visible | [ ] |

---

## D — Accesos rápidos (si Fase D aprobada)

| # | Paso | Resultado esperado | OK |
|---|------|-------------------|-----|
| 7 | Desktop ≥1024 px | Según decisión PO (oculto o reducido) | [ ] |
| 8 | Viewport &lt;1024 px | Accesos visibles; Config primera o destacada | [ ] |

---

## Smoke

| # | Comprobación | OK |
|---|--------------|-----|
| 9 | KPIs siguen actualizándose tras mutación distribución | [ ] |
| 10 | Sidebar sin cambios funcionales | [ ] |

---

## Evidencias

Documentar en `evidencias-mej-11-validacion.md` (crear al cerrar).
