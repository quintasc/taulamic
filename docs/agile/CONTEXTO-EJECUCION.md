# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: **2026-08-02**
- Sprint activo: **Post Sprint 10** (W5 cierre piloto)
- **`main` @ `5a080c3`** — refactor web: orquestación distribución en `useDistributionPage`

## Frase clave

```text
Retomo Taulamic. Estado 2026-08-02: ADR-024 en motor; distribución page adelgazada (useDistributionPage). Deuda motor: L2 categoría (p. ej. Trabajo 10+2) con 10 mesas justas en piloto80 — ver CONTEXTO. Pendiente: validación PO visual; sillas/afinidades API; Top-K.
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
2. **Deuda técnica piloto** — unificar sillas API/local; persistencia API afinidades — [#55](https://github.com/quintasc/taulamic/issues/55)
3. **Top-K / comparador** — diferido (ADR-023 §3) — #11 / #12
4. **Deuda motor ADR-024** — L2 degradado con mesas justas — [#54](https://github.com/quintasc/taulamic/issues/54) (ver sección siguiente)

## Deuda motor — L2 categoría con salón justo de mesas (2026-08-02)

**Síntoma (piloto 80, `docs/pilot/invitados-piloto-80.xlsx`):** con **Trabajo = 12** y mesas de capacidad 8, el organizador espera **6+6** (ADR-024 L1/L2). En UI se observó un reparto degradado tipo **9+3** (mesa por encima de 8 vía elasticidad + isla pequeña).

**Repro script (`CpSatDistributionEngine`, `groupByCategory` ± `keepFamiliesTogether`, budget ~90 s):**

| Mesas × 8 | Reparto Trabajo |
|-----------|-----------------|
| 15 o 11 | **6+6** (OK) |
| **10** (justo: 80/8) | **10+2** (L2 roto; misma clase de fallo) |

**Causa probable:** con inventario de mesas **sin holgura**, el solver prioriza asignación global + `keepTogether` y **relaja** el equilibrio L2 de categoría grande; la elasticidad ±2 permite concentrar de más en una mesa.

**No es:** bug de la page/UI ni preferencia ADR de mezclar Trabajo con Otros (mezcla grandes es cara; el ADR prioriza bolsillos propios 6+6).

**Mitigación temporal:** añadir 1–2 mesas de holgura y recalcular.

**Cuando se acometa:** endurecer L2 / selección de propuesta en salón justo; ampliar `validate-l3bis-pilot80.cjs` (hoy usa 15 mesas y no detecta el caso de 10). Relacionado: ADR-024, ADR-023 §2bis. Issue: [#54](https://github.com/quintasc/taulamic/issues/54).

## Deuda diferida (keepTogether / D3)

Hoy en Afinidades las parejas Excel (`acompananteKey` → `keepTogether`) se muestran como chip gris «juntos» **no editable ni borrable** (solo UX; la regla dura vive en API).

**Hacer juntos, cuando toque:**

1. **Alta** de keepTogether desde entrada manual (enlazar `companionGroup` → `acompananteKey` en API).
2. **Baja / eliminación** de esas reglas duras desde Afinidades (y/o ficha invitado), persistiendo el cambio en servidor — no solo quitando la fila del meta local.

Hasta entonces: no ofrecer borrado engañoso en UI.

## Deuda diferida (auth)

Cuando se implemente autenticación JWT/RBAC (post-piloto): preferir **JWT en cookie `HttpOnly`** (y `Secure` / `SameSite` adecuados) frente a guardar el token en `localStorage`, para reducir riesgo XSS. El contrato OpenAPI puede seguir documentando Bearer si hace falta para clientes no browser; el admin web usaría la cookie.

## Refactor oportunista UI (no proyecto aparte)

**Hecho:** Fase A — `distribution/page.tsx` orquesta vía `hooks/use-distribution-page.ts` (commit `5a080c3`).

**Pendiente — solo al tocar esa zona** (no abrir refactor masivo sin feature/bug):

| Si tocas… | Aprovecha para… |
|-----------|-----------------|
| Afinidades (`preferences-affinity-view.tsx`) | Extraer tipos/utils + hook de meta local (`event-ui-meta` / softRules); dejar la view como composición UI. **No** unificar aún persistencia API (deuda piloto aparte). |
| Lista de mesas en distribución (`distribution-table-list.tsx`) | Partir DnD, sillas y storage local (`taulamic:*`) en hooks/libs. |
| Layout del plano (`floor-plan-layout-view.tsx` / `floor-plan-setup.ts`) | Separar canvas/DnD vs persistencia local; constantes de layout con nombre. |
| Pesos/umbrales CP-SAT | Nombrar literales mágicos al editar el motor. |
| Shims `@deprecated` sin imports | Borrar en el mismo PR. |

Alineado con `AGENTS.md` (anti-spaghetti + sin sobreingeniería) y ADR-021.

## Historial reciente

| Commit | Descripción |
|--------|-------------|
| `5a080c3` | refactor(web): orquesta distribución en useDistributionPage |
| `fae0b36` | docs: directriz anti-código spaghetti en AGENTS |
| `3447809` | feat: ADR-024 L3bis, Fase 1a/1b, exclusión Pareja, colores categoría |
| `9d6fdb0` | test(api): e2e respetan DISTRIBUTION_ENGINE (CP-SAT por defecto) |

## Referencias

- `ADR-023` §2bis · `ADR-024` §1bis / k_min C+E
- `guion-validacion-piloto-ui.md`
- `docs/pilot/README.md`
- `github-project-sprint-10.md`
