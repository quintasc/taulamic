// Mesas homogéneas: 15 de una categoría → 2 mesas puras 8+7 (sin mezcla).
// Ejecutar tras build: node scripts/smoke-cpsat-category-purity.cjs

const {
  CpSatDistributionEngine,
} = require('../dist/distribution/domain/cp-sat-distribution.engine');
const {
  analyzeCategoryDistributions,
  tableCategoryMixingPenalty,
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

const amigosNovia = 'amigos novia';
const otros = 'otros';

const guests = [
  ...Array.from({ length: 15 }, (_, index) =>
    guest(`a${index}`, `Amigos ${index}`, [amigosNovia]),
  ),
  ...Array.from({ length: 65 }, (_, index) =>
    guest(`o${index}`, `Otros ${index}`, [otros]),
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

    const analysis = analyzeCategoryDistributions(
      result.placements,
      guests,
      8,
    ).find((entry) => entry.categoryId === amigosNovia);

    const mixing = tableCategoryMixingPenalty(
      result.placements,
      guests,
      new Set([amigosNovia, otros]),
    );

    if (!analysis) {
      failures.push('sin análisis amigos novia');
    } else {
      const counts = [...analysis.countsByTable.values()].sort((a, b) => b - a);
      if (analysis.kUsed !== 2) {
        failures.push(`k=${analysis.kUsed} en lugar de 2`);
      }
      if (counts.join('+') !== '8+7') {
        failures.push(`reparto ${counts.join('+')} en lugar de 8+7`);
      }
    }

    if (mixing > 50_000) {
      failures.push(`penalización mezcla ${mixing} (mesas muy fragmentadas)`);
    }

    if (failures.length > 0) {
      console.error(`FALLO pureza: ${failures.join('; ')}`);
      process.exit(1);
    }

    console.log('OK: 8+7 en 2 mesas homogéneas sin mezcla de categorías.');
  })
  .catch((error) => {
    console.error('FALLO:', error);
    process.exit(1);
  });
