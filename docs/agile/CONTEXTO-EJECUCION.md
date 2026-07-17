# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: **2026-07-17**
- Sprint activo: **Post Sprint 10** (W5 cierre piloto)
- **`main` @ `3447809`** — ADR-024 L3bis + Fase 1a/1b + exclusión Pareja

## Frase clave

```text
Retomo Taulamic. Estado 2026-07-17: ADR-024 implementado en motor (L3≥2, L3bis, Fase 1a/1b, k_min con C+E, exclusión genérica Pareja/Parejas). Colores de categoría únicos en UI/PDF. Pendiente: validación PO visual; deuda sillas/afinidades API; Top-K.
```

## Entregado hoy 2026-07-17 (motor ADR-024 / sala)

### Fase 1a / 1b (ADR-023 §2bis) — **implementado**

| Subfase | Contenido |
|---------|-----------|
| **1a** | Capacidad rígida; L1–L3 duro; sin L3bis ni elasticidad |
| **1b** | L3bis + elasticidad ±2 + `k_min = ceil(N/(C+E))`; packing tolera hasta 2 vacías |

### L3 / L3bis / pureza / packing

| Pieza | Regla |
|-------|--------|
| L3 duro | Anti-huérfano ≥2 |
| L3bis | Islas ≤3 de categoría grande descolgada (blando, solo 1b) |
| L1 elástico | ±2 puede bajar mesas (p. ej. 10→1 mesa; 12→6+6) |
| Pureza | Mezclar dos categorías grandes (N≥6) solo si necesario (peso ×5) |
| Packing | Hasta **2** sillas vacías sin penalizar |
| Metadato Excel | **Pareja/Parejas** excluidas del agrupado L1–L3 (genérico; D3 via `acompanante_key`) |

### UI validación

| Área | Entrega |
|------|---------|
| Colores categoría | Lookup por índice ordenado (sin colisiones hash) — vista mesas + PDF |

### Validación

| Check | Resultado |
|-------|-----------|
| Smoke multi6 / elastic-kmin | OK |
| Repro evento real (11 mesas, sin Pareja en L1) | Trabajo 6+6; Familia novio 10 |
| Script | `validate-l3bis-pilot80.cjs`, `smoke-elastic-kmin.cjs`, `smoke-real-event-no-pareja.cjs` |

### E2E API (sesión previa, `9d6fdb0`)

E2E respetan `DISTRIBUTION_ENGINE` (default CP-SAT).

## Pendiente inmediato

1. **Validación PO visual** — sillas, estrella, móvil (`guion-validacion-piloto-ui.md`)
2. **Deuda técnica piloto** — unificar sillas API/local; persistencia API afinidades
3. **Top-K / comparador** — diferido (ADR-023 §3)

## Historial reciente

| Commit | Descripción |
|--------|-------------|
| *(este)* `3447809` | feat: ADR-024 L3bis, Fase 1a/1b, exclusión Pareja, colores categoría |
| `9d6fdb0` | test(api): e2e respetan DISTRIBUTION_ENGINE (CP-SAT por defecto) |
| `aec8ce1` | docs: actualiza roadmap MVP a 17 jul (W5) |
| `6f242a8` | refactor(web): hooks/modales distribución, badge PAX |

## Referencias

- `ADR-023` §2bis · `ADR-024` §1bis / k_min C+E
- `guion-validacion-piloto-ui.md`
- `docs/pilot/README.md`
- `github-project-sprint-10.md`
