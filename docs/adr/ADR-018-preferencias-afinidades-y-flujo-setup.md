# ADR-018 — Preferencias como afinidades y nuevo flujo de setup

- **Estado:** Aceptado
- **Fecha:** 2026-06-21
- **Contexto:** Piloto julio 2026; feedback de organizador sobre orden lógico y utilidad de campos.

## Contexto

El piloto mezclaba en «Preferencias» solo el modo colaborativo/exclusivo (HU-16). El organizador necesita:

1. Configuración inicial sin datos ficticios (nombre, volumen de invitados).
2. Plano dimensionado según volumen esperado.
3. Gestión de invitados con altas de última hora y visibilidad RSVP (futuro).
4. Una pantalla de **restricciones de seating** (afinidades, incompatibilidades, reglas de grupo) separada del modo de captura.

## Decisión

### 1. Reordenar setup

**Enmienda jun 2026 (PO):** orden por fases cognitivas Quién → Dónde → Cómo.

```
Configuración → Invitados → Tarjetas (🔒 HU-10) → Plano → Mesas → Afinidades (Preferencias) → Distribución
```

Orden anterior (`Config → Plano → Invitados → …`) queda sustituido para nav y checklist. La nav sigue siendo no lineal.

**Fases:**

| Fase | Pasos |
|------|-------|
| Quién | Invitados, Tarjetas |
| Dónde | Plano, Mesas |
| Cómo | Afinidades, Distribución |

**Tarjetas:** etiqueta corta en nav para el paso de diseño y envío de invitaciones (HU-10). Bloqueado en piloto; no cuenta para % de setup.

### 2. Configuración del evento absorbe modo HU-16

El selector colaborativo / anfitrión exclusivo pasa a **Configuración**. Sigue persistiendo en `preference-control-mode` (API sin cambio de contrato).

### 3. «Preferencias» pasa a «Afinidades y reglas»

La pantalla `/preferences` evoluciona a centro de **restricciones para el motor**:

- Por persona: afinidades (+) e incompatibilidades (−).
- Reglas genéricas: agrupar por categoría, familias unidas, mesa solteros, etc.

En piloto: **UI de borrador** (localStorage); motor v0 no las consume.

### 4. Invitados aproximados en lugar de Nº de mesas (config)

Meta UI `approximateGuestCount` orienta plano y checklist; no sustituye capacidad real de mesas.

### 5. RSVP e invitaciones

Iconografía y menús visibles en piloto; persistencia y envío real quedan para HU-10/HU-11.

### 6. Nav no lineal; evolución Mesas ↔ Afinidades

- La navegación lateral sigue el orden recomendado pero **no impide** saltos entre pasos.
- **Piloto / MVP temprano:** Mesas antes de Afinidades (capacidad operativa antes que reglas mock).
- **Post-MVP:** si las reglas de afinidad preconfiguran mesas, valorar **Afinidades → Mesas** (ver SDD enmienda §7.3).

### 7. Responsive y móvil invitado

Ver **ADR-019**. El modo colaborativo exige **mobile-first** en superficie invitado; el admin puede ser desktop-first con degradación. Los componentes RSVP/afinidad del piloto deben ser reutilizables y táctiles.

## Consecuencias

- **Positivas:** Flujo más intuitivo; separación clara modo de captura vs restricciones de optimización.
- **Negativas:** Dos fuentes de verdad temporales en piloto (meta local RSVP/afinidades vs API).
- **Migración post-piloto:** Persistir `approximateGuestCount`, RSVP y reglas en API; conectar motor.

## Referencias

- `docs/sdd/SDD-PILOTO-enmienda-flujo-setup-jun2026.md`
- `SDD-01-borrador-mvp.md` HU-16, HU-10–11
