// ADR-024 L3 duro: N=10 de una categoría en 20 mesas no debe dejar huérfanos locales.

// Ejecutar tras `npm run build`: node scripts/smoke-cpsat-category-l3.cjs



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



const familiaNovio = 'familia-novio';

const amigosNovio = 'amigos-novio';

const otros = 'otros';



const familiaGuests = Array.from({ length: 10 }, (_, index) =>

  guest(`f${index}`, `Familia ${index}`, [familiaNovio]),

);

const fillerGuests = Array.from({ length: 70 }, (_, index) =>

  guest(`x${index}`, `Filler ${index}`, [index % 2 === 0 ? amigosNovio : otros]),

);

const guests = [...familiaGuests, ...fillerGuests];



const input = {

  eventId: 'evt-smoke',

  proposalId: 'dist-smoke',

  createdAt: new Date().toISOString(),

  tables: Array.from({ length: 20 }, (_, index) => ({

    id: `t${index}`,

    label: `M${index + 1}`,

    capacity: 8,

  })),

  guests,

  softRules: ['groupByCategory', 'keepFamiliesTogether'],

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



    const familiaAnalysis = analyzeCategoryDistributions(

      result.placements,

      guests,

      8,

    ).find((entry) => entry.categoryId === familiaNovio);



    if (!familiaAnalysis) {

      failures.push('sin análisis de familia-novio');

    } else if (familiaAnalysis.orphanCount > 0) {

      failures.push(

        `${familiaAnalysis.orphanCount} huérfano(s) en familia-novio (reparto ${[...familiaAnalysis.countsByTable.values()].sort((a, b) => b - a).join('+')})`,

      );

    }



    if (failures.length > 0) {

      console.error(`FALLO L3: ${failures.join('; ')}`);

      process.exit(1);

    }



    console.log('OK: L3 duro evita huérfanos locales con N=10 (caso tipo Andrea).');

  })

  .catch((error) => {

    console.error('FALLO al ejecutar smoke L3:', error);

    process.exit(1);

  });

