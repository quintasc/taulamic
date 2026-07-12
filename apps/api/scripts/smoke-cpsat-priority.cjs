// Verifica la prioridad dinamica de reglas blandas (HU-17):
// invertir el orden de dos reglas en conflicto cambia la solucion.
// Ejecutar tras `npm run build`:  node scripts/smoke-cpsat-priority.cjs

const {
  CpSatDistributionEngine,
} = require('../dist/distribution/domain/cp-sat-distribution.engine');

function guest(id, nombre, overrides = {}) {
  return {
    id,
    eventId: 'evt-smoke',
    nombre,
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Conflicto: Ana comparte categoria con Bea, pero afinidad declarada con Carol.
// Mesas de 2: Ana solo puede compartir mesa con una de las dos.
const base = {
  eventId: 'evt-smoke',
  proposalId: 'dist-priority',
  createdAt: new Date().toISOString(),
  tables: [
    { id: 't1', label: 'Mesa 1', capacity: 2 },
    { id: 't2', label: 'Mesa 2', capacity: 2 },
  ],
  guests: [
    guest('g1', 'Ana', {
      categoriaIds: ['familia'],
      restrictions: [
        {
          id: 'r1',
          kind: 'afinidad',
          targetHint: 'Carol',
          description: '',
          origin: 'manual',
          suggestionId: null,
          createdAt: new Date().toISOString(),
        },
      ],
    }),
    guest('g2', 'Bea', { categoriaIds: ['familia'] }),
    guest('g3', 'Carol'),
    guest('g4', 'Dario'),
  ],
};

function tableOf(result, name) {
  return result.placements.find((p) => p.guestName === name)?.tableId;
}

async function main() {
  const engine = new CpSatDistributionEngine();

  const categoryFirst = await engine.compute({
    ...base,
    softRules: ['groupByCategory', 'keepFamiliesTogether'],
  });
  const familiesFirst = await engine.compute({
    ...base,
    softRules: ['keepFamiliesTogether', 'groupByCategory'],
  });

  const catSameTable = tableOf(categoryFirst, 'Ana') === tableOf(categoryFirst, 'Bea');
  const famSameTable = tableOf(familiesFirst, 'Ana') === tableOf(familiesFirst, 'Carol');

  console.log(
    `orden [categoria, familias]: Ana con ${catSameTable ? 'Bea (categoria)' : 'otra persona'}`,
  );
  console.log(
    `orden [familias, categoria]: Ana con ${famSameTable ? 'Carol (afinidad)' : 'otra persona'}`,
  );

  const failures = [];
  if (categoryFirst.solverStatus !== 'OPTIMAL') failures.push('caso 1 no OPTIMAL');
  if (familiesFirst.solverStatus !== 'OPTIMAL') failures.push('caso 2 no OPTIMAL');
  if (!catSameTable)
    failures.push('con categoria prioritaria, Ana deberia sentarse con Bea');
  if (!famSameTable)
    failures.push('con afinidad prioritaria, Ana deberia sentarse con Carol');
  if (categoryFirst.stats.assignedCount !== 4 || familiesFirst.stats.assignedCount !== 4)
    failures.push('todos los invitados deben quedar asignados');

  if (failures.length > 0) {
    console.error(`FALLO: ${failures.join('; ')}`);
    process.exit(1);
  }
  console.log('OK: la posicion de la regla en pantalla decide la prioridad.');
}

main().catch((error) => {
  console.error('FALLO smoke prioridad:', error);
  process.exit(1);
});
