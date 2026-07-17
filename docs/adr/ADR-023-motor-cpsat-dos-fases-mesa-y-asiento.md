# ADR-023 - Motor CP-SAT en dos fases: asignación por mesa y asiento intra-mesa

- Estado: Aceptado (enmienda Fase 1a/1b PO 2026-07-17)
- Fecha: 2026-07-07 (enmienda 2026-07-17)
- Evoluciona: `ADR-006` (activa su condición de revisión sobre uso extenso de CP-SAT)
- Afecta: `ADR-007` (**Top-K diferido** a fase posterior; ver §3), `ADR-014` (queda sin efecto salvo reversión), `SDD-01` §16, HU-17, HU-18, HU-30
- Relacionado: `ADR-009` (topología de asientos), `SDD-PILOTO-enmienda-HU05-fase2c-sillas-distribucion-estrella.md` (§4: exclusión `placement.seatId` que este ADR resuelve)

## Contexto

La estrategia original del motor (`ADR-006`) preveía heurística constructiva + simulated annealing multi-arranque, con refinamiento exacto opcional (Branch and Bound o CP-SAT) y evaluación de algoritmos genéticos por benchmark (`ADR-014`). Ese propio ADR fijaba como condición de revisión "disponer de recursos para usar CP-SAT de forma más extensa". Al abordar HU-17 (función objetivo) y HU-18 (worker de optimización) se detectaron riesgos en construir un motor metaheurístico propio en TypeScript:

- Garantizar matemáticamente 0 violaciones de reglas duras en algoritmos estocásticos exige mecanismos de reparación/penalización complejos y propensos a bugs silenciosos.
- Diseñar y calibrar operadores de vecindad, enfriamiento e hiperparámetros consume recursos de producto sin aportar valor funcional directo.
- CP-SAT (Google OR-Tools) garantiza reglas duras por construcción, informa de la cota de optimalidad y permite explicar infactibilidades (requisito del SDD: explicar al admin por qué una regla no puede cumplirse).

Estado del producto en la fecha de esta decisión:

- El motor v0 (`motor-v0.engine.ts`) asigna greedy a nivel de **mesa** (capacidad, acompañantes juntos, incompatibilidades); `GuestPlacement` no tiene asiento.
- El piloto (Fase 2c) ya asigna invitados a sillas concretas S1…Sn, pero **solo en frontend** y sin reglas: `localStorage` (`taulamic:guestChairs:{eventId}`, `taulamic:presidentialChairs:{eventId}`). La enmienda dejó explícito que persistir el asiento en servidor requiere ADR dedicado.
- La API ya dispone de la topología de asientos por forma de mesa (`buildSeatTopology`: `adyacente`, `enfrente`, `mismo_lateral`) conforme a `ADR-009`.

