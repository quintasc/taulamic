// Verifica la Fase 2 del ADR-023 (asiento intra-mesa): dado un grupo fijo en
// una mesa, la pareja de acompanantes queda en asientos adyacentes segun la
// topologia real de la forma de mesa.
// Ejecutar tras `npm run build`:  node scripts/smoke-cpsat-seats.cjs

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

// Mesa redonda de 8: una sola mesa fuerza a todos a compartirla, dejando
// que la fase 2 decida el asiento. Ana+Luis son pareja (keepTogether).
const input = {
  eventId: 'evt-smoke',
  proposalId: 'dist-seats',
  createdAt: new Date().toISOString(),
  tables: [{ id: 't1', label: 'Mesa 1', shape: 'redonda', capacity: 8 }],
  guests: [
    guest('g1', 'Ana', { acompananteKey: 'pareja-1' }),
    guest('g2', 'Luis', { acompananteKey: 'pareja-1' }),
    guest('g3', 'Carla'),
    guest('g4', 'David'),
    guest('g5', 'Elena'),
    guest('g6', 'Fran'),
  ],
};

function circularDistance(a, b, capacity) {
  const diff = Math.abs(a - b);
  return Math.min(diff, capacity - diff);
}

async function main() {
  const engine = new CpSatDistributionEngine();
  const result = await engine.compute(input);

  console.log(`solver fase 1: ${result.solverStatus}`);
  for (const p of result.placements) {
    console.log(`  ${p.guestName} -> ${p.tableLabel} / ${p.seatLabel ?? 'sin asiento'}`);
  }

  const ana = result.placements.find((p) => p.guestName === 'Ana');
  const luis = result.placements.find((p) => p.guestName === 'Luis');

  const failures = [];
  if (!ana?.seatIndex && ana?.seatIndex !== 0) failures.push('Ana sin asiento');
  if (!luis?.seatIndex && luis?.seatIndex !== 0) failures.push('Luis sin asiento');

  if (failures.length === 0) {
    const distance = circularDistance(ana.seatIndex, luis.seatIndex, 8);
    console.log(`distancia circular Ana-Luis: ${distance}`);
    if (distance !== 1) {
      failures.push(
        `Ana y Luis deberian quedar en asientos adyacentes (distancia 1), obtenido ${distance}`,
      );
    }
  }

  if (failures.length > 0) {
    console.error(`FALLO: ${failures.join('; ')}`);
    process.exit(1);
  }
  console.log('OK: Fase 2 coloca a la pareja en asientos adyacentes segun topologia.');
}

main().catch((error) => {
  console.error('FALLO smoke asientos:', error);
  process.exit(1);
});
