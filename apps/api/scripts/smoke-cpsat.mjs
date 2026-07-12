// Smoke test del solver CP-SAT (or-tools-wasm) — ADR-023.
// Ejecutar: node scripts/smoke-cpsat.mjs (desde apps/api)
// Modela 6 invitados / 2 mesas con pareja keepTogether e incompatibilidad.

import { CpModel, CpSolver, weightedSum } from 'or-tools-wasm/cp-sat';

const tables = [
  { label: 'Mesa 1', capacity: 4 },
  { label: 'Mesa 2', capacity: 3 },
];

// Unidades: pareja (Ana+Luis), y sueltos Carla, David, Elena, Fran.
// Incompatibilidad: Carla y David no pueden compartir mesa.
const units = [
  { name: 'Ana+Luis', size: 2 },
  { name: 'Carla', size: 1 },
  { name: 'David', size: 1 },
  { name: 'Elena', size: 1 },
  { name: 'Fran', size: 1 },
];
const incompatiblePairs = [[1, 2]];

const model = new CpModel();

const x = units.map((unit, u) =>
  tables.map((table, t) => model.newBoolVar(`x_${u}_${t}`)),
);

for (const unitVars of x) {
  model.addAtMostOne(unitVars);
}

tables.forEach((table, t) => {
  const tableVars = x.map((unitVars) => unitVars[t]);
  const sizes = units.map((unit) => unit.size);
  model.add(weightedSum(tableVars, sizes).le(table.capacity));
});

for (const [a, b] of incompatiblePairs) {
  tables.forEach((_, t) => {
    model.addAtMostOne([x[a][t], x[b][t]]);
  });
}

const allVars = x.flat();
const allSizes = units.flatMap((unit) => tables.map(() => unit.size));
model.maximize(weightedSum(allVars, allSizes));

const solver = new CpSolver();
solver.parameters.maxTimeInSeconds = 5;

const started = performance.now();
const status = await solver.solve(model);
const elapsedMs = Math.round(performance.now() - started);

console.log(`status: ${solver.statusName(status)} (${elapsedMs} ms)`);
console.log(`asignados: ${solver.objectiveValue()} de 6`);

units.forEach((unit, u) => {
  const t = tables.findIndex((_, index) => solver.booleanValue(x[u][index]));
  console.log(`  ${unit.name} -> ${t === -1 ? 'SIN MESA' : tables[t].label}`);
});

const carlaTable = tables.findIndex((_, i) => solver.booleanValue(x[1][i]));
const davidTable = tables.findIndex((_, i) => solver.booleanValue(x[2][i]));

if (solver.statusName(status) !== 'OPTIMAL') {
  console.error('FALLO: se esperaba estado OPTIMAL');
  process.exit(1);
}

if (solver.objectiveValue() !== 6) {
  console.error('FALLO: se esperaban 6 invitados asignados');
  process.exit(1);
}

if (carlaTable === davidTable) {
  console.error('FALLO: Carla y David comparten mesa (incompatibles)');
  process.exit(1);
}

console.log('OK: CP-SAT operativo, reglas duras respetadas.');
