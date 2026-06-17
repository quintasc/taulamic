# ADR-007 - Conservacion de Top-K soluciones candidatas

- Estado: Aceptado
- Fecha: 2026-06-17

## Contexto

Antes de aprobar una distribucion final, el admin necesita comparar varias alternativas de alta calidad.
Guardar una sola propuesta reduce capacidad de decision y puede ocultar opciones casi igual de buenas.

## Decision

El sistema conservara las **K mejores soluciones validas** por evento antes de la aprobacion final.

- K es **parametrizable** por evento.
- Valor inicial recomendado: **K = 3**.
- Solo entran al ranking soluciones que cumplan reglas duras.

## Motivos de la decision

- Mejora calidad de decision del admin.
- Reduce necesidad de recalcular desde cero para ver alternativas.
- Mantiene control de rendimiento (K acotado y configurable).

## Reglas operativas

- Durante el calculo, se actualiza un ranking ordenado por score global de felicidad.
- Si llega una solucion mejor, puede desplazar a la peor del Top-K.
- Al aprobar, una de las candidatas pasa a `Aprobado`.
- El resto puede conservarse como historico de calculo (segun politica de retencion).

## Consecuencias positivas

- Mas control para organizadores.
- Menor friccion en fase de revision.
- Mejor trazabilidad del proceso de optimizacion.

## Consecuencias negativas

- Mayor uso de almacenamiento y metadatos de calculo.
- Necesita UI para comparar candidatas de forma clara.

## Condiciones para revisar esta decision

Reevaluar cuando:

- K por defecto no sea suficiente para usuarios avanzados,
- o el coste de guardar candidatas sea mayor de lo esperado.

## Comentarios para principiantes

- **Top-K:** guardar las K mejores opciones, no solo una.
- **Parametrizable:** configurable sin cambiar codigo.
- **Candidata valida:** opcion que cumple reglas obligatorias.
