/**
 * Reproduce el evento real excluyendo «Pareja» del agrupado L1.
 */
const fs = require('node:fs');
const path = require('node:path');
const {
  CpSatDistributionEngine,
} = require('../dist/distribution/domain/cp-sat-distribution.engine');
const {
  analyzeCategoryDistributions,
  effectiveCapacityForKMin,
  CATEGORY_TABLE_ELASTIC_EXTRA_SEATS,
  stripExcludedGroupingCategories,
  computeKMin,
} = require('../dist/distribution/domain/category-grouping');

const EVT = 'evt_ff6bc509-e6b3-4d6d-8ac3-ad2c2584c997';

async function main() {
  const root = path.join(__dirname, '..', 'uploads');
  const cfg = JSON.parse(
    fs.readFileSync(path.join(root, 'events', EVT, 'event-config.json'), 'utf8'),
  );
  const store = JSON.parse(
    fs.readFileSync(path.join(root, 'guests', EVT, 'event-guests.json'), 'utf8'),
  );
  const guests = store.guests;
  const catalog = (store.categories || []).map((c) => ({
    id: c.id,
    name: c.name,
  }));
  const nameById = new Map(catalog.map((c) => [c.id, c.name]));

  const started = Date.now();
  const result = await new CpSatDistributionEngine().compute({
    eventId: EVT,
    proposalId: 'repro',
    createdAt: new Date().toISOString(),
    tables: cfg.tables,
    guests,
    softRules: ['groupByCategory'],
    categoryCatalog: catalog,
    timeBudgetMs: 90_000,
  });
  console.log('status', result.solverStatus, 'ms', Date.now() - started);

  const stripped = stripExcludedGroupingCategories(guests, nameById);
  const analyses = analyzeCategoryDistributions(
    result.placements,
    stripped,
    effectiveCapacityForKMin(8, CATEGORY_TABLE_ELASTIC_EXTRA_SEATS),
  );

  for (const analysis of analyses) {
    const name = nameById.get(analysis.categoryId) || analysis.categoryId;
    const counts = [...analysis.countsByTable.values()].sort((a, b) => b - a);
    console.log(
      name,
      `N=${analysis.guestCount}`,
      `k=${analysis.kUsed}/${analysis.kMin}`,
      counts.join('+'),
    );
  }

  const trabajo = analyses.find(
    (a) => nameById.get(a.categoryId) === 'Trabajo',
  );
  const famNovio = analyses.find(
    (a) => nameById.get(a.categoryId) === 'Familia novio',
  );
  const okTrabajo =
    trabajo &&
    trabajo.kUsed === 2 &&
    [...trabajo.countsByTable.values()].sort((a, b) => b - a).join('+') ===
      '6+6';
  const okFam =
    famNovio &&
    famNovio.kUsed === 1 &&
    [...famNovio.countsByTable.values()][0] === 10;
  console.log('OK trabajo 6+6?', Boolean(okTrabajo));
  console.log('OK familia novio 10?', Boolean(okFam));
  if (!okTrabajo || !okFam) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
