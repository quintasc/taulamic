/**
 * Validación crítica L3 / L3bis — escenario piloto 80 invitados + Excel.
 *
 * Criterios duros (exit 1 si fallan):
 * - ≥80 invitados asignados
 * - 0 huérfanos L3 en categorías N≥2
 * - 0 islas L3bis (categoría grande descolgada ≤3 donde no predomina)
 * - ninguna categoría grande con k < k_min elástico (C+E; E=2)
 *
 * Criterios blandos (aviso, no fallan):
 * - amigos novia en 8+7
 * - spread ≤1 en categorías grandes
 *
 * Uso: node scripts/validate-l3bis-pilot80.cjs
 */

const path = require('node:path');
const fs = require('node:fs');
const ExcelJS = require('exceljs');
const {
  CpSatDistributionEngine,
} = require('../dist/distribution/domain/cp-sat-distribution.engine');
const {
  analyzeCategoryDistributions,
  formatCategoryDistributionDetail,
  CATEGORY_LARGE_MIN_N,
  CATEGORY_ISLAND_MAX,
  CATEGORY_TABLE_ELASTIC_EXTRA_SEATS,
  effectiveCapacityForKMin,
} = require('../dist/distribution/domain/category-grouping');

const COLUMNS = [
  'nombre',
  'correo',
  'telefono',
  'direccion',
  'categoria_1',
  'categoria_2',
  'menu_especial',
  'movilidad_reducida',
  'notas_internas',
  'acompanante_key',
  'separar_acompanante',
];

const CATEGORIES = [
  ['cat-trabajo', 'Trabajo', 12],
  ['cat-amigos-novio', 'Amigos novio', 13],
  ['cat-amigos-novia', 'Amigos novia', 15],
  ['cat-familia-novia', 'Familia novia', 16],
  ['cat-otros', 'Otros', 14],
  ['cat-familia-novio', 'Familia novio', 10],
];

const AMIGOS_NOVIA = 'cat-amigos-novia';
const RUNS = Number(process.env.VALIDATE_RUNS ?? 2);
const TIME_BUDGET_MS = Number(process.env.VALIDATE_TIME_MS ?? 180_000);

function guest(id, nombre, categoriaIds, acompananteKey = '') {
  return {
    id,
    eventId: 'evt-pilot80',
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
    createdAt: '2026-07-17T00:00:00.000Z',
    updatedAt: '2026-07-17T00:00:00.000Z',
  };
}

function buildGuests() {
  const guests = [];
  let pairIndex = 0;
  for (const [catId, , count] of CATEGORIES) {
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
  return guests;
}

async function writePilot80Xlsx(guests) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Invitados');
  sheet.addRow([...COLUMNS]);
  const labelById = new Map(CATEGORIES.map(([id, label]) => [id, label]));

  for (const entry of guests) {
    sheet.addRow([
      entry.nombre,
      entry.correo,
      '',
      '',
      labelById.get(entry.categoriaIds[0]) ?? entry.categoriaIds[0],
      '',
      '',
      '',
      '',
      entry.acompananteKey,
      '',
    ]);
  }

  const outPath = path.resolve(
    __dirname,
    '../../../docs/pilot/invitados-piloto-80.xlsx',
  );
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await workbook.xlsx.writeFile(outPath);
  return outPath;
}

