// Benchmark HU-19 (ADR-023 seccion 6): CP-SAT vs motor v0.
// Escenarios del SDD: pequeno 30-60, medio 60-140, grande 140-300 invitados.
// Ejecutar tras `npm run build`:  node scripts/benchmark-motor.cjs
//
// Metricas: violaciones de reglas duras (arbitro independiente), invitados
// asignados, tiempo por ejecucion (p50/p95/max) por motor y escenario.

const fs = require('node:fs');
const path = require('node:path');
const { runMotorV0 } = require('../dist/distribution/domain/motor-v0.engine');
const {
  CpSatDistributionEngine,
} = require('../dist/distribution/domain/cp-sat-distribution.engine');

const SCENARIOS = [
  { name: 'pequeno', minGuests: 30, maxGuests: 60, timeBudgetMs: 3000 },
  { name: 'medio', minGuests: 60, maxGuests: 140, timeBudgetMs: 8000 },
  { name: 'grande', minGuests: 140, maxGuests: 300, timeBudgetMs: 20000 },
];
const SEEDS = [1, 2, 3, 4, 5];
const COMPANION_RATIO = 0.35;
const INCOMPATIBILITY_RATIO = 0.05;
const CAPACITY_SLACK = 1.1;

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rand, min, max) {
  return min + Math.floor(rand() * (max - min + 1));
}

