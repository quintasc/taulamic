import type { Guest } from '../../guest-import/domain/guest';

import type { SoftRuleKind } from './distribution-engine.port';

import {

  buildCategoryGroupingPlans,

  type CategoryGroupingPlan,

} from './category-grouping';

import { areAffine, type PlacementUnit } from './placement-units';



/**

 * Prioridad dinamica de reglas blandas (HU-17, pantalla de afinidades):

 * el orden del array define prioridad lexicografica estricta. El peso de la

 * regla en posicion i se calcula para que su contribucion domine la suma

 * maxima de todas las reglas posteriores: nunca se sacrifica una regla mas

 * prioritaria para satisfacer otra menos prioritaria.

 */



/** Par de unidades que suma bonus si comparten mesa, con peso ya priorizado. */

export type PairTerm = {

  leftUnit: number;

  rightUnit: number;

  weight: number;

};



export type SoftRulePlan = {

  pairTerms: PairTerm[];

  /**

   * Peso por invitado asignado; domina la suma de todas las reglas blandas

   * (nunca compensa dejar a alguien sin mesa para ganar afinidad).

   */

  assignmentWeight: number;

  /** Reglas activas que el motor puede evaluar con los datos disponibles. */

  appliedRules: SoftRuleKind[];

  /** Reparto proporcional por categoría (ADR-024) cuando groupByCategory aplica. */

  categoryGrouping?: {

    plans: CategoryGroupingPlan[];

    lexWeight: number;

  };

};



type RulePairs = Map<string, number>;



type EvaluableRule =
  | {
      kind: 'groupByCategory';
      plans: CategoryGroupingPlan[];
      maxContribution: number;
    }
  | {
      kind: Exclude<SoftRuleKind, 'groupByCategory'>;
      pairs: RulePairs;
      maxContribution: number;
    };



export type BuildSoftRulePlanOptions = {

  maxTableCapacity: number;

  tableCount: number;

};



export function buildSoftRulePlan(

  units: PlacementUnit[],

  guestById: Map<string, Guest>,

  softRules: SoftRuleKind[],

  options: BuildSoftRulePlanOptions,

): SoftRulePlan {

  const membersByUnit = units.map((unit) =>

    unit.guestIds

      .map((guestId) => guestById.get(guestId))

      .filter((guest): guest is Guest => guest !== undefined),

  );



  const evaluableRules: EvaluableRule[] = [];



  for (const kind of softRules) {

    if (kind === 'groupByCategory') {

      const plans = buildCategoryGroupingPlans(

        units,

        guestById,

        options.maxTableCapacity,

      );

      if (plans.length > 0) {

        const maxContribution = plans.reduce(

          (sum, plan) =>

            sum +

            options.tableCount *

              (1 + Math.max(0, options.tableCount - 1) * CATEGORY_L2_SLOTS),

          0,

        );

        evaluableRules.push({

          kind: 'groupByCategory',

          plans,

          maxContribution,

        });

      }

      continue;

    }



    const pairs = buildRulePairs(kind, units, membersByUnit);

    if (pairs !== null) {

      evaluableRules.push({

        kind,

        pairs,

        maxContribution: sumValues(pairs),

      });

    }

  }



  const weights: number[] = new Array(evaluableRules.length).fill(1);

  for (let index = evaluableRules.length - 2; index >= 0; index -= 1) {

    let dominated = 0;

    for (let next = index + 1; next < evaluableRules.length; next += 1) {

      dominated +=

        weights[next] * evaluableRules[next].maxContribution;

    }

    weights[index] = dominated + 1;

  }



  const combined: RulePairs = new Map();

  let categoryGrouping: SoftRulePlan['categoryGrouping'];

  const appliedRules: SoftRuleKind[] = [];



  evaluableRules.forEach((rule, ruleIndex) => {

    appliedRules.push(rule.kind);



    if (rule.kind === 'groupByCategory') {

      categoryGrouping = {

        plans: rule.plans,

        lexWeight: weights[ruleIndex],

      };

      return;

    }



    for (const [key, multiplier] of rule.pairs) {

      combined.set(

        key,

        (combined.get(key) ?? 0) + multiplier * weights[ruleIndex],

      );

    }

  });



  let softTotal = 0;

  evaluableRules.forEach((rule, ruleIndex) => {

    softTotal += weights[ruleIndex] * rule.maxContribution;

  });



  const pairTerms: PairTerm[] = [...combined.entries()].map(

    ([key, weight]) => {

      const [leftUnit, rightUnit] = key.split(':').map(Number);

      return { leftUnit, rightUnit, weight };

    },

  );



  return {

    pairTerms,

    assignmentWeight: softTotal + 1,

    appliedRules,

    categoryGrouping,

  };

}



const CATEGORY_L2_SLOTS = 0.2;



/**

 * Devuelve pares de unidades relevantes para la regla, o null si la regla no

 * es evaluable por el motor (sin datos, o ya garantizada como regla dura).

 */

function buildRulePairs(

  kind: SoftRuleKind,

  units: PlacementUnit[],

  membersByUnit: Guest[][],

): RulePairs | null {

  switch (kind) {

    case 'groupByCategory':

      return null;

    case 'keepFamiliesTogether':

      return buildPairsByPredicate(units, membersByUnit, (left, right) =>

        areAffine(left, right),

      );

    case 'singlesTable':

      return buildSinglesPairs(units, membersByUnit);

    // Garantizada como regla dura por el modelo: sin terminos blandos.

    case 'separateKnownIncompatibles':

      return null;

    // Sin dato de edad/genero en piloto; alternateGender es de fase asiento.

    case 'groupByAge':

    case 'alternateGender':

      return null;

  }

}



function buildPairsByPredicate(

  units: PlacementUnit[],

  membersByUnit: Guest[][],

  matches: (left: Guest, right: Guest) => boolean,

): RulePairs {

  const pairs: RulePairs = new Map();



  for (let left = 0; left < units.length; left += 1) {

    for (let right = left + 1; right < units.length; right += 1) {

      let multiplier = 0;

      for (const leftGuest of membersByUnit[left]) {

        for (const rightGuest of membersByUnit[right]) {

          if (matches(leftGuest, rightGuest)) {

            multiplier += 1;

          }

        }

      }

      if (multiplier > 0) {

        pairs.set(`${left}:${right}`, multiplier);

      }

    }

  }



  return pairs;

}



function buildSinglesPairs(

  units: PlacementUnit[],

  membersByUnit: Guest[][],

): RulePairs {

  const singles: number[] = [];



  units.forEach((unit, index) => {

    if (unit.guestIds.length !== 1) {

      return;

    }

    const guest = membersByUnit[index][0];

    if (!guest) {

      return;

    }

    const hasCompanion = guest.acompananteKey.trim() !== '';

    const hasAffinity = guest.restrictions.some(

      (restriction) => restriction.kind === 'afinidad',

    );

    if (!hasCompanion && !hasAffinity) {

      singles.push(index);

    }

  });



  const pairs: RulePairs = new Map();

  for (let i = 0; i < singles.length; i += 1) {

    for (let j = i + 1; j < singles.length; j += 1) {

      pairs.set(`${singles[i]}:${singles[j]}`, 1);

    }

  }



  return pairs;

}



function sumValues(pairs: RulePairs): number {

  let total = 0;

  for (const value of pairs.values()) {

    total += value;

  }

  return total;

}