function evaluateRun(result, guests) {
  const hard = [];
  const soft = [];

  if (result.unassignedGuestIds.length > 0) {
    hard.push(`${result.unassignedGuestIds.length} sin asignar`);
  }
  if (result.solverStatus === 'INFEASIBLE') {
    hard.push('solver INFEASIBLE');
  }

  const analyses = analyzeCategoryDistributions(
    result.placements,
    guests,
    effectiveCapacityForKMin(8, CATEGORY_TABLE_ELASTIC_EXTRA_SEATS),
  );

  for (const analysis of analyses) {
    const counts = [...analysis.countsByTable.values()].sort((a, b) => b - a);
    if (analysis.guestCount >= 2 && analysis.orphanCount > 0) {
      hard.push(
        `${analysis.categoryId}: ${analysis.orphanCount} huérfano(s) L3 (${counts.join('+')})`,
      );
    }
    if (
      analysis.guestCount >= CATEGORY_LARGE_MIN_N &&
      analysis.strandedIslandCount > 0
    ) {
      hard.push(
        `${analysis.categoryId}: ${analysis.strandedIslandCount} isla(s) L3bis ≤${CATEGORY_ISLAND_MAX} (${counts.join('+')})`,
      );
    }
    if (
      analysis.guestCount >= CATEGORY_LARGE_MIN_N &&
      analysis.kUsed < analysis.kMin
    ) {
      hard.push(
        `${analysis.categoryId}: k=${analysis.kUsed} < k_min=${analysis.kMin} (por debajo del k_min con C+E)`,
      );
    }
    if (
      analysis.guestCount >= CATEGORY_LARGE_MIN_N &&
      analysis.spread > 1
    ) {
      soft.push(
        `${analysis.categoryId}: spread=${analysis.spread} (${counts.join('+')})`,
      );
    }
  }

  const amigosNovia = analyses.find(
    (entry) => entry.categoryId === AMIGOS_NOVIA,
  );
  if (!amigosNovia) {
    hard.push('sin análisis amigos novia');
  } else {
    const counts = [...amigosNovia.countsByTable.values()].sort(
      (a, b) => b - a,
    );
    if (counts.join('+') !== '8+7' && counts.join('+') !== '7+8') {
      soft.push(`amigos novia reparto ${counts.join('+')} (ideal 8+7)`);
    }
  }

  return { hard, soft, analyses };
}

async function main() {
  const guests = buildGuests();
  if (guests.length < 80) {
    throw new Error(`Se esperaban ≥80 invitados, hay ${guests.length}`);
  }

  const xlsxPath = await writePilot80Xlsx(guests);
  console.log(`Excel: ${xlsxPath}`);
  console.log(
    `Validación: ${guests.length} invitados · ${RUNS} run(s) · budget ${TIME_BUDGET_MS} ms\n`,
  );

  let failedRuns = 0;

  for (let run = 1; run <= RUNS; run += 1) {
    console.log(`--- run ${run}/${RUNS} ---`);
    const started = Date.now();
    const result = await new CpSatDistributionEngine().compute({
      eventId: 'evt-pilot80',
      proposalId: `dist-pilot80-${run}`,
      createdAt: new Date().toISOString(),
      tables: Array.from({ length: 15 }, (_, index) => ({
        id: `t${index}`,
        label: `M${index + 1}`,
        capacity: 8,
      })),
      guests,
      softRules: ['groupByCategory', 'keepFamiliesTogether'],
      timeBudgetMs: TIME_BUDGET_MS,
    });
    const elapsedMs = Date.now() - started;
    const { hard, soft, analyses } = evaluateRun(result, guests);

    console.log(`solver=${result.solverStatus} · ${elapsedMs} ms`);
    console.log(formatCategoryDistributionDetail(analyses));
    if (soft.length > 0) {
      console.warn(`AVISOS: ${soft.join('; ')}`);
    }
    if (hard.length > 0) {
      failedRuns += 1;
      console.error(`FALLO duro: ${hard.join('; ')}`);
    } else {
      console.log('OK duros (L3 / L3bis / k≥k_min en categorías grandes)');
    }
    console.log('');
  }

  if (failedRuns > 0) {
    console.error(
      `FALLO validación L3bis piloto80: ${failedRuns}/${RUNS} run(s) con criterios duros rotos`,
    );
    process.exit(1);
  }

  console.log(
    `OK: ${RUNS}/${RUNS} runs — sin huérfanos L3, sin islas L3bis, sin k<k_min en categorías grandes.`,
  );
}

main().catch((error) => {
  console.error('FALLO:', error);
  process.exit(1);
});