function buildScenario(scenario, seed) {
  const rand = mulberry32(seed * 7919);
  const guestCount = randInt(rand, scenario.minGuests, scenario.maxGuests);
  const now = new Date().toISOString();

  const guests = [];
  for (let i = 0; i < guestCount; i += 1) {
    guests.push({
      id: `g${String(i).padStart(4, '0')}`,
      eventId: 'evt-bench',
      nombre: `Invitado ${String(i).padStart(4, '0')}`,
      correo: '',
      telefono: '',
      direccion: '',
      categoriaIds: [],
      observaciones: '',
      acompananteKey: '',
      separarAcompanante: null,
      companionSeparationReason: null,
      companionSeparationOrigin: null,
      companionSeparationAt: null,
      preferenciaControl: null,
      restrictions: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  // Parejas de acompanantes (regla dura: juntos).
  const companionPairs = [];
  const pairCount = Math.floor((guestCount * COMPANION_RATIO) / 2);
  for (let p = 0; p < pairCount; p += 1) {
    const left = guests[p * 2];
    const right = guests[p * 2 + 1];
    left.acompananteKey = `pareja-${p}`;
    right.acompananteKey = `pareja-${p}`;
    companionPairs.push([left.id, right.id]);
  }

  // Incompatibilidades entre invitados sin pareja comun.
  const incompatiblePairs = [];
  const incompatibilityCount = Math.max(
    1,
    Math.floor(guestCount * INCOMPATIBILITY_RATIO),
  );
  let attempts = 0;
  while (incompatiblePairs.length < incompatibilityCount && attempts < 500) {
    attempts += 1;
    const a = guests[randInt(rand, 0, guestCount - 1)];
    const b = guests[randInt(rand, 0, guestCount - 1)];
    const samePair =
      a.acompananteKey !== '' && a.acompananteKey === b.acompananteKey;
    if (a.id === b.id || samePair) {
      continue;
    }
    const exists = incompatiblePairs.some(
      ([x, y]) =>
        (x === a.id && y === b.id) || (x === b.id && y === a.id),
    );
    if (exists) {
      continue;
    }
    a.restrictions.push({
      id: `r-${a.id}-${b.id}`,
      kind: 'incompatibilidad',
      targetHint: b.nombre,
      description: 'benchmark',
      origin: 'manual',
      suggestionId: null,
      createdAt: now,
    });
    incompatiblePairs.push([a.id, b.id]);
  }

  // Mesas con ~10% de holgura de capacidad.
  const tables = [];
  let capacity = 0;
  let t = 0;
  while (capacity < guestCount * CAPACITY_SLACK) {
    const tableCapacity = t % 2 === 0 ? 10 : 8;
    tables.push({
      id: `t${t}`,
      label: `Mesa ${t + 1}`,
      shape: t % 2 === 0 ? 'redonda' : 'rectangular',
      capacity: tableCapacity,
      createdAt: now,
      updatedAt: now,
    });
    capacity += tableCapacity;
    t += 1;
  }

  return { guests, tables, companionPairs, incompatiblePairs, guestCount };
}

/** Arbitro independiente: valida reglas duras contra la verdad del generador. */
function refereeViolations(data, result) {
  const violations = [];
  const tableByGuest = new Map();
  const occupancy = new Map();

  for (const placement of result.placements) {
    if (tableByGuest.has(placement.guestId)) {
      violations.push(`invitado duplicado: ${placement.guestId}`);
    }
    tableByGuest.set(placement.guestId, placement.tableId);
    occupancy.set(
      placement.tableId,
      (occupancy.get(placement.tableId) ?? 0) + 1,
    );
  }

  for (const table of data.tables) {
    const occupied = occupancy.get(table.id) ?? 0;
    if (occupied > table.capacity) {
      violations.push(
        `capacidad excedida en ${table.id}: ${occupied}/${table.capacity}`,
      );
    }
  }

  for (const [leftId, rightId] of data.companionPairs) {
    const leftTable = tableByGuest.get(leftId);
    const rightTable = tableByGuest.get(rightId);
    const bothPlaced = leftTable !== undefined && rightTable !== undefined;
    if (bothPlaced && leftTable !== rightTable) {
      violations.push(`pareja separada: ${leftId} / ${rightId}`);
    }
    if (leftTable === undefined !== (rightTable === undefined)) {
      violations.push(`pareja parcialmente asignada: ${leftId} / ${rightId}`);
    }
  }

  for (const [leftId, rightId] of data.incompatiblePairs) {
    const leftTable = tableByGuest.get(leftId);
    const rightTable = tableByGuest.get(rightId);
    if (leftTable !== undefined && leftTable === rightTable) {
      violations.push(`incompatibles juntos: ${leftId} / ${rightId}`);
    }
  }

  return violations;
}

function percentile(sortedValues, ratio) {
  const index = Math.min(
    sortedValues.length - 1,
    Math.ceil(ratio * sortedValues.length) - 1,
  );
  return sortedValues[Math.max(0, index)];
}

function summarize(runs) {
  const times = runs.map((run) => run.elapsedMs).sort((a, b) => a - b);
  return {
    runs: runs.length,
    assignedPct:
      Math.round(
        (runs.reduce((sum, run) => sum + run.assigned / run.total, 0) /
          runs.length) *
          1000,
      ) / 10,
    refereeViolations: runs.reduce(
      (sum, run) => sum + run.violations.length,
      0,
    ),
    p50Ms: percentile(times, 0.5),
    p95Ms: percentile(times, 0.95),
    maxMs: times[times.length - 1],
    statuses: [...new Set(runs.map((run) => run.solverStatus ?? 'n/a'))],
  };
}

async function main() {
  const cpSatEngine = new CpSatDistributionEngine();

  // Calentamiento: carga del modulo WASM fuera de las mediciones.
  const warmup = buildScenario(SCENARIOS[0], 99);
  const warmupStart = performance.now();
  await cpSatEngine.compute({
    eventId: 'evt-bench',
    proposalId: 'warmup',
    tables: warmup.tables,
    guests: warmup.guests,
    createdAt: new Date().toISOString(),
    timeBudgetMs: 3000,
  });
  const wasmLoadMs = Math.round(performance.now() - warmupStart);

  const report = { wasmWarmupMs: wasmLoadMs, scenarios: {} };

  for (const scenario of SCENARIOS) {
    const perEngine = { v0: [], cpsat: [] };

    for (const seed of SEEDS) {
      const data = buildScenario(scenario, seed);
      const baseInput = {
        eventId: 'evt-bench',
        proposalId: `bench-${scenario.name}-${seed}`,
        tables: data.tables,
        guests: data.guests,
        createdAt: new Date().toISOString(),
      };

      const v0Start = performance.now();
      const v0Result = runMotorV0(baseInput);
      const v0Elapsed = performance.now() - v0Start;
      perEngine.v0.push({
        seed,
        guestCount: data.guestCount,
        elapsedMs: Math.round(v0Elapsed * 100) / 100,
        assigned: v0Result.stats.assignedCount,
        total: data.guestCount,
        violations: refereeViolations(data, v0Result),
      });

      const cpStart = performance.now();
      const cpResult = await cpSatEngine.compute({
        ...baseInput,
        timeBudgetMs: scenario.timeBudgetMs,
      });
      const cpElapsed = performance.now() - cpStart;
      perEngine.cpsat.push({
        seed,
        guestCount: data.guestCount,
        elapsedMs: Math.round(cpElapsed * 100) / 100,
        assigned: cpResult.stats.assignedCount,
        total: data.guestCount,
        violations: refereeViolations(data, cpResult),
        solverStatus: cpResult.solverStatus,
      });
    }

    report.scenarios[scenario.name] = {
      timeBudgetMs: scenario.timeBudgetMs,
      guestCounts: perEngine.v0.map((run) => run.guestCount),
      v0: summarize(perEngine.v0),
      cpsat: summarize(perEngine.cpsat),
      detail: perEngine,
    };

    const { v0, cpsat } = report.scenarios[scenario.name];
    console.log(`\n=== Escenario ${scenario.name} ===`);
    console.log(`invitados por semilla: ${report.scenarios[scenario.name].guestCounts.join(', ')}`);
    console.log(
      `v0:     asignados ${v0.assignedPct}% | violaciones arbitro ${v0.refereeViolations} | p50 ${v0.p50Ms} ms | p95 ${v0.p95Ms} ms`,
    );
    console.log(
      `cp-sat: asignados ${cpsat.assignedPct}% | violaciones arbitro ${cpsat.refereeViolations} | p50 ${cpsat.p50Ms} ms | p95 ${cpsat.p95Ms} ms | estados ${cpsat.statuses.join(',')}`,
    );
  }

  const outDir = path.join(__dirname, '..', 'benchmarks');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'benchmark-cpsat-vs-v0.json');
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`\nCarga WASM (una vez): ${wasmLoadMs} ms`);
  console.log(`Informe completo: ${outFile}`);
}

main().catch((error) => {
  console.error('Benchmark fallido:', error);
  process.exit(1);
});
