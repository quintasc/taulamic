const {
  CpSatDistributionEngine,
} = require('../dist/distribution/domain/cp-sat-distribution.engine');
const {
  analyzeCategoryDistributions,
  effectiveCapacityForKMin,
  CATEGORY_TABLE_ELASTIC_EXTRA_SEATS,
  formatCategoryDistributionDetail,
} = require('../dist/distribution/domain/category-grouping');

function guest(id, nombre, cat, key = '') {
  return {
    id,
    eventId: 'e',
    nombre,
    correo: '',
    telefono: '',
    direccion: '',
    categoriaIds: [cat],
    observaciones: '',
    acompananteKey: key,
    separarAcompanante: null,
    companionSeparationReason: null,
    companionSeparationOrigin: null,
    companionSeparationAt: null,
    preferenciaControl: null,
    restrictions: [],
    createdAt: '2026-07-17T00:00:00.000Z',
    updatedAt: '2026-07-17T00:00:00.000Z',
  };
}

function addPaired(guests, prefix, cat, count) {
  let pair = 0;
  for (let i = 0; i < count; i += 1) {
    let key = '';
    if (i % 2 === 0 && i + 1 < count) {
      key = `${prefix}_p${pair}`;
      pair += 1;
    } else if (i % 2 === 1) {
      key = `${prefix}_p${pair - 1}`;
    }
    guests.push(guest(`${prefix}${i}`, `${cat} ${i}`, cat, key));
  }
}

async function main() {
  const guests = [];
  addPaired(guests, 't', 'trabajo', 12);
  addPaired(guests, 'fn', 'familia-novio', 10);
  addPaired(guests, 'an', 'amigos-novia', 15);
  addPaired(guests, 'o', 'otros', 14);
  addPaired(guests, 'fa', 'familia-novia', 16);
  addPaired(guests, 'ao', 'amigos-novio', 13);
  console.log('guests', guests.length);

  const started = Date.now();
  const result = await new CpSatDistributionEngine().compute({
    eventId: 'e',
    proposalId: 'p',
    createdAt: new Date().toISOString(),
    tables: Array.from({ length: 15 }, (_, i) => ({
      id: `t${i}`,
      label: `M${i + 1}`,
      capacity: 8,
    })),
    guests,
    softRules: ['groupByCategory', 'keepFamiliesTogether'],
    timeBudgetMs: 90_000,
  });
  console.log('status', result.solverStatus, 'ms', Date.now() - started);

  const analyses = analyzeCategoryDistributions(
    result.placements,
    guests,
    effectiveCapacityForKMin(8, CATEGORY_TABLE_ELASTIC_EXTRA_SEATS),
  );
  console.log(formatCategoryDistributionDetail(analyses));
  for (const analysis of analyses) {
    if (
      analysis.categoryId === 'trabajo' ||
      analysis.categoryId === 'familia-novio'
    ) {
      const counts = [...analysis.countsByTable.values()].sort((a, b) => b - a);
      console.log(
        analysis.categoryId,
        `k=${analysis.kUsed}/${analysis.kMin}`,
        counts.join('+'),
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
