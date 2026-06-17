# ADR-006 - Estrategia de optimizacion del motor de asignacion

- Estado: Aceptado
- Fecha: 2026-06-17

## Contexto

La asignacion de invitados a mesas con restricciones y preferencias es un problema de alta complejidad combinatoria.
Se necesita una estrategia gratuita, robusta y con tiempos de respuesta compatibles con buena UX.

## Decision

Se adopta una estrategia **hibrida** para el motor de asignacion:

1. Heuristica constructiva para generar solucion valida inicial.
2. Mejora con busqueda local + simulated annealing multi-arranque.
3. Refinamiento exacto opcional (Branch and Bound o CP-SAT) cuando:
   - el tamano del problema lo permita,
   - o se asigne mayor presupuesto de tiempo de calculo.

Adicionalmente:

- IA generativa **no** se usa como optimizador principal.
- IA generativa puede usarse solo para explicabilidad o asistencia textual.

## Motivos de la decision

- Balancea calidad, coste y rendimiento.
- Mantiene compatibilidad con stack actual y arquitectura worker.
- Evita tiempo explosivo de busqueda exhaustiva.
- Facilita evolucion futura hacia CP-SAT si fuera necesario.

## Consecuencias positivas

- Mejor tiempo de respuesta que enfoque exacto puro.
- Mejores resultados que heuristica simple.
- Estrategia escalable por fases sin ruptura de arquitectura.

## Consecuencias negativas

- No garantiza optimo global en todos los casos.
- Requiere calibrar pesos y parametros de metaheuristica.

## Condiciones para revisar esta decision

Reevaluar cuando:

- la calidad no alcance objetivos de negocio,
- los tiempos de calculo no cumplan KPIs,
- o se disponga de recursos para usar CP-SAT de forma mas extensa.

## KPIs de control recomendados

- Reglas duras violadas: 0.
- Tiempo p95 de calculo por tamano de evento.
- Score medio de satisfaccion por evento.
- Porcentaje de cambios manuales tras autoasignacion.

## Comentarios para principiantes

- **Hibrida:** combina varias tecnicas para aprovechar lo mejor de cada una.
- **Simulated annealing:** tecnica que explora soluciones evitando quedarse rapido en una mala.
- **CP-SAT:** solver de restricciones muy potente, gratuito y orientado a optimizacion.
