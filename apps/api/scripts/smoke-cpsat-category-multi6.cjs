// Simula evento piloto: 6 categorías, 80 invitados, keepFamiliesTogether.
// Ejecutar tras build: node scripts/smoke-cpsat-category-multi6.cjs

const {
  CpSatDistributionEngine,
} = require('../dist/distribution/domain/cp-sat-distribution.engine');
const {
  analyzeCategoryDistributions,
  tableCategoryMixingPenalty,
} = require('../dist/distribution/domain/category-grouping');

function guest(id, nombre, categoriaIds, acompananteKey = '') {
  return {
    id,
    eventId: 'evt-smoke',
    nombre,
    correo: `${id}@ejemplo.com`,
    telefono: '',
    direccion: '',
    categoriaIds,
    observaciones: '',
    acompananteKey,
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

const AMIGOS_NOVIA = 'cat-amigos-novia';
const AMIGOS_NOVIO = 'cat-amigos-novio';
const categories = [
  ['cat-trabajo', 12],
  ['cat-amigos-novio', 13],
  [AMIGOS_NOVIA, 15],
  ['cat-familia-novia', 16],
  ['cat-otros', 14],
  ['cat-familia-novio', 10],
];

const guests = [];
let pairIndex = 0;
for (const [catId, count] of categories) {
  for (let index = 0; index < count; index += 1) {
    const id = `${catId}-${index}`;
    let key = '';
    if (index % 2 === 0 && index + 1 < count) {
      key = `pareja_${pairIndex++}`;
    } else if (index % 2 === 1) {
      key = `pareja_${pairIndex - 1}`;
    }
    guests.push(guest(id, `${catId} ${index}`, [catId], key));
  }
}

const input = {
  eventId: 'evt-smoke',
  proposalId: 'dist-smoke',
  createdAt: new Date().toISOString(),
  tables: Array.from({ length: 15 }, (_, index) => ({
    id: `t${index}`,
    label: `M${index + 1}`,
    capacity: 8,
  })),
  guests,
  softRules: ['groupByCategory', 'keepFamiliesTogether'],
  timeBudgetMs: 120_000,
};

new CpSatDistributionEngine()
  .compute(input)
  .then((result) => {
    const failures = [];
    if (result.unassignedGuestIds.length > 0) {
      failures.push(`${result.unassignedGuestIds.length} sin asignar`);
    }

    const significant = new Set(categories.map(([id]) => id));
    const mixing = tableCategoryMixingPenalty(
      result.placements,
      guests,
      significant,
    );

    const tripleMix = new Map();
    const guestById = new Map(guests.map((entry) => [entry.id, entry]));
    for (const placement of result.placements) {
      const tableId = placement.tableId;
      const cats = tripleMix.get(tableId) ?? new Set();
      for (const catId of guestById.get(placement.guestId)?.categoriaIds ?? []) {
        if (significant.has(catId)) {
          cats.add(catId);
        }
      }
      tripleMix.set(tableId, cats);
    }
    const badTables = [...tripleMix.entries()].filter(
      ([, cats]) => cats.size >= 3,
    );

    const analyses = analyzeCategoryDistributions(
      result.placements,
      guests,
      8,
    );

    const amigosNovia = analyses.find((entry) => entry.categoryId === AMIGOS_NOVIA);
    const amigosNovio = analyses.find((entry) => entry.categoryId === AMIGOS_NOVIO);

    for (const [label, analysis, expectedSplit] of [
      ['amigos novia', amigosNovia, '8+7'],
    ]) {
      if (!analysis) {
        failures.push(`sin análisis ${label}`);
        continue;
      }
      const counts = [...analysis.countsByTable.values()].sort((a, b) => b - a);
      if (analysis.kUsed !== 2) {
        failures.push(`${label} k=${analysis.kUsed} (esperado 2)`);
      }
      if (counts.join('+') !== expectedSplit) {
        failures.push(
          `${label} reparto ${counts.join('+')} (esperado ${expectedSplit})`,
        );
      }
    }

    if (badTables.length > 0) {
      failures.push(`${badTables.length} mesa(s) con 3+ categorías`);
    }

    if (mixing > 350_000) {
      failures.push(`penalización mezcla ${mixing}`);
    }

    console.log(
      'amigos novia:',
      amigosNovia
        ? `${amigosNovia.kUsed} mesas · ${[...amigosNovia.countsByTable.values()].sort((a, b) => b - a).join('+')}`
        : '—',
    );
    console.log(
      'amigos novio:',
      amigosNovio
        ? `${amigosNovio.kUsed} mesas · ${[...amigosNovio.countsByTable.values()].sort((a, b) => b - a).join('+')}`
        : '—',
    );

    if (amigosNovio && amigosNovio.kUsed > amigosNovio.kMin) {
      console.warn(
        `AVISO: amigos novio fragmentado k=${amigosNovio.kUsed} (mín. ${amigosNovio.kMin})`,
      );
    }
    console.log('mesas 3+ cat:', badTables.length);
    console.log('mixing penalty:', mixing);

    if (failures.length > 0) {
      console.error(`FALLO multi6: ${failures.join('; ')}`);
      process.exit(1);
    }

    console.log(
      'OK: 6 categorías — amigos novia 8+7 y sin mesas triple-mix.',
    );
  })
  .catch((error) => {
    console.error('FALLO:', error);
    process.exit(1);
  });
