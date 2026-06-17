# ADR-014 - Evaluacion de algoritmos geneticos como estrategia complementaria

- Estado: Aceptado
- Fecha: 2026-06-17

## Contexto

El motor actual usa enfoque hibrido con SA + refinamiento opcional.
Existe la duda de si GA puede mejorar calidad/diversidad de propuestas.

## Decision

GA se evaluara como estrategia **complementaria**, no reemplazo inmediato.

Regla:

- SA permanece baseline para MVP.
- GA solo se adopta si demuestra mejora objetiva en benchmark.

## Motivos de la decision

- Evita cambiar motor por intuicion sin evidencia.
- Mantiene estabilidad de la ruta MVP.
- Permite innovar sin riesgo alto de regresion.

## Criterios de adopcion

- 0 violaciones de reglas duras.
- Mejora medible de calidad/diversidad Top-K frente a baseline.
- Coste temporal aceptable dentro de objetivos UX.

## Consecuencias positivas

- Decisiones tecnicas basadas en datos.
- Menor riesgo de complejidad prematura.

## Consecuencias negativas

- Requiere esfuerzo adicional de benchmarking.
- Puede retrasar adopcion de GA si no hay resultados claros.

## Condiciones para revisar esta decision

Reevaluar cuando:

- aparezcan nuevos requerimientos de calidad/diversidad,
- o GA demuestre mejora consistente en produccion controlada.

## Comentarios para principiantes

- **Complementaria:** se usa junto con otra estrategia, no en lugar de ella.
- **Benchmark:** pruebas comparativas repetibles para decidir con evidencia.
