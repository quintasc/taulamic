# Contexto de ejecucion — punto de reanudacion

- Ultima actualizacion: **2026-08-03**
- Sprint activo: **Post Sprint 10** (piloto evaluable cerrado técnicamente; W5)
- **`main` @ `24c4e1f`** — BF-10/#57 acoplamiento Nest; CONTEXTO y Project al 2026-08-03.

## Frase clave

```text
Retomo Taulamic. Estado 2026-08-03: piloto evaluable OK; ADR-024 en motor; distribución page con useDistributionPage. Siguiente: validación PO visual (guion). Luego #55 sillas/afinidades API; Top-K #11/#12; deuda L2 mesas justas #54. Diferido: BF-09/#56 multi-usuario, BF-10/#57 acoplamiento Nest.
```

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

## Deuda diferida (escalabilidad multi-usuario)

Si el producto crece a **varios organizadores concurrentes**, el runtime del piloto (JSON + jobs in-process) no basta. Analizar concurrencia, BD, cola de jobs, tenancy y pruebas de carga — **BF-09** en `backlog-mejoras-post-piloto.md` · [#56](https://github.com/quintasc/taulamic/issues/56) (distinto de p95 del motor en ADR-023).

## Deuda diferida (acoplamiento entre features Nest)

La estructura `src/<feature>/` (ADR-015) es válida; hay **acoplamiento** que conviene tratar al evolucionar la API: Guest anclado en `guest-import`, distribution cruzado con events/floor-plans, permisos/auditoría entre application layers. Detalle y criterios — **BF-10** en `backlog-mejoras-post-piloto.md` · [#57](https://github.com/quintasc/taulamic/issues/57). **No** abrir refactor masivo sin feature/bug o sin acometer BF-09/RSVP/BD.

## Refactor oportunista UI (no proyecto aparte)

**Hecho:** Fase A — `distribution/page.tsx` orquesta vía `hooks/use-distribution-page.ts` (commit `5a080c3`).

**Pendiente — solo al tocar esa zona** (no abrir refactor masivo sin feature/bug):

| Si tocas… | Aprovecha para… |
|-----------|-----------------|
| Afinidades (`preferences-affinity-view.tsx`) | Extraer tipos/utils + hook de meta local (`event-ui-meta` / softRules); dejar la view como composición UI. **No** unificar aún persistencia API (deuda piloto aparte / #55). |
| Lista de mesas en distribución (`distribution-table-list.tsx`) | Partir DnD, sillas y storage local (`taulamic:*`) en hooks/libs. |
| Layout del plano (`floor-plan-layout-view.tsx` / `floor-plan-setup.ts`) | Separar canvas/DnD vs persistencia local; constantes de layout con nombre. |
| Pesos/umbrales CP-SAT | Nombrar literales mágicos al editar el motor. |
| Shims `@deprecated` sin imports | Borrar en el mismo PR. |

Alineado con `AGENTS.md` (anti-spaghetti + sin sobreingeniería) y ADR-021.

## Criterio tests (recordatorio)

Unit dominio · integration al tocar adaptadores · e2e = flujo SDD · contrato = OpenAPI. Detalle: `politica-validacion-tests-y-cobertura.md` § «Donde colocar cada tipo de test». Aplicar al tocar persistencia / #55 / motor — no reestructurar la suite en seco.

## Histórico — motor ADR-024 / sala (entregado 2026-07-17)

Referencia; no es el trabajo del día.

### Fase 1a / 1b (ADR-023 §2bis) — implementado

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

### UI / validación de entonces

| Área | Entrega |
|------|---------|
| Colores categoría | Lookup por índice ordenado (vista mesas + PDF) |
| Smokes | multi6 / elastic-kmin OK; scripts `validate-l3bis-pilot80.cjs`, etc. |
| E2E API | Respetan `DISTRIBUTION_ENGINE` (default CP-SAT) — `9d6fdb0` |

## Historial reciente

| Commit | Descripción |
|--------|-------------|
| `1c702c8` | docs: BF-10/#57 + refresco CONTEXTO |
| `664635d` | docs: reordena mapa `docs/README` |
| `4026d17` | docs: AGENTS canónico; rule estilo por globs |
| `24fe03e` | docs: BF-09 multi-usuario (#56) |
| `f1aea8a` | docs: Project post-piloto (#54/#55) |
| `7e31eed` | docs: deuda motor L2 en CONTEXTO |
| `5a080c3` | refactor(web): `useDistributionPage` |
| `3447809` | feat: ADR-024 L3bis / Fase 1a/1b |

## Referencias

- `ADR-023` §2bis · `ADR-024` §1bis / k_min C+E
- `guion-validacion-piloto-ui.md`
- `docs/pilot/README.md`
- `docs/README.md` (rutas rápidas)
- `github-project-sprint-10.md`
- `backlog-mejoras-post-piloto.md` (BF-07…BF-10)
- `politica-validacion-tests-y-cobertura.md` (colocación unit / integration / e2e / OpenAPI)
