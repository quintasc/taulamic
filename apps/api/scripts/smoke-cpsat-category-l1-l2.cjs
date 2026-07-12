// ADR-024 L1+L2 duros: 15 invitados de una categoría + relleno → 8+7 en 2 mesas.
// Ejecutar tras `npm run build`: node scripts/smoke-cpsat-category-l1-l2.cjs

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

const amigosNovia = 'amigos-novia';

const guests = [
  ...Array.from({ length: 15 }, (_, index) =>
    guest(`a${index}`, `Amigos novia ${index}`, [amigosNovia]),
  ),
  ...Array.from({ length: 65 }, (_, index) =>
    guest(`o${index}`, `Otros ${index}`, ['otros']),
  ),
];

const input = {
  eventId: 'evt-smoke',
  proposalId: 'dist-smoke',
  createdAt: new Date().toISOString(),
  tables: Array.from({ length: 10 }, (_, index) => ({
    id: `t${index}`,
    label: `M${index + 1}`,
    capacity: 8,
  })),
  guests,
  softRules: ['groupByCategory'],
  timeBudgetMs: 25_000,
};

new CpSatDistributionEngine()
  .compute(input)
  .then((result) => {
    const failures = [];
    if (result.unassignedGuestIds.length > 0) {
      failures.push('hay invitados sin asignar');
    }
    if (result.solverStatus === 'INFEASIBLE') {
      failures.push('solver INFEASIBLE');
    }

    const analysis = analyzeCategoryDistributions(
      result.placements,
      guests,
      8,
    ).find((entry) => entry.categoryId === amigosNovia);

    if (!analysis) {
      failures.push('sin análisis de amigos-novia');
    } else {
      const counts = [...analysis.countsByTable.values()].sort((a, b) => b - a);
      if (analysis.kUsed !== 2) {
        failures.push(
          `usa ${analysis.kUsed} mesas en lugar de 2 (mín. ${analysis.kMin})`,
        );
      }
      if (counts.join('+') !== '8+7') {
        failures.push(`reparto ${counts.join('+')} en lugar de 8+7`);
      }
      if (analysis.orphanCount > 0) {
        failures.push(`${analysis.orphanCount} huérfano(s)`);
      }
    }

    if (failures.length > 0) {
      console.error(`FALLO L1+L2: ${failures.join('; ')}`);
      process.exit(1);
    }

    console.log(
      'OK: groupByCategory concentra 15 invitados en 8+7 (ADR-024 L1+L2 duros).',
    );
  })
  .catch((error) => {
    console.error('FALLO al ejecutar smoke L1+L2:', error);
    process.exit(1);
  });