Restricción del ecosistema: Google **no ofrece bindings oficiales de OR-Tools para Node.js en servidor** y ha declarado que no los planifica (issue google/or-tools#5017, abril 2026). Las vías disponibles son el paquete comunitario `or-tools-wasm` (WebAssembly, API TS que replica la de Python; joven, un mantenedor), los bindings nativos `@ortools-node/cp-sat` (en release candidate) o un worker Python con la librería oficial.

## Decisión

### 1. CP-SAT como motor principal de optimización

Se adopta CP-SAT (Google OR-Tools) como motor principal de la distribución automática. **No se construirán** los algoritmos simulated annealing ni genéticos previstos en `ADR-006`/`ADR-014`, salvo que CP-SAT falle la puerta de validación (ver §6).

### 2. Descomposición en dos fases

El problema se resuelve en dos fases encadenadas:

**Fase 1 - Global (invitado → mesa).** Un modelo CP-SAT con variables booleanas `x[invitado][mesa]`:

- Reglas duras del SDD §7.1 como restricciones: capacidad por mesa, incompatibilidades (`x[a][t] + x[b][t] <= 1`), acompañantes juntos (`x[a][t] == x[b][t]` salvo excepción `keepTogether: false`), bloqueos manuales de admin.
- Objetivo (HU-17): suma ponderada de términos blandos §7.2 agregados a nivel mesa (afinidades, preferencias de compañía y de tipo de mesa).
- Límite de tiempo (`maxTimeInSeconds`) con comportamiento *anytime*: se devuelve la mejor solución factible encontrada.

**Fase 2 - Local (invitado → asiento dentro de cada mesa).** Para cada mesa de la solución global, un subproblema exacto e independiente (mini-modelo CP-SAT o enumeración) que optimiza la colocación en asientos S1…Sn usando la topología de `ADR-009` (HU-30):

- Términos de proximidad por pareja: `adyacente` > `enfrente` > `mismo_lateral`, ponderados por afinidad.
- Sillas orientadas a mesa presidencial (estrella Fase 2c) como preferencia blanda cuando estén definidas.
- Ruptura de simetría rotacional en mesas circulares (fijar el asiento del primer invitado) para evitar exploración redundante.
- Cada subproblema tiene ≤ 12-50 personas, se resuelve en milisegundos y se paraleliza por mesa.

La descomposición sacrifica una optimalidad global teórica marginal (la fase 1 no ve matices de asiento al repartir entre mesas) a cambio de mantener el modelo global tratable y cumplir los KPIs de tiempo. Casi todo el valor de proximidad reside en compartir mesa; el refinamiento fino es intra-mesa.

### 2bis. Enmienda PO 2026-07-17 — Fase 1 en dos subfases (1a / 1b)

La Fase 1 (invitado → mesa) se descompone a su vez para aligerar tiempo y estabilizar el piloto (~80+ invitados), sin confundirse con la Fase 2 de asientos:

| Subfase | Objetivo | Incluye | Excluye (pasa a 1b) |
|---------|----------|---------|---------------------|
| **1a — Estructura** | Reparto base factible y estable | Capacidad **rígida** (sin elasticidad); duras §7.1; L1→L2; **L3 duro** (anti-huérfano ≥2); afinidades/packing esenciales | L3bis (islas); elasticidad ±2 |
| **1b — Remedios de sala** | Ajuste fino preferible | **L3bis** (islas ≤3 de categoría grande descolgada); **elasticidad ±2** para absorber restos **y** alcanzar `k_min` con C+E (p. ej. 9+9) | Reabrir el problema global completo |

**Contrato entre subfases:**

1. **1a** devuelve una asignación con capacidad base, `k` acorde a `k_min` cuando sea factible, y **0 huérfanos L3**.
2. **1b** parte de ese esqueleto (fijado o con libertad local acotada: pocas mesas/categorías) y solo aplica remedios: preferir +1/+2 sillas o reagrupar trozos ≥3 antes que islas ≤3 en mesa ajena.
3. **1b no puede** “arreglar” una isla creando un solo (sigue mandando L3).
4. La **Fase 2** (asientos) no cambia: corre sobre el resultado de 1a+1b.

**Motivo:** modelar islas (muchos booleanos categoría×mesa×tamaño) y elasticidad en el mismo CP-SAT que L1–L3 hincha el modelo y, con *anytime* `FEASIBLE`, degrada L2/`k_min` en escenarios piloto. Separar 1b reduce variables en 1a y concentra presupuesto en el matiz de sala.

**Estado de implementación:** Fase 1a/1b cableada en `CpSatDistributionEngine` (`tablePhase`: 1a = capacidad rígida + L1–L3 sin islas; 1b = L3bis + elasticidad ±2 con presupuesto reservado).

### 3. Top-K candidatas — **diferido** (decisión PO 2026-07-07)

El requisito de conservar K candidatas válidas (`ADR-007`, HU-21, default K=3) **queda pospuesto** a una fase posterior. Motivos:

- El valor inmediato del pivote a CP-SAT está en calidad de la propuesta única (reglas duras + HU-17 + Fase 2 asientos), no en comparar alternativas.
- Top-K multiplica el tiempo de cálculo (~K resoluciones con cortes de diversidad) y retrasa la activación del motor en producción.
- La UI de comparador visual (`SDD-01B`, HU-22) tampoco está implementada; sin ella, guardar K propuestas aporta poco al organizador.

**Comportamiento actual:** `POST /distribution/run` devuelve **una sola propuesta** (la mejor encontrada por CP-SAT dentro del presupuesto de tiempo). El organizador puede recalcular para obtener otra alternativa.

**Cuando se retome:** resoluciones sucesivas de la fase 1 con cortes de diversidad; fase 2 por candidata; persistencia de K propuestas; UI comparador. Requiere enmienda explícita del SDD que reactive HU-21/HU-22.

### 4. Contrato de asiento en API (cierra la exclusión de Fase 2c)

`GuestPlacement` se extiende con `seatIndex` y `seatLabel` (S1…Sn), persistidos en servidor. La asignación de sillas del piloto en `localStorage` migrará a este contrato; el ajuste manual HU-05 (drag a silla concreta) pasa a ser un override sobre la propuesta del motor, con las mismas reglas de advertencia/bloqueo de `ADR-022`.

### 5. Integración técnica y patrón Strategy

- Paquete: `or-tools-wasm` (WASM) en el worker Node previsto por `ADR-002`; el cálculo sigue siendo asíncrono (HU-06). WASM evita dependencia binaria C++ en el despliegue. Caveats: paquete ESM-only frente a build CommonJS de la API (cargar vía `import()` dinámico) y madurez comunitaria limitada.
- El motor se aísla tras un puerto `DistributionEngine` (patrón Strategy, ya recomendado en SDD-01 §14): `MotorV0Engine` (actual, fallback) y `CpSatDistributionEngine` conviven seleccionables por configuración. Si `or-tools-wasm` resulta inviable, el coste de sustituirlo (bindings nativos o worker Python) queda contenido en el adaptador.
- El motor v0 greedy se mantiene como fallback de seguridad y para degradación ante `INFEASIBLE`/error del solver.

### 6. Puerta de validación (preserva el principio de `ADR-014`)

CP-SAT no se declara motor principal en producción hasta superar el benchmark de HU-19 contra el motor v0 en los tres escenarios (30-60, 60-140, 140-300 invitados):

- 0 violaciones de reglas duras en todos los escenarios.
- p95 ≤ 3 s / 8 s / 20 s por tamaño, **incluyendo** fase de asientos (sin Top-K; ver §3).
- Score de satisfacción superior al v0 en escenarios con reglas blandas activas.

## Motivos de la decisión

- El KPI número uno del SDD (0 violaciones de reglas duras) queda garantizado por construcción del modelo, no por disciplina de ingeniería.
- Elimina el mayor esfuerzo de la HU-18 (diseño y calibrado de metaheurísticas propias); añadir una regla de negocio nueva es añadir una restricción declarativa.
- Aporta cota de optimalidad y diagnóstico de infactibilidad, alineado con la explicabilidad que exige el SDD.
- La descomposición en dos fases hace viable la asignación por asiento (visión producto post-Fase 2) dentro de los KPIs de tiempo.
- Coste cero de licencias (Apache 2.0), compatible con la arquitectura worker existente.

## Consecuencias positivas

- Cumplimiento garantizado de reglas duras y calidad medible (gap de optimalidad).
- Menos código propio de optimización que mantener; iteración más rápida de reglas.
- Asignación por asiento con topología real de mesa, hoy inexistente en el motor.
- Contrato de asiento persistido en servidor: elimina la divergencia `localStorage` vs API del piloto.

## Consecuencias negativas y riesgos

- Dependencia de un paquete comunitario joven (`or-tools-wasm`, mayo 2026, un mantenedor). Mitigación: puerto Strategy + fallback v0 + alternativas documentadas.
- Fricción ESM/CommonJS con la build NestJS actual.
- Curva de aprendizaje de modelado CP en el equipo; la función objetivo debe ser lineal (suma ponderada), lo que condiciona el diseño de HU-17.
- Riesgo de rendimiento si el grafo de afinidades es denso; mitigación: descomposición en dos fases, ruptura de simetría y límites de tiempo anytime.
- Pérdida marginal de optimalidad global por la descomposición mesa/asiento.

## Impacto en documentos y backlog (pendiente de enmienda SDD)

- `ADR-006`: evolucionado por este ADR (fases SA no se construyen).
- `ADR-014`: sin efecto; el benchmark GA vs SA se sustituye por CP-SAT vs motor v0 (HU-19).
- `ADR-007`: **diferido**; el motor entrega una propuesta hasta que se implemente HU-21.
- HU-18 pasa a leerse: "Implementar modelo CP-SAT en dos fases (mesa y asiento) en worker".
- La enmienda de `SDD-01` §16 y `SDD-02` (EP-08) requiere aprobación explícita conforme a la regla de gobernanza del SDD; este ADR la documenta pero no la ejecuta.

## Condiciones para revisar esta decisión

Reevaluar cuando:

- CP-SAT no supere la puerta de validación de §6 (reactivar ruta metaheurística de `ADR-006`),
- el paquete `or-tools-wasm` quede sin mantenimiento o bloquee upgrades de Node (migrar adaptador a bindings nativos o worker Python),
- o los eventos crezcan por encima de 300 invitados con afinidades densas y los p95 dejen de cumplirse.

## Comentarios para principiantes

- **CP-SAT:** solver gratuito de Google que encuentra la mejor solución que cumple todas las restricciones que le declares.
- **Descomposición en dos fases:** primero se decide la mesa de cada invitado (problema grande), después el asiento dentro de cada mesa (muchos problemas pequeños e independientes).
- **Corte de diversidad:** restricción que obliga a que la siguiente solución se diferencie de las anteriores, para que las K candidatas no sean casi iguales.
- **Anytime:** si se agota el tiempo, el solver devuelve la mejor solución válida encontrada hasta ese momento.
- **WASM (WebAssembly):** formato que permite ejecutar el solver C++ dentro de Node sin instalar binarios nativos.

## Resumen en lenguaje sencillo

En lugar de programar nosotros un algoritmo de mejora por prueba y error, usaremos un solver matemático gratuito de Google. Primero reparte a los invitados entre las mesas cumpliendo siempre las reglas obligatorias; después, mesa por mesa, decide qué silla ocupa cada persona para que los afines queden cerca. Por ahora devolvemos **una** propuesta (las K alternativas para comparar quedan para más adelante); el motor sencillo actual queda como red de seguridad. El benchmark HU-19 ya validó tiempos y 0 violaciones duras.

## Referencias

- `docs/adr/ADR-006-estrategia-optimizacion-motor-asignacion.md`
- `docs/adr/ADR-007-top-k-soluciones-candidatas.md`
- `docs/adr/ADR-009-forma-mesa-y-topologia-de-asientos.md`
- `docs/adr/ADR-014-evaluacion-ga-complementario.md`
- `docs/arquitectura/estudio-estrategia-optimizacion-asientos.md`
- `docs/arquitectura/comparativa-ga-sa-cpsat.md`
- `docs/sdd/SDD-PILOTO-enmienda-HU05-fase2c-sillas-distribucion-estrella.md`
- `apps/api/src/floor-plans/domain/build-seat-topology.ts`
- https://github.com/google/or-tools/issues/5017
- https://www.npmjs.com/package/or-tools-wasm
