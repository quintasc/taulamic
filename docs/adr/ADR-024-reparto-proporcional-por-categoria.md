# ADR-024 — Reparto proporcional por categoría (`groupByCategory`)

- **Estado:** Aceptado (PO 2026-07-08); **enmienda L3bis** aceptada PO 2026-07-17
- **Fecha:** 2026-07-08 (enmienda 2026-07-17)
- **Evoluciona:** interpretación operativa de `groupByCategory` en motor CP-SAT (`ADR-023` §2 Fase 1)
- **Afecta:** `SDD-01` §7.1–§7.2, HU-17, HU-05 (validación manual), `ADR-018` (toggle Afinidades), `ADR-022` (override manual)
- **Relacionado:** `ADR-012` (acompañantes), `ADR-009` (asientos — sin impacto directo en Fase 1)

## Contexto

El toggle **«Agrupar por categoría»** (`groupByCategory`) en la pantalla Afinidades se envía al motor como regla blanda con prioridad lexicográfica (`HU-17`, `soft-rules.ts`). El score post-hoc mide si cada invitado tiene **al menos un compañero de su categoría en la mesa** (`evaluateGroupByCategoryCriterion`).

Ese criterio es **necesario pero insuficiente**. Permite soluciones degeneradas que un organizador rechazaría de inmediato:

| Situación | Reparto | ¿Pasa score actual? | ¿Es aceptable? |
|-----------|---------|---------------------|----------------|
| 9 invitados categoría C, 2 mesas × 8 plazas | 8 + 1 | Sí (8/9 con compañero) | **No** — 1 huérfano y concentración absurda |
| Mismo caso | 5 + 4 | Sí (9/9) | **Sí** — equilibrado |
| 15 invitados categoría C | 8 en M17, 4 en M8, 1 en M2 (Sergio) | Sí (~93 %) | **No** — huérfano evitable y mesas dispersas |
| 15 invitados categoría C | 8 + 7 en 2 mesas | Sí | **Sí** — mínimo de mesas, sin huérfanos |

El caso **Sergio Arias** (categoría «Amigos novia», único de su categoría en M2 mientras M8 tiene hueco y otros de su categoría) ilustra el fallo: el motor prioriza cerrar mesas llenas y parejas de afinidad, pero **no penaliza** repartos desproporcionados de una misma categoría entre mesas.

**Expectativa del organizador** (validada en sesión 2026-07-08):

1. Las **reglas duras** son capacidad, afinidades/incompatibilidades explícitas y relaciones de pareja/familia por defecto (salvo excepción explícita) — ver marco acordado con PO.
2. **«Agrupar por categoría»**, cuando está activo, no debe limitarse a «evitar estar solo»: debe **repartir cada categoría de forma proporcional** entre el menor número de mesas posible, sin obligar a llenar mesas completas.

Este ADR define esa semántica sin sustituir el SDD §7.1; propone **enmienda** a §7.2 y al comportamiento del motor.

## Decisión

### 1. Semántica de `groupByCategory` cuando el toggle está activo

La regla se modela como **objetivo jerárquico de tres niveles** (lexicográfico), **subordinado siempre** a las reglas duras del SDD §7.1 y a la asignación de todos los invitados:

| Nivel | Objetivo | Descripción |
|-------|----------|-------------|
| **L1** | Minimizar mesas usadas por categoría | Cada categoría C debe ocupar el **menor número de mesas** posible compatible con §7.1 |
| **L2** | Reparto proporcional entre esas mesas | Los miembros de C en las k mesas elegidas deben quedar **lo más equilibrados posible** |
| **L3** | Anti-huérfano local | En cada mesa, los invitados de C son **0 o ≥ 2** (salvo \|C\| = 1 en todo el evento) |
| **L3bis** | Islas descolgadas (preferible / blanda) | Ver §1bis — no es dura ni «preferencia fuerte» |

**L3** es consecuencia de **L2** salvo casos límite; se explicita para validación manual y mensajes de error.

