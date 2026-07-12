// ADR-024: reparto proporcional por categoría (N=9 → 5+4, sin huérfanos).
// Ejecutar tras `npm run build`: node scripts/smoke-cpsat-category-grouping.cjs

const {
  CpSatDistributionEngine,
} = require('../dist/distribution/domain/cp-sat-distribution.engine');
const {
  analyzeCategoryDistributions,
} = require('../dist/distribution/domain/category-grouping');

function guest(id, nombre, categoriaIds) {
  return {
    id,
    eventId: 'evt-smoke',
    nombre,
    correo: `${id}@ejemplo.com`,
    telefono: '',
    direccion: '',
    categoriaIds,
    observaciones: '',
    acompananteKey: '',
    separarAcompanante: null,
    companionSeparationReason: null,
    companionSeparationOrigin: null,
    companionSeparationAt: null,
    preferenciaControl: null,
    restrictions: [],
    createdAt: '2026-07-08T00:00:00.000Z',
    updatedAt: '2026-07-08T00:00:00.000Z',
  };
}

const guests = Array.from({ length: 9 }, (_, index) =>
  guest(`g${index}`, `Invitado ${index}`, ['amigos']),
);

const input = {
  eventId: 'evt-smoke',
  proposalId: 'dist-smoke',
  createdAt: new Date().toISOString(),
  tables: [
    { id: 't1', label: 'Mesa 1', capacity: 8 },
    { id: 't2', label: 'Mesa 2', capacity: 8 },
  ],
  guests,
  softRules: ['groupByCategory'],
  timeBudgetMs: 15_000,
};

new CpSatDistributionEngine()
  .compute(input)
  .then((result) => {
    const counts = input.tables.map(
      (table) =>
        result.placements.filter((placement) => placement.tableId === table.id)
          .length,
    );
    counts.sort((left, right) => right - left);

    const failures = [];
    if (result.unassignedGuestIds.length > 0) {
      failures.push('hay invitados sin asignar');
    }
    if (result.solverStatus === 'INFEASIBLE') {
      failures.push('solver INFEASIBLE');
    }
    if (counts.join('+') !== '5+4') {
      failures.push(`reparto ${counts.join('+')} en lugar de 5+4`);
    }

    const [analysis] = analyzeCategoryDistributions(
      result.placements,
      guests,
      8,
    );
    if (analysis.orphanCount > 0) {
      failures.push(`${analysis.orphanCount} huérfano(s) con L3 duro`);
    }

    if (failures.length > 0) {
      console.error(`FALLO ADR-024: ${failures.join('; ')}`);
      process.exit(1);
    }

    console.log('OK: groupByCategory reparte 5+4 para N=9 sin huérfanos (ADR-024 L3).');
  })
  .catch((error) => {
    console.error('FALLO al ejecutar smoke ADR-024:', error);
    process.exit(1);
  });
