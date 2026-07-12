// Verifica el CpSatDistributionEngine compilado (dist), incluida la carga
// dinamica del paquete ESM desde CommonJS. Ejecutar tras `npm run build`:
//   node scripts/smoke-cpsat-engine.cjs

const {
  CpSatDistributionEngine,
} = require('../dist/distribution/domain/cp-sat-distribution.engine');

function guest(id, nombre, acompananteKey = '', restrictions = []) {
  return { id, nombre, acompananteKey, restrictions };
}

const input = {
  eventId: 'evt-smoke',
  proposalId: 'dist-smoke',
  createdAt: new Date().toISOString(),
  tables: [
    { id: 't1', label: 'Mesa 1', capacity: 4 },
    { id: 't2', label: 'Mesa 2', capacity: 3 },
  ],
  guests: [
    guest('g1', 'Ana', 'pareja-1'),
    guest('g2', 'Luis', 'pareja-1'),
    guest('g3', 'Carla', '', [
      { kind: 'incompatibilidad', targetHint: 'David' },
    ]),
    guest('g4', 'David'),
    guest('g5', 'Elena'),
    guest('g6', 'Fran'),
  ],
};

new CpSatDistributionEngine()
  .compute(input)
  .then((result) => {
    console.log(`motor: ${result.motorVersion}`);
    console.log(`solver: ${result.solverStatus}`);
    console.log(`asignados: ${result.stats.assignedCount}/6`);
    for (const p of result.placements) {
      console.log(`  ${p.guestName} -> ${p.tableLabel}`);
    }

    const tableOf = (name) =>
      result.placements.find((p) => p.guestName === name)?.tableId;

    const failures = [];
    if (result.solverStatus !== 'OPTIMAL') failures.push('estado no OPTIMAL');
    if (result.stats.assignedCount !== 6) failures.push('no asigna a los 6');
    if (tableOf('Ana') !== tableOf('Luis'))
      failures.push('pareja separada (regla dura)');
    if (tableOf('Carla') === tableOf('David'))
      failures.push('incompatibles en la misma mesa (regla dura)');

    if (failures.length > 0) {
      console.error(`FALLO: ${failures.join('; ')}`);
      process.exit(1);
    }
    console.log('OK: CpSatDistributionEngine operativo con reglas duras.');
  })
  .catch((error) => {
    console.error('FALLO al ejecutar el motor CP-SAT:', error);
    process.exit(1);
  });
