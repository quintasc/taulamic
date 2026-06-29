# Guion — Validación previa propuesta MEJ-11 (Dashboard)

- **Estado:** Pendiente validación PO
- **Tipo:** Aprobación de **propuesta** — no requiere implementación
- **Spec:** `MEJ-11-dashboard-navegacion-y-atajos.md`
- **Implementación:** **bloqueada** hasta marcar este guion como aprobado

---

## Preparación

- [ ] Leer `MEJ-11-dashboard-navegacion-y-atajos.md`
- [ ] Abrir Dashboard en evento recién creado (config vacía) y en evento con setup avanzado

---

## A — Principio «proyecto = Config» (obligatorio)

| # | Pregunta | Respuesta esperada | OK PO |
|---|----------|-------------------|-------|
| A1 | ¿El primer paso natural desde el dashboard es **Configuración** (definir evento / proyecto)? | Sí | [ ] |
| A2 | ¿Los atajos a invitados/plano/distribución deben ser **secundarios** respecto a Config? | Sí | [ ] |
| A3 | ¿Este criterio debe mantenerse cuando exista persistencia multi-evento? | Sí | [ ] |

---

## B — CTA principal (Fase B)

| # | Comportamiento propuesto | ¿Aprobar? | OK PO |
|---|--------------------------|-----------|-------|
| B1 | Evento sin config completa → CTA «Definir evento» → `/config` | | [ ] |
| B2 | Config OK → CTA «Continuar: {siguiente paso}» según checklist | | [ ] |
| B3 | Ubicación: bajo KPIs, encima de checklist/atajos | | [ ] |

**Copy preferido PO:** _[opcional]_

---

## C — Checklist clicable (Fase C)

| # | Propuesta | OK PO |
|---|-----------|-------|
| C1 | Cada fila del setup (no bloqueada) enlaza a su pantalla | [ ] |
| C2 | Tarjetas (bloqueada) sin enlace | [ ] |

---

## D — Accesos rápidos (Fase D)

| # | Decisión | Elección PO |
|---|----------|-------------|
| D1 | ¿Incluir tarjeta **Configuración**? | [ ] Siempre · [ ] Solo si config incompleta · [ ] No |
| D2 | ¿Mostrar accesos rápidos en desktop (≥1024 px)? | [ ] Ocultar · [ ] Mostrar reducido · [ ] Mantener grid actual |
| D3 | ¿Mostrar en móvil/tablet (&lt;1024 px)? | [ ] Sí · [ ] No |
| D4 | ¿Ordenar según flujo setup (Config primero)? | [ ] Sí · [ ] No |

---

## E — Alcance sprint

| # | Fases aprobadas para primer entregable | OK PO |
|---|----------------------------------------|-------|
| E1 | [ ] A · [ ] B · [ ] C · [ ] D | |
| E2 | ¿Combinar con MEJ-10 en mismo sprint UX? | [ ] Sí · [ ] No · [ ] MEJ-11 después |

---

## Resultado

| Resultado | Acción |
|-----------|--------|
| **Aprobado** | Actualizar MEJ-11 estado; planificar implementación |
| **Aprobado parcial** | Anotar en spec §5 fases rechazadas |
| **Rechazado / diferido** | Mantener spec; dashboard sin cambios |

**Validador:** _______________  
**Fecha:** _______________  
**Comentarios:** _[opcional]_
