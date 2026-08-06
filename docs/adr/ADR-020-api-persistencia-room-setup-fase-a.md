# ADR-020 — API persistencia room setup (plano Fase A)

- **Estado:** Aceptado — **implementado parcialmente en piloto** (API + dual write / cache local; ver ALCANCE)
- **Fecha:** 2026-06-21 (estado implementación revisado 2026-08-06)
- **Relacionado:** `ADR-016`, `SDD-01D`, `docs/pilot/ALCANCE-ACTUAL.md`
- **Sustituye en piloto:** solo `localStorage` web como fuente única (`taulamic:floorPlanSetup`)

## Contexto

Fase A del plano (forma, medidas, accesorios) **persiste en API** en el piloto, con cache/meta local coexistente (dual write). El texto original de este ADR describia el problema cuando solo existia localStorage.

## Decisión

Exponer recurso REST **por evento**, independiente del flujo legacy `floor-plans` (detección mesas).

### Contrato

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/events/{eventId}/room-setup` | Lee configuración Fase A |
| `PUT` | `/api/v1/events/{eventId}/room-setup` | Crea o reemplaza configuración Fase A |

### Cuerpo (PUT) / respuesta (GET)

```json
{
  "shape": "rectangular",
  "widthM": 25,
  "lengthM": 15,
  "radiusM": 12,
  "placedAccessories": ["mesa-novios", "pista-baile"],
  "updatedAt": "2026-06-21T12:00:00.000Z"
}
```

| Campo | Tipo | Notas |
|-------|------|-------|
| `shape` | `rectangular` \| `round` \| `oval` | Igual que web `FloorPlanSetup` |
| `widthM` | number | Rectangular / oval |
| `lengthM` | number | Rectangular / oval |
| `radiusM` | number | Redonda |
| `placedAccessories` | string[] | IDs catálogo (`mesa-novios`, …) |
| `updatedAt` | ISO string | Solo respuesta |

### Validación

- Dimensiones entre 3 y 200 m (alineado con web).
- `404` si evento no existe.
- `409` si evento `plan_approved` (mismo criterio que mesas).

### Persistencia

- Archivo: `uploads/events/{eventId}/room-setup.json` (patrón `FileEventConfigRepository`).
- Módulo: `events` o submódulo `room-setup` en `apps/api`.

### Web (tras implementación)

1. `PUT` al guardar plano Fase A.
2. `GET` al cargar `/floor-plan` y `/floor-plan/layout`.
3. Mantener `localStorage` como **cache offline** opcional hasta post-piloto.

## Fuera de alcance (este ADR)

- Fondo JPG/PNG/PDF (upload separado).
- Posiciones `(x,y,rotation)` de mesas Fase B.
- Posiciones de accesorios en canvas (post-piloto).

## Criterios de aceptación

1. Tras `PUT`, `GET` devuelve mismos valores.
2. E2E piloto puede opcionalmente assert room-setup tras crear evento.
3. Web muestra plano guardado tras recargar sin depender solo de localStorage.
