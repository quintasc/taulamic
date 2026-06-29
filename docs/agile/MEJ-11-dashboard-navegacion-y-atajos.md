# MEJ-11 — Dashboard: navegación guiada y accesos rápidos

- **Estado:** Propuesta — **pendiente validación PO** (sin implementar)
- **Tipo:** Mejora UX (sin cambio de alcance funcional SDD piloto)
- **Origen:** Revisión PO post Sprint 06 — rol del dashboard como entrada al «proyecto evento»
- **Guion validación previa:** `guion-validacion-mej-11-propuesta-ui.md`
- **Referencias:** `guia-estilo-taulamic.md` §9 Dashboard, `setup-flow.ts`, ADR-018

---

## 1) Principio rector

El **Dashboard** es la carta de navegación del **proyecto evento**. El primer paso natural desde el dashboard es **Configuración** (`/config`): ahí se define el evento que, con persistencia futura, será la unidad guardada y recuperable.

Los demás atajos (invitados, plano, mesas, distribución) son **secundarios** y dependen del progreso del setup — no un menú paralelo a la sidebar.

**Hoy en código:** accesos rápidos fijos (4 tarjetas) **sin Config**; checklist de setup **solo lectura**. Esto contradice el principio anterior.

---

## 2) Objetivo

Alinear el dashboard con el flujo ADR-018:

1. **CTA principal contextual** → Config si el proyecto no está definido; si no, el **siguiente paso incompleto** del setup.
2. **Checklist clicable** → cada fila navega al paso correspondiente (salvo bloqueados).
3. **Accesos rápidos responsive** → útiles en móvil/tablet; en desktop opcional u oculto por redundancia con sidebar.
4. **Copy honesto** → Config = «proyecto»; piloto sin lista de eventos; post-persistencia el mismo patrón escala.

---

## 3) Fuera de alcance

| Exclusión | Motivo |
|-----------|--------|
| Lista de eventos / recuperación multi-proyecto | Post-piloto (#53, PostgreSQL, auth) |
| Cambiar orden canónico del setup | ADR-018 manda |
| Sustituir sidebar por bottom nav completo | Decisión aparte (ADR-019); MEJ-11 solo dashboard |
| KPIs con datos ficticios | Ya prohibido en guía |

---

## 4) Estado actual vs propuesto

| Elemento | Hoy | Propuesto |
|----------|-----|-----------|
| CTA principal | No existe | «Definir evento» / «Continuar configuración» → Config |
| Accesos rápidos | 4 fijos; sin Config; siempre visibles | Config primero; resto según progreso; `hidden lg:block` invertido → visible `< lg` |
| Checklist | Solo lectura | Enlaces a rutas de `setup-flow.ts` |
| Sidebar | Navegación completa | Sigue siendo canónica en desktop |

---

## 5) Alcance propuesto (fases)

### Fase A — Documentación (validar primero)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-11-A1 | §9 Dashboard ampliado en `guia-estilo-taulamic.md` | Config = proyecto; CTA contextual; criterio desktop vs móvil |
| MEJ-11-A2 | Referencia en `handoff-figma-a-frontend.md` § Dashboard v2 | Alineado con propuesta |

**Gate:** PO aprueba `guion-validacion-mej-11-propuesta-ui.md` antes de código.

### Fase B — CTA contextual (P1)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-11-B1 | Banner o botón prominente bajo KPIs | Si `!isEventConfigComplete` → «Definir evento» → `/config` |
| MEJ-11-B2 | Si config OK | «Continuar: {siguiente paso}» usando `getSetupNav` / primer paso incompleto del checklist |
| MEJ-11-B3 | Copy | Menciona proyecto/evento; sin prometer multi-evento en piloto |

### Fase C — Checklist clicable (P1)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-11-C1 | `SetupChecklist` con links | Cada fila no bloqueada → `href` de `setup-flow` |
| MEJ-11-C2 | Filas bloqueadas (Tarjetas) | Sin link; candado actual |
| MEJ-11-C3 | Estilo | Misma fila; hover/focus accesible; no parecer botón pesado |

### Fase D — Accesos rápidos responsive (P2)

| ID | Entrega | Criterio |
|----|---------|----------|
| MEJ-11-D1 | Incluir **Configuración** como primera tarjeta | Siempre o solo si config incompleta (decisión PO en guion) |
| MEJ-11-D2 | Orden según `FLOW_ORDER` en `setup-flow.ts` | Config → Invitados → Plano → Mesas → Afinidades → Distribución |
| MEJ-11-D3 | Visibilidad | `lg:hidden` (solo &lt; 1024 px) **o** PO elige mantener en desktop reducido a 2 atajos |
| MEJ-11-D4 | Opcional | Ocultar atajos de pasos aún bloqueados por prerequisitos |

---

## 6) Lógica del «siguiente paso» (propuesta técnica)

Reutilizar criterios existentes en `use-event-dashboard.ts` / `setupStatus`:

1. Config incompleta → Config
2. Sin invitados → Invitados
3. Plano no guardado → Plano Fase A
4. Sin mesas → Mesas
5. (Piloto) Afinidades siempre «definible» → opcional sugerir
6. Sin distribución → Distribución

No inventar nuevas reglas de negocio; derivar de `setupSteps` + flags ya usados en dashboard.

---

## 7) Criterios de aceptación globales

1. Desde dashboard recién creado, el CTA visible apunta a **Config** antes que a invitados o distribución.
2. Checklist permite ir a cualquier paso desbloqueado con un clic.
3. En viewport ≥ 1024 px, la sidebar sigue siendo la navegación principal (sin sensación de «dos menús» redundantes si PO elige ocultar atajos).
4. En viewport &lt; 1024 px, hay al menos un camino claro a Config y al siguiente paso sin depender solo de sidebar estrecha.
5. Sin regresión en KPIs en vivo (MEJ-08 PP-HU05-04).

---

## 8) Relación con otros MEJ

| MEJ | Relación |
|-----|----------|
| MEJ-10 | Pulido visual independiente; puede mismo sprint UX |
| #53 Organizador real | Persistencia multi-evento; MEJ-11 prepara narrativa «proyecto» |
| ADR-019 | Accesos rápidos móvil hasta bottom nav dedicado |

---

## 9) Estimación sugerida

| Fase | Esfuerzo | Prioridad |
|------|----------|-----------|
| A Documentación | S | P0 |
| B CTA contextual | S | P1 |
| C Checklist links | S | P1 |
| D Accesos responsive | S | P2 |

---

## 10) Historial

| Fecha | Evento |
|-------|--------|
| 2026-06-21 | Propuesta documentada (feedback PO dashboard + Config como proyecto) |