### 1bis. Enmienda PO 2026-07-17 — L3bis e islas (mesas de boda ~6–12)

**Supuesto de dominio:** capacidades típicas de boda (aprox. 6–12 plazas; elasticidad operativa ±2 sillas). Números fijos, no porcentajes.

| Símbolo | Valor | Significado |
|---------|-------|-------------|
| `L3_MIN` | 2 | Anti-huérfano duro/blando |
| `ISLAND_MAX` | 3 | Techo de «isla» |
| `LARGE_CATEGORY_MIN_N` | 6 | Umbral categoría grande |
| `SPLIT_MIN` | 3 | Preferible al partir categoría grande |
| `SPARSE_TABLE_MIN` | 6 | Mesa «muy vacía» por debajo |
| `ELASTIC_EXTRA` | 2 | Ya en motor CP-SAT |

**Predicado L3bis (`islandSoft`, v1):**

```
islandSoft(C,t) ⇔
  N_C ≥ 6
  ∧ 1 ≤ count(C,t) ≤ 3
  ∧ count(C,t) < N_C
  ∧ C no predomina en t
```

«C no predomina»: existe otra categoría C' en t con `count(C',t) > count(C,t)`. Empate (co-predominante) → **no** es isla.

**Qué no es L3bis:**

- Categoría pequeña (`N < 6`): integrar en mesa mixta es esperado; **no** se penaliza.
- Mesa propia con volumen suficiente (`ocupación ≥ 6` o categoría que llena sin verse muy vacía): **no** se penaliza por L3bis.
- Resolver una isla **creando un huérfano (count=1) en otra mesa**: **prohibido** (viola L3); no es remedio admisible.
- Categorías de metadato tipo **«Pareja» / «Parejas»** (columna Excel): **excluidas** de L1–L3; las parejas se modelan por `acompanante_key` (D3), no como etiqueta de reparto.

**Mezcla de categorías (preferencia PO):** mezclar dos categorías **grandes** (`N ≥ 6`) en la misma mesa es **admisible pero caro** — solo cuando L1 + elasticidad ±E no permiten mesas propias (p. ej. familia novio de 10 → una mesa C+2; trabajo de 12 → 6+6). No llenar huecos con otra categoría grande si se puede ampliar ±2 o repartir en bolsillos propios.

**Jerarquía de remedios (blanda, subordinada a duras y a L1–L2):**

1. Concentrar / equilibrar (L1–L2).
2. **Elasticidad ≤ +2** para absorber el resto con su categoría (preferible a la isla).
3. Partir la categoría grande en **2 bolsillos propios con tamaño local ≥ 3**.
4. Isla ≤3 descolgada en mesa ajena: **factible pero penalizada** (L3bis).

**HU-05:** el bloqueo duro sigue siendo solo huérfano **1** evitable. L3bis **no** bloquea movimientos (dúo/trío en mesa mixta).

**Dónde corre en el motor (`ADR-023` §2bis):**

| Pieza | Subfase |
|-------|---------|
| L1, L2, L3 duro | **Fase 1a** (capacidad rígida) |
| L3bis + elasticidad ±2 | **Fase 1b** (remedios; esqueleto de 1a) |
| Asientos S1…Sn | Fase 2 (sin cambio) |

Tras el refactor `ADR-023` §2bis, L3bis y elasticidad corren en **Fase 1b**; la Fase 1a mantiene capacidad rígida y L1–L3 duro.

### 1ter. Lo que no se exige (sin cambio)

- llenar mesas hasta la capacidad;
- concentrar **toda** una categoría en una sola mesa si \|C\| > capacidad efectiva (C+E).

**Packing / sillas vacías:** se toleran hasta **E vacías** (default 2) en una mesa usada sin penalizar el objetivo de ocupación — p. ej. dos mesas de 6 en mesas de 8. Más de E vacías sí se penaliza (suave).

### 2. Definición formal

Para una categoría C con N invitados asignados (N ≥ 2) y capacidad base de mesa C_max, con holgura elástica operativa E (default **2**, ADR-023 §2bis Fase 1b):

```
k_min(C) = ceil(N / (C_max + E))     // mínimo de mesas con capacidad efectiva
k_min_rígido(C) = ceil(N / C_max)    // usado en Fase 1a (capacidad sin elasticidad)
```

**Enmienda PO 2026-07-17 (bis):** la elasticidad ±E **sí puede** reducir el número de mesas respecto a `k_min_rígido` cuando cabe en C+E (p. ej. N=18, C_max=8, E=2 → **9+9** en 2 mesas; L1 final apunta a `k_min`, no a bloquear concentrar bajo el rígido).

En Fase **1a** el modelo sigue con capacidad rígida y empuja hacia `k_min_rígido`. En Fase **1b** (y en score/selección de propuesta) L1 usa `k_min` con C+E.

Para una solución con k mesas que contienen al menos un invitado de C, sea n₁, n₂, …, n_k el número de invitados de C en cada una (nᵢ ≥ 0, Σ nᵢ = N).

**Reparto proporcional válido** para fijar k = k_min(C):

```
∀i:  floor(N/k) ≤ nᵢ ≤ ceil(N/k)
```

Equivalente: la diferencia `max(nᵢ) - min(nᵢ)` ≤ 1.

**Ejemplos con N = 9, C_max = 8, k_min = 2:**

| (n₁, n₂) | Válido |
|----------|--------|
| (5, 4) o (4, 5) | Sí |
| (6, 3) | No (diferencia > 1) |
| (8, 1) | No |
| (9, 0) en una sola mesa | Imposible (supera C_max) |

**Ejemplos con N = 15, C_max = 8, k_min = 2:**

| Reparto | Válido |
|---------|--------|
| 8 + 7 | Sí |
| 8 + 4 + 3 en 3 mesas | No (k > k_min; usa más mesas de las necesarias salvo conflicto duro) |
| 8 + 1 + 6 dispersos | No |

Cuando **k_min** no es alcanzable por reglas duras (incompatibilidades, bloqueos), el motor debe:

1. usar el **mínimo k factible** > k_min, y
2. aplicar L2–L3 sobre ese k, y
3. **explicar** en la respuesta por qué no se alcanzó k_min (reutilizar patrón de `hardRuleViolations` / mensaje diagnóstico).

### 3. Relación con reglas duras y blandas

| Tipo | Reglas |
|------|--------|
| **Duras (siempre)** | Capacidad; incompatibilidades; acompañantes juntos por defecto (`ADR-012`); posición de asiento válida (Fase 2); accesibilidad obligatoria; bloqueos admin |
| **Jerárquicas si toggle activo** | `groupByCategory` L1 → L2 → L3 (este ADR) |
| **Blandas (toggles restantes)** | `keepFamiliesTogether`, `singlesTable`, `alternateGender`, etc. |
| **Blandas (score)** | Proximidad en silla, criterios adicionales HU-17 |

`separateKnownIncompatibles` sigue siendo **dura por construcción** en CP-SAT (`soft-rules.ts` devuelve `null`); el toggle en UI es informativo.

Las **afinidades/incompatibilidades explícitas** entre personas (± en Afinidades, o derivadas de pareja/familia) **dominan** a `groupByCategory`: no se relajan para mejorar el reparto de categoría.

### 4. Implementación prevista en CP-SAT (Fase 1)

Tras acordar este ADR, la implementación sustituirá el par de unidades genérico actual de `groupByCategory` por términos que reflejen L1–L3:

**L1 — Minimizar mesas por categoría**

- Variables indicador: mesa t «usada por categoría C».
- Penalizar (o restringir) ∑ₜ used(C, t) hacia k_min(C), con relajación si infactible.

**L2 — Equilibrio**

- Para cada categoría C y mesa t con used(C, t), acotar count(C, t) entre floor(N/k) y ceil(N/k) en la mejor k factible.
- Implementación práctica: minimizar `max(nᵢ) - min(nᵢ)` como objetivo secundario, o restricciones lineales con k fijado por búsqueda en dos pasos (primero minimizar k, luego equilibrar).

**L3 — Anti-huérfano**

- Restricción: si count(C, t) > 0 entonces count(C, t) ≥ 2, salvo \|C\| = 1.

**L3bis — Islas (blando) — preferible en Fase 1b**

- Penalizar `islandSoft(C,t)` con peso **moderado** (preferible, no lexicográficamente dominante sobre L1/L2 de 1a).
- Preferir pagar elasticidad ≤ +2 antes que aceptar la isla (**solo en 1b**).
- Soft adicional: en categoría grande, disuadir bolsillos locales de tamaño 1–2 al partir (`SPLIT_MIN = 3`).
- La elasticidad también puede usarse para alcanzar `k_min = ceil(N/(C+E))` (p. ej. dos mesas de 9 en lugar de 8+8+2).
- Tras el refactor `ADR-023` §2bis: **no** modelar L3bis ni elasticidad en 1a.

**Integración con `buildSoftRulePlan`**

- Cuando `groupByCategory` está en `softRules`, el plan incluirá términos de categoría con peso lexicográfico **superior** a `keepFamiliesTogether` y `singlesTable` **solo si** el orden en pantalla Afinidades lo indica (HU-17: posición 1 domina a 2).
- Si el organizador coloca otra regla por encima de «Agrupar por categoría», L1–L3 se aplican **después** de satisfacer esa prioridad (no se reescribe HU-17).

### 5. Score y UI

**Criterio `groupByCategory` en `evaluateDistributionScore`** se ampliará para reflejar L1–L3:

| Métrica | Cálculo |
|---------|---------|
| Mesas por categoría | k usado vs k_min |
| Equilibrio | max spread nᵢ - min nᵢ por categoría |
| Huérfanos | invitados sin compañero de categoría en mesa (L3) |
| Islas descolgadas | mesas con `islandSoft` (L3bis) |

El **detalle** en compatibilidad global y por mesa mostrará, por ejemplo:

> «Amigos novia: 2 mesas (mín. 2) · reparto 8+7 · 0 huérfanos · 0 islas descolgadas»

Si el reparto es subóptimo pero factible tras relajación:

> «Amigos novia: 3 mesas (mín. 2, relajado por incompatibilidad) · reparto desequilibrado · 1 huérfano · 1 isla descolgada (≤3)»

### 6. Mutaciones manuales (HU-05)

- **Bloquear** asignación/movimiento que deje a un invitado como **único** de su categoría en la mesa cuando exista alternativa factible que cumpla L3 (misma filosofía que incompatibilidad dura).
- **Advertir** si el movimiento empeora el equilibrio L2 sin violar L3 (override humano con warning, alineado con `ADR-022`).

### 7. Casos límite

| Caso | Comportamiento |
|------|----------------|
| \|C\| = 1 | Exento de L2–L3; puede ir solo en cualquier mesa |
| Categoría vacía en datos | Sin términos |
| Invitado sin categoría | Fuera del alcance de esta regla |
| Mezcla de categorías en una mesa | Permitida; L2–L3 se aplican **por categoría** de forma independiente |
| M8 con 2 «Otros» + 2 «Amigos novia» | Válido (cada categoría presente con ≥ 2) |
| Toggle `groupByCategory` desactivado | Sin L1–L3; comportamiento actual de reglas blandas restantes |

## Motivos de la decisión

- Convierte «agrupar por categoría» en una regla **comprensible y verificable**, no en un bonus opaco que permite 91 % con casos absurdos.
- Resuelve el caso Sergio **sin** ajuste manual obligatorio.
- No exige mesas completas ni una sola mesa por categoría.
- Encaja con CP-SAT (restricciones lineales + objetivo lexicográfico) dentro de `ADR-023`.
- Mantiene jerarquía: duras > categoría (si activa) > otras blandas.

## Consecuencias positivas

- El motor devuelve repartos que el organizador reconoce como razonables.
- Criterios de aceptación testeables (tablas de ejemplos N, k, nᵢ).
- Mensajes de diagnóstico cuando k_min no es alcanzable.

## Consecuencias negativas y riesgos

- Mayor complejidad del modelo CP-SAT Fase 1 (más variables por categoría × mesa).
- Posible aumento de tiempo de resolución; mitigación: límites anytime existentes (`ADR-023` §2).
- Puede entrar en conflicto con otras blandas de alta prioridad; el orden en Afinidades sigue siendo crítico (HU-17).
- Requiere **enmienda explícita** del SDD §7.2 y tests derivados antes de dar por cerrada la implementación.

## Criterios de aceptación (implementación)

1. Con `groupByCategory` activo y sin conflictos duros, para cada categoría C con N ≥ 2: k usado = k_min(C) y ∀i: floor(N/k) ≤ nᵢ ≤ ceil(N/k).
2. Escenario Sergio (evento piloto 80 inv., categoría «Amigos novia»): ningún miembro de C es único en su mesa si existe solución sin violar duras.
3. N = 9, 2 mesas × 8: el motor **no** devuelve reparto 8+1 para esa categoría.
4. N = 9: devuelve 5+4 (o 4+5) en dos mesas.
5. Con toggle desactivado, comportamiento de regresión igual al actual (sin L1–L3).
6. Score y `tableAffinityScores` reflejan mesas usadas, equilibrio y huérfanos por categoría.
7. Mutación manual que crea huérfano evitable: bloqueo 409 con mensaje claro.

## Impacto en documentos (pendiente de aprobación)

| Documento | Cambio propuesto |
|-----------|------------------|
| `SDD-01` §7.2 | Añadir: «Agrupar por categoría: reparto proporcional en el mínimo de mesas necesarias» |
| `SDD-02` HU-17 | Criterios de aceptación alineados con § Criterios de aceptación de este ADR |
| `ADR-023` | Referencia cruzada en Fase 1 objetivo |
| Tests API | `groupByCategory` spec + escenario 9 invitados / escenario anti-Sergio |

**Este ADR no modifica el SDD por sí solo.** La implementación en código debe esperar aprobación PO de este ADR y enmienda SDD asociada (regla de gobernanza `SDD-GOVERNANZA-PROTECCION-SDD.md`).

## Condiciones para revisar esta decisión

Reevaluar cuando:

- el tiempo de CP-SAT supere los KPI de `ADR-023` §6 por el tamaño del modelo de categorías,
- aparezcan categorías con cientos de miembros (eventos masivos),
- o el PO prefiera degradar L2 a blanda pura y mantener solo L3 como dura condicional.

## Comentarios para principiantes

- **k_min:** el mínimo de mesas que necesitas si repartes gente de la misma etiqueta sin pasarte de plazas por mesa.
- **Reparto proporcional:** si necesitas 2 mesas para 9 personas, 5+4 está bien; 8+1 no.
- **Lexicográfico:** primero se cumple lo más importante; solo entonces se optimiza lo siguiente.

## Resumen en lenguaje sencillo

Cuando «Agrupar por categoría» está encendido, el motor no se limita a evitar que alguien vaya solo: intenta usar **el menor número de mesas** para cada categoría y **repartir la gente de forma equilibrada** entre ellas (por ejemplo 5 y 4, no 8 y 1). Las parejas e incompatibilidades siguen mandando por encima. Si no puede, lo explica.

## Referencias

- `docs/adr/ADR-023-motor-cpsat-dos-fases-mesa-y-asiento.md`
- `docs/adr/ADR-018-preferencias-afinidades-y-flujo-setup.md`
- `docs/adr/ADR-022-override-manual-hu05-vs-reglas-duras.md`
- `docs/sdd/SDD-01-borrador-mvp.md` §7.1–§7.2
- `apps/api/src/distribution/domain/soft-rules.ts`
- `apps/api/src/distribution/domain/evaluate-distribution-score.ts`
- Caso de producto: Sergio Arias / categoría «Amigos novia», evento piloto `evt_ff372896-…`, 2026-07-08
